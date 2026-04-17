import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List

import pandas as pd
from rank_bm25 import BM25Okapi


_WORD_RE = re.compile(r"[a-z0-9]+")


@dataclass
class PolicyDocument:
    title: str
    content: str


class BM25PolicyRetriever:
    def __init__(self, documents: List[PolicyDocument]):
        self.documents = documents
        tokenized = [self._tokenize(doc.content) for doc in documents]
        self.bm25 = BM25Okapi(tokenized)

    @staticmethod
    def _tokenize(text: str) -> List[str]:
        normalized = text.lower()
        return _WORD_RE.findall(normalized)

    @classmethod
    def from_dataset(cls, dataset_path: Path) -> "BM25PolicyRetriever":
        documents = load_policy_documents(dataset_path)
        if not documents:
            raise ValueError(f"No policy documents were loaded from {dataset_path}")
        return cls(documents)

    def search(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        query_tokens = self._tokenize(query)
        if not query_tokens:
            return []

        scores = self.bm25.get_scores(query_tokens)
        ranked_idx = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)

        results: List[Dict[str, Any]] = []
        for idx in ranked_idx[:top_k]:
            score = float(scores[idx])
            doc = self.documents[idx]
            results.append(
                {
                    "title": doc.title,
                    "content": doc.content,
                    "score": round(score, 4),
                }
            )
        return results


def load_policy_documents(dataset_path: Path) -> List[PolicyDocument]:
    suffix = dataset_path.suffix.lower()
    if suffix == ".json":
        return _load_from_json(dataset_path)
    if suffix in {".xlsx", ".xls"}:
        return _load_from_excel(dataset_path)
    raise ValueError(f"Unsupported dataset format: {dataset_path.suffix}")


def _load_from_json(path: Path) -> List[PolicyDocument]:
    with path.open("r", encoding="utf-8") as file:
        raw_items = json.load(file)

    docs: List[PolicyDocument] = []
    for item in raw_items:
        title = str(item.get("title", "Untitled Policy")).strip()
        content = str(item.get("content", "")).strip()
        if content:
            docs.append(PolicyDocument(title=title, content=content))
    return docs


def _load_from_excel(path: Path) -> List[PolicyDocument]:
    frame = pd.read_excel(path)
    frame = frame.fillna("")

    docs: List[PolicyDocument] = []
    for _, row in frame.iterrows():
        trouble = str(row.get("Trouble", "")).strip()
        category = str(row.get("Category", "General Policy")).strip() or "General Policy"
        solution = str(row.get("Solution", "")).strip()
        alt_solution = str(row.get("Alternate Solution", "")).strip()
        response = str(row.get("Company Response", "")).strip()

        chunks = [
            f"Issue: {trouble}" if trouble else "",
            f"Primary Policy Action: {solution}" if solution else "",
            f"Alternate Policy Action: {alt_solution}" if alt_solution else "",
            f"Approved Company Response: {response}" if response else "",
        ]

        content = "\n".join(part for part in chunks if part)
        if content:
            docs.append(PolicyDocument(title=category, content=content))
    return docs
