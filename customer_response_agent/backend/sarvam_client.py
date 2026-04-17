import json
import re
from typing import Iterable

import requests


class SarvamSupportClient:
    ANSWER_ONLY_SUFFIX = (
        "\n\nImportant: Return only the final customer-facing answer. "
        "Do not include reasoning, chain-of-thought, or <think> tags."
    )
    API_URL = "https://api.sarvam.ai/v1/chat/completions"

    def __init__(self, api_key: str, model: str):
        self.api_key = api_key
        self.model = model
        self.session = requests.Session()
        self.headers = {
            "API-Subscription-Key": api_key,
            "Content-Type": "application/json",
        } if api_key else None

    def generate_response(self, prompt: str, temperature: float, max_tokens: int) -> str:
        if not self.headers:
            raise ValueError("SARVAM_API_KEY is missing. Add it in backend/.env.")

        prompts_to_try = [prompt, f"{prompt}{self.ANSWER_ONLY_SUFFIX}"]

        for candidate_prompt in prompts_to_try:
            try:
                chunks = self._stream_chat_completion(
                    prompt=candidate_prompt,
                    temperature=temperature,
                    max_tokens=max_tokens,
                )
            except Exception:
                continue

            extracted = self._extract_stream_text(chunks)
            if extracted:
                return extracted

        return ""

    def _stream_chat_completion(self, prompt: str, temperature: float, max_tokens: int) -> Iterable[str]:
        payload = {
            "model": self.model,
            "messages": [
                {"role": "user", "content": prompt},
            ],
            "temperature": temperature,
            "top_p": 1,
            "stream": True,
            "reasoning_effort": "low",
            "max_tokens": max_tokens,
        }

        response = self.session.post(
            self.API_URL,
            headers=self.headers,
            json=payload,
            stream=True,
            timeout=90,
        )
        response.raise_for_status()

        for line in response.iter_lines():
            if not line:
                continue
            decoded = line.decode("utf-8")
            if not decoded.startswith("data: "):
                continue

            data = decoded[6:]
            if data == "[DONE]":
                break

            chunk = json.loads(data)
            yield self._extract_delta_text(chunk)

    @staticmethod
    def _extract_delta_text(chunk: dict) -> str:
        choices = chunk.get("choices") or []
        if not choices:
            return ""

        delta = choices[0].get("delta") or {}
        text = delta.get("content") or ""
        return text if isinstance(text, str) else str(text)

    def _extract_stream_text(self, chunks: Iterable[str]) -> str:
        text = "".join(chunk for chunk in chunks if chunk)
        return self._clean_text(text)

    @staticmethod
    def _clean_text(text: str) -> str:
        if not text:
            return ""

        cleaned = text.strip()

        if "</think>" in cleaned.lower():
            parts = re.split(r"</think>", cleaned, flags=re.IGNORECASE)
            cleaned = parts[-1].strip()

        if cleaned.lower().startswith("<think>") and "</think>" not in cleaned.lower():
            return ""

        cleaned = re.sub(r"</?think>", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"^\*\*response:\*\*\s*", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"^\s*response\s*:\s*", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)

        return cleaned.strip()
