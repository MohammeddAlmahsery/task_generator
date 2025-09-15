from typing import List


def extract_text_from_pdf(pdf_path: str) -> str:

    try:
        from pypdf import PdfReader
    except Exception as exc:
        raise RuntimeError(
            "Missing or incompatible 'pypdf' package. Install with: pip install pypdf"
        ) from exc

    reader = PdfReader(pdf_path)
    pages_text: List[str] = []

    for page in reader.pages:
        text = page.extract_text() or ""
        pages_text.append(text.strip())

    return "\n\n".join(pages_text).strip()


