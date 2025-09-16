from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Optional

@dataclass
class GeminiConfig:
    model: str = "gemini-2.5-flash"
    api_key_env: str = "GEMINI_API_KEY"


class GeminiClient:
    def __init__(self, config: Optional[GeminiConfig] = None) -> None:
        self.config = config or GeminiConfig()
        try:
            import google.generativeai as genai
        except Exception as exc:
            raise RuntimeError(
                "Missing or incompatible 'google-generativeai' package. Install with: pip install google-generativeai"
            ) from exc

        api_key = os.getenv(self.config.api_key_env)
        if not api_key:
            raise EnvironmentError(
                f"Environment variable {self.config.api_key_env} is not set.\n"
                f"Export it first, e.g.:\n\n    export {self.config.api_key_env}=test\n"
            )

        genai.configure(api_key=api_key)
        self._genai = genai
        self._model = genai.GenerativeModel(self.config.model)

    def generate_intern_task_report(self, system_prompt: str, resume_text: str, project_text: str) -> str:
        prompt = (
            f"System Prompt:\n{system_prompt}\n\n"
            f"PROJECT DOCUMENTATION (from PDF):\n{project_text}\n\n"
            f"INTERN RESUME (from PDF):\n{resume_text}"
        )

        response = self._model.generate_content(prompt)

        try:
            return response.text.strip()
        except Exception:
            return str(response).strip()


