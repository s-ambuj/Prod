import logging
import os
import re
from pathlib import Path
from typing import Dict, List, Literal, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from retriever import BM25PolicyRetriever
from sarvam_client import SarvamSupportClient


class GenerateRequest(BaseModel):
    complaint: str = Field(..., min_length=3)
    mode: Literal["strict", "balanced", "friendly"] = "strict"
    temperature: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    max_tokens: Optional[int] = Field(default=None, ge=50, le=400)


class RetrievedDoc(BaseModel):
    title: str
    content: str
    score: float


class GenerateResponse(BaseModel):
    response: str
    mode: str
    prompt_used: str
    temperature: float
    max_tokens: int
    fallback_used: bool
    retrieved_docs: List[RetrievedDoc]


STRICT_PROMPT = """You are a professional customer support assistant.

Use ONLY the provided policy context.
Do not add extra assumptions.
Return only the final customer-facing answer.
Do not output reasoning, analysis, or <think> tags.

Context:
{docs}

Customer Issue:
{query}

Give a clear and concise response in 2-4 sentences.
Do not repeat the same point."""

FRIENDLY_PROMPT = """You are a polite and empathetic support agent.

Use the policy context but respond in a friendly tone.
Return only the final customer-facing answer.
Do not output reasoning, analysis, or <think> tags.

Context:
{docs}

Customer Issue:
{query}"""

BALANCED_PROMPT = """You are a customer support assistant.

Use the policy context to give a professional and neutral response.
Be accurate and concise.
Return only the final customer-facing answer.
Do not output reasoning, analysis, or <think> tags.

Context:
{docs}

Customer Issue:
{query}"""

FALLBACK_RESPONSE = "Please escalate this issue to a human support agent."

DEFAULT_PARAMS: Dict[str, Dict[str, float | int]] = {
    "strict": {"temperature": 0.2, "max_tokens": 150},
    "balanced": {"temperature": 0.5, "max_tokens": 180},
    "friendly": {"temperature": 0.7, "max_tokens": 200},
}


def format_docs(docs: List[dict]) -> str:
    lines: List[str] = []
    for i, doc in enumerate(docs, start=1):
        lines.append(f"[{i}] {doc['title']}")
        lines.append(doc["content"])
        lines.append("")
    return "\n".join(lines).strip()


def build_prompt(mode: str, query: str, docs: List[dict]) -> str:
    docs_text = format_docs(docs)
    if mode == "strict":
        template = STRICT_PROMPT
    elif mode == "friendly":
        template = FRIENDLY_PROMPT
    else:
        template = BALANCED_PROMPT
    return template.format(docs=docs_text, query=query)


def extract_approved_response(doc: dict) -> str:
    content = doc.get("content", "")
    match = re.search(r"Approved Company Response:\s*(.+)", content, flags=re.IGNORECASE | re.DOTALL)
    if match:
        return match.group(1).strip()
    return content.strip()


def policy_fallback_answer(docs: List[dict], mode: str) -> str:
    if not docs:
        return FALLBACK_RESPONSE

    base = extract_approved_response(docs[0])
    if not base:
        return FALLBACK_RESPONSE

    if mode == "friendly":
        return f"We are really sorry for the inconvenience. {base}"

    return base


def clean_generated_response(text: str) -> str:
    cleaned = (text or "").strip()
    cleaned = re.sub(r"^\*\*response:?\*\*\s*", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"^\s*tags\s*", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)

    sentences = re.split(r"(?<=[.!?])\s+", cleaned.strip())
    if len(sentences) > 4:
        cleaned = " ".join(sentences[:4]).strip()

    return cleaned.strip()


def is_unusable_response(text: str) -> bool:
    if not text:
        return True

    lowered = text.lower().strip()
    if lowered == FALLBACK_RESPONSE.lower():
        return True

    if lowered.startswith("please escalate this issue"):
        return True

    leakage_markers = [
        "so i should",
        "do not output reasoning",
        "customer-facing answer",
        "chain-of-thought",
        "analysis, or",
        "important:",
        "constraint",
        "customer issue:",
        "use only the provided policy context",
        "do not add extra assumptions",
        "analyze the user's request",
    ]
    if any(marker in lowered for marker in leakage_markers):
        return True

    return False


def resolve_dataset_path() -> Path:
    configured = os.getenv("DATASET_PATH", "../Complaint_Dataset.xlsx")
    backend_dir = Path(__file__).resolve().parent
    path = (backend_dir / configured).resolve()
    return path


def setup_logging() -> None:
    log_dir = Path(__file__).resolve().parent / "logs"
    log_dir.mkdir(parents=True, exist_ok=True)
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)s | %(message)s",
        handlers=[
            logging.FileHandler(log_dir / "app.log", encoding="utf-8"),
            logging.StreamHandler(),
        ],
    )


load_dotenv(Path(__file__).resolve().parent / ".env")
setup_logging()
logger = logging.getLogger("customer_response_agent")


dataset_path = resolve_dataset_path()
if not dataset_path.exists():
    raise FileNotFoundError(f"Dataset not found at: {dataset_path}")

retriever = BM25PolicyRetriever.from_dataset(dataset_path)

sarvam_client = SarvamSupportClient(
    api_key=os.getenv("SARVAM_API_KEY", ""),
    model=os.getenv("SARVAM_MODEL", "sarvam-105b"),
)

low_score_threshold = float(os.getenv("BM25_LOW_SCORE_THRESHOLD", "0.6"))

app = FastAPI(title="AI-Assisted Customer Support Response Generator")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health_check() -> dict:
    return {"status": "ok"}


@app.post("/api/generate", response_model=GenerateResponse)
def generate_reply(payload: GenerateRequest) -> GenerateResponse:
    query = payload.complaint.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Complaint cannot be empty.")

    retrieved_docs = retriever.search(query=query, top_k=3)
    top_score = retrieved_docs[0]["score"] if retrieved_docs else 0.0

    defaults = DEFAULT_PARAMS[payload.mode]
    temperature = payload.temperature if payload.temperature is not None else float(defaults["temperature"])
    max_tokens = payload.max_tokens if payload.max_tokens is not None else int(defaults["max_tokens"])

    fallback_used = (not retrieved_docs) or (top_score < low_score_threshold)

    if fallback_used:
        prompt_used = "No relevant policy found. Respond with: \"Please escalate this issue to a human support agent.\""
        response_text = FALLBACK_RESPONSE
    else:
        prompt_used = build_prompt(payload.mode, query, retrieved_docs)
        try:
            response_text = sarvam_client.generate_response(
                prompt=prompt_used,
                temperature=temperature,
                max_tokens=max_tokens,
            )
            response_text = clean_generated_response(response_text)
            if is_unusable_response(response_text):
                response_text = policy_fallback_answer(retrieved_docs, payload.mode)
                fallback_used = True
        except Exception as exc:
            logger.exception("Sarvam API call failed")
            response_text = policy_fallback_answer(retrieved_docs, payload.mode)
            fallback_used = True

    logger.info(
        "Query=%s | Mode=%s | Temp=%s | MaxTokens=%s | TopScore=%s | Fallback=%s | Prompt=%s | Docs=%s",
        query,
        payload.mode,
        temperature,
        max_tokens,
        round(top_score, 4),
        fallback_used,
        prompt_used,
        retrieved_docs,
    )

    return GenerateResponse(
        response=response_text,
        mode=payload.mode,
        prompt_used=prompt_used,
        temperature=temperature,
        max_tokens=max_tokens,
        fallback_used=fallback_used,
        retrieved_docs=[RetrievedDoc(**doc) for doc in retrieved_docs],
    )
