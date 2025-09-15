from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import Response

from text_extractor import extract_text_auto
from gemini_client import GeminiClient

app = FastAPI(title="Intern Task Report API")


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


