from pathlib import Path
from typing import Optional
import os

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware

from text_extractor import extract_text_auto
from gemini_client import GeminiClient

app = FastAPI(title="Intern Task Report API")

# Liberal CORS for development / containerized local use. Adjust origins for production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Log a clear startup warning if no key is present (helps users notice before first /generate call)
if not (os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")):
    print("[WARN] No GEMINI_API_KEY or GOOGLE_API_KEY detected - operating in STUB mode.")


def _read_prompt(default_path: Optional[Path] = None) -> str:
    path = default_path or Path(__file__).with_name("prompt.md")
    if not path.is_file():
        raise HTTPException(status_code=500, detail=f"prompt.md not found at {path}")
    return path.read_text(encoding="utf-8").strip()


@app.post("/generate", response_class=Response)
async def generate(
    resume: UploadFile = File(...),
    project: UploadFile = File(...),
):
    if not resume.filename or not project.filename:
        raise HTTPException(status_code=400, detail="Both resume and project files are required")

    # Persist to temp files to reuse existing extractors
    tmp_dir = Path("/tmp")
    resume_path = tmp_dir / resume.filename
    project_path = tmp_dir / project.filename

    resume_bytes = await resume.read()
    project_bytes = await project.read()
    resume_path.write_bytes(resume_bytes)
    project_path.write_bytes(project_bytes)

    try:
        system_prompt = _read_prompt()
        resume_text = extract_text_auto(str(resume_path))
        project_text = extract_text_auto(str(project_path))

        # Accept either GEMINI_API_KEY or (legacy) GOOGLE_API_KEY for convenience.
        effective_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

        if not effective_key:
            # Graceful fallback stub (no external call) so UI can be verified without a key.
            report_md = (
                "# Intern Task Report (Development Stub)\n\n"
                "No GEMINI_API_KEY / GOOGLE_API_KEY detected in the container environment.\n\n"
                "## Usage\nSet an API key (export GEMINI_API_KEY=... or add to .env) and restart to get real model output.\n\n"
                "## Extracted Resume (first 400 chars)\n" + resume_text[:400] + ("...\n\n" if len(resume_text) > 400 else "\n\n") +
                "## Extracted Project Docs (first 400 chars)\n" + project_text[:400] + ("...\n\n" if len(project_text) > 400 else "\n\n") +
                "## Suggested Placeholder Tasks\n- Review project structure\n- Identify quick wins\n- Draft onboarding checklist\n"
            )
        else:
            # Real model invocation.
            client = GeminiClient()
            report_md = client.generate_intern_task_report(system_prompt, resume_text, project_text)
    finally:
        # Best-effort cleanup
        try:
            if resume_path.exists():
                resume_path.unlink()
        except Exception:
            pass
        try:
            if project_path.exists():
                project_path.unlink()
        except Exception:
            pass

    headers = {
        "Content-Disposition": 'attachment; filename="intern_task_report.md"'
    }
    return Response(content=report_md, media_type="text/markdown; charset=utf-8", headers=headers)


@app.get("/health")
async def health():
    """Liveness / readiness probe.

    model_available: True if an API key env var is present (not validated here)
    mode: "live" when a key is present and real model calls will be attempted, else "stub".
    """
    model_available = bool(os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY"))
    return {
        "status": "ok",
        "model_available": model_available,
        "mode": "live" if model_available else "stub"
    }


