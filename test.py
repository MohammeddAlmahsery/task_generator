#!/usr/bin/env python3
import json
import os
from pathlib import Path
from typing import Any, Dict

import requests


BASE_URL = os.getenv("API_BASE_URL", "http://localhost:5000")
PROJECT_ROOT = Path(__file__).parent.resolve()
RESUME_PATH = PROJECT_ROOT / "cv.pdf"
PROJECT_DOC_PATH = PROJECT_ROOT / "project.txt"
OUTPUT_DIR = PROJECT_ROOT / "outputs"


def ensure_inputs_exist() -> None:
    if not RESUME_PATH.is_file():
        raise FileNotFoundError(f"Missing resume file: {RESUME_PATH}")
    if not PROJECT_DOC_PATH.is_file():
        raise FileNotFoundError(f"Missing project documentation file: {PROJECT_DOC_PATH}")


def ensure_output_dir() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def save_bytes(path: Path, content: bytes) -> None:
    path.write_bytes(content)
    print(f"Saved: {path}")


def save_json(path: Path, data: Dict[str, Any]) -> None:
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Saved: {path}")


def test_health() -> None:
    url = f"{BASE_URL}/health"
    print(f"GET {url}")
    resp = requests.get(url, timeout=30)
    print(f"Status: {resp.status_code}")
    try:
        print(resp.json())
    except Exception:
        print(resp.text)


def test_generate_markdown() -> None:
    url = f"{BASE_URL}/generate"
    print(f"POST {url}")
    with RESUME_PATH.open("rb") as f_resume, PROJECT_DOC_PATH.open("rb") as f_project:
        files = {
            "resume": (RESUME_PATH.name, f_resume, "application/pdf"),
            "project": (PROJECT_DOC_PATH.name, f_project, "text/plain"),
        }
        resp = requests.post(url, files=files, timeout=120)
    print(f"Status: {resp.status_code}")
    if resp.status_code == 200:
        save_bytes(OUTPUT_DIR / "intern_task_report.md", resp.content)
    else:
        print(resp.text)


def test_generate_task_json() -> Dict[str, Any]:
    url = f"{BASE_URL}/generate-task-json"
    print(f"POST {url}")
    with RESUME_PATH.open("rb") as f_resume, PROJECT_DOC_PATH.open("rb") as f_project:
        files = {
            "resume": (RESUME_PATH.name, f_resume, "application/pdf"),
            "project": (PROJECT_DOC_PATH.name, f_project, "text/plain"),
        }
        resp = requests.post(url, files=files, timeout=180)
    print(f"Status: {resp.status_code}")
    if resp.status_code != 200:
        print(resp.text)
        raise SystemExit("generate-task-json failed")
    data = resp.json()
    save_json(OUTPUT_DIR / "intern_task_report.json", data)
    return data


def test_refine_task_section(report_json: Dict[str, Any], section_name: str, instruction: str) -> Dict[str, Any]:
    url = f"{BASE_URL}/refine-task-section"
    print(f"POST {url} (section={section_name})")

    # Write the current report to temp file to upload as file param
    tmp_report_path = OUTPUT_DIR / "tmp_report_upload.json"
    tmp_report_path.write_text(json.dumps(report_json, ensure_ascii=False), encoding="utf-8")

    with RESUME_PATH.open("rb") as f_resume, PROJECT_DOC_PATH.open("rb") as f_project, tmp_report_path.open("rb") as f_report:
        files = {
            "resume": (RESUME_PATH.name, f_resume, "application/pdf"),
            "project": (PROJECT_DOC_PATH.name, f_project, "text/plain"),
            "intern_task_report_json": (tmp_report_path.name, f_report, "application/json"),
        }
        data = {
            "section_name_to_modify": section_name,
            "user_refinement_instruction": instruction,
        }
        resp = requests.post(url, files=files, data=data, timeout=180)

    print(f"Status: {resp.status_code}")
    if resp.status_code != 200:
        print(resp.text)
        raise SystemExit("refine-task-section failed")
    result = resp.json()
    out_name = (
        "refined_task_assignment.json" if section_name == "## Task Assignment" else f"refined_{section_name.replace('#', '').replace(' ', '_').lower()}.json"
    )
    save_json(OUTPUT_DIR / out_name, result)
    return result


def main() -> None:
    ensure_inputs_exist()
    ensure_output_dir()

    print("=== Testing /health ===")
    test_health()

    print("\n=== Testing /generate (markdown) ===")
    test_generate_markdown()

    print("\n=== Testing /generate-task-json ===")
    report = test_generate_task_json()

    print("\n=== Testing /refine-task-section for ## Task Assignment (general prompt) ===")
    report_after_task = test_refine_task_section(
        report_json=report,
        section_name="## Task Assignment",
        instruction="Make the task more specific and align with the intern's strongest skills.",
    )

    print("\n=== Testing /refine-task-section for ## Step-by-Step Plan (specific prompt) ===")
    _ = test_refine_task_section(
        report_json=report_after_task,
        section_name="## Step-by-Step Plan",
        instruction="Expand implementation steps with clearer milestones and test checkpoints.",
    )

    print("\nAll tests completed. See outputs/ for saved files.")


if __name__ == "__main__":
    main()


