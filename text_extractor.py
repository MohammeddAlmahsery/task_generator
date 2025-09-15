from pathlib import Path
from typing import List

from pdf_extractor import extract_text_from_pdf


def extract_text_from_txt(file_path: str) -> str:
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        return f.read().strip()


def extract_text_from_docx(file_path: str) -> str:
    try:
        from docx import Document  # python-docx
    except Exception as exc:
        raise RuntimeError(
            "Missing 'python-docx'. Install with: pip install python-docx"
        ) from exc

    document = Document(file_path)
    paragraphs: List[str] = [p.text for p in document.paragraphs]
    return "\n".join([p.strip() for p in paragraphs if p and p.strip()]).strip()


def extract_text_auto(file_path: str) -> str:
    suffix = Path(file_path).suffix.lower()
    if suffix == ".pdf":
        return extract_text_from_pdf(file_path)
    if suffix == ".txt":
        return extract_text_from_txt(file_path)
    if suffix == ".docx":
        return extract_text_from_docx(file_path)
    raise ValueError(
        f"Unsupported file type for '{file_path}'. Supported: .txt, .docx, .pdf"
    )


