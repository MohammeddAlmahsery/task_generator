import argparse
import os
from pathlib import Path
from typing import Tuple

from text_extractor import extract_text_auto
from gemini_client import GeminiClient


def read_system_prompt(prompt_path: str) -> str:
    with open(prompt_path, "r", encoding="utf-8") as f:
        return f.read().strip()


def extract_inputs(resume_path: str, project_path: str) -> Tuple[str, str]:
    resume_text = extract_text_auto(resume_path)
    project_text = extract_text_auto(project_path)
    return resume_text, project_text


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate Intern Task Report using Gemini 2.5 Pro")
    parser.add_argument("--resume", required=True, help="Path to the intern resume (.txt/.docx/.pdf)")
    parser.add_argument("--project", required=True, help="Path to the project documentation (.txt/.docx/.pdf)")
    parser.add_argument(
        "--prompt",
        default=str(Path(__file__).with_name("prompt.md")),
        help="Path to system prompt markdown (default: prompt.md in project root)",
    )
    parser.add_argument(
        "--output",
        default=str(Path.cwd() / "intern_task_report.md"),
        help="Path to write the generated report (default: ./intern_task_report.md)",
    )

    args = parser.parse_args()

    # Validate inputs
    for file_path in [args.resume, args.project, args.prompt]:
        if not os.path.isfile(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

    system_prompt = read_system_prompt(args.prompt)
    resume_text, project_text = extract_inputs(args.resume, args.project)

    client = GeminiClient()
    report = client.generate_intern_task_report(system_prompt, resume_text, project_text)

    output_path = Path(args.output)
    output_path.write_text(report, encoding="utf-8")
    print(f"Report written to: {output_path}")


if __name__ == "__main__":
    main()


