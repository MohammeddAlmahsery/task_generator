from pathlib import Path
from typing import Optional
import os

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.responses import Response, JSONResponse
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


def _read_prompt(path: Optional[Path] = None) -> str:
    if path is None:
        path = Path(__file__).with_name("original_prompt.txt")
    if not path.is_file():
        raise HTTPException(status_code=500, detail=f"Prompt file not found at {path}")
    return path.read_text(encoding="utf-8").strip()


def _strip_code_fences(text: str) -> str:
    """Remove leading/trailing Markdown code fences such as ```json ... ``` or ``` ... ```.
    Keeps inner content intact.
    """
    s = text.strip()
    if s.startswith("```"):
        # remove first line fence (with optional language)
        newline_index = s.find("\n")
        if newline_index != -1:
            s = s[newline_index + 1 :]
        else:
            # text is only the fence; return empty
            return ""
    if s.endswith("```"):
        s = s[: s.rfind("```")]
    return s.strip()


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
            report_md = _strip_code_fences(report_md)
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


@app.post("/generate-task-json")
async def generate_task_json(
    resume: UploadFile = File(...),
    project: UploadFile = File(...),
):
    if not resume.filename or not project.filename:
        raise HTTPException(status_code=400, detail="Both resume and project files are required")

    tmp_dir = Path("/tmp")
    resume_path = tmp_dir / resume.filename
    project_path = tmp_dir / project.filename

    resume_bytes = await resume.read()
    project_bytes = await project.read()
    resume_path.write_bytes(resume_bytes)
    project_path.write_bytes(project_bytes)

    try:
        # Read prompt from original_prompt.txt located next to api.py
        prompt_path = Path(__file__).with_name("original_prompt.txt")
        system_prompt = _read_prompt(prompt_path)
        resume_text = extract_text_auto(str(resume_path))
        project_text = extract_text_auto(str(project_path))

        effective_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

        if not effective_key:
            # Stub JSON to enable UI without a key
            stub_json = {
                "## Project Overview": "Project Name: Example\nDocumentation Source: Uploaded File\n\nSummary:\nThis is a stub when no API key is configured.",
                "## Intern Profile": "Name: (from resume)\n\nBackground Summary:\n- ...",
                "## Task Assignment": "Task Title: Placeholder Task\n\nDescription:\n...\n\nObjective:\n...\n\nComplexity Level: Low\nExpected Duration: 2-3 days",
                "## Learning Opportunities": "- ...",
                "## Step-by-Step Plan": "1. Preparation Stage\n   - ...\n2. Exploration Stage\n   - ...\n3. Implementation Stage\n   - ...\n4. Testing & Feedback Stage\n   - ...\n5. Delivery Stage\n   - ...",
                "## Next Steps\n": "- ...",
                "## Resources & References\n": "- ...",
                "## Check List\n": "- [ ] ...",
            }
            return JSONResponse(content=stub_json, media_type="application/json")

        client = GeminiClient()
        raw = client.generate_json(
            system_prompt,
            {
                "PROJECT DOCUMENTATION": project_text,
                "INTERN RESUME": resume_text,
            },
        )
        # Try to parse model output as JSON; if it fails, return as-is string with 502
        import json
        try:
            payload = json.loads(_strip_code_fences(raw))
        except Exception:
            raise HTTPException(status_code=502, detail=f"Model did not return valid JSON:\n {raw}")

        headers = {"Content-Disposition": 'attachment; filename="intern_task_report.json"'}
        return JSONResponse(content=payload, media_type="application/json", headers=headers)
    finally:
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


@app.post("/refine-task-section")
async def refine_task_section(
    resume: UploadFile = File(...),
    project: UploadFile = File(...),
    intern_task_report_json: UploadFile = File(...),
    section_name_to_modify: str = Form(...),
    user_refinement_instruction: str = Form(...),
):
    # Save uploads
    tmp_dir = Path("/tmp")
    resume_path = tmp_dir / resume.filename
    project_path = tmp_dir / project.filename
    report_path = tmp_dir / intern_task_report_json.filename

    resume_path.write_bytes(await resume.read())
    project_path.write_bytes(await project.read())
    report_path.write_bytes(await intern_task_report_json.read())

    try:
        # Choose prompt file based on section name
        if section_name_to_modify.strip() == "## Task Assignment":
            prompt_path = Path(__file__).with_name("general_task_update_prompt.txt")
        else:
            prompt_path = Path(__file__).with_name("specific_task_update_prompt.txt")

        system_prompt = _read_prompt(prompt_path)

        # Extract text content
        resume_text = extract_text_auto(str(resume_path))
        project_text = extract_text_auto(str(project_path))
        try:
            report_json_text = report_path.read_text(encoding="utf-8")
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid or unreadable JSON report upload")

        effective_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        if not effective_key:
            # Minimal stub: echo the requested section modification as a placeholder JSON
            stub = {
                section_name_to_modify: f"[STUB MODE] {user_refinement_instruction}"
            }
            return JSONResponse(content=stub, media_type="application/json")

        client = GeminiClient()
        raw = client.generate_json(
            system_prompt,
            {
                "PROJECT DOCUMENTATION": project_text,
                "INTERN RESUME": resume_text,
                "INTERN TASK REPORT": report_json_text,
                "SECTION NAME TO MODIFY": section_name_to_modify,
                "USER REFINEMENT INSTRUCTION": user_refinement_instruction,
            },
        )

        import json
        try:
            payload = json.loads(_strip_code_fences(raw))
        except Exception:
            raise HTTPException(status_code=502, detail=f"Model did not return valid JSON:\n {raw}")

        headers = {"Content-Disposition": 'attachment; filename="intern_task_refined.json"'}
        return JSONResponse(content=payload, media_type="application/json", headers=headers)
    finally:
        for p in [resume_path, project_path, report_path]:
            try:
                if p.exists():
                    p.unlink()
            except Exception:
                pass


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


