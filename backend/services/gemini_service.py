import os
import json
import logging
import time
from typing import Dict, Any, Optional
import google.generativeai as genai
from google.api_core import exceptions as api_exceptions
from fastapi import HTTPException
from dotenv import load_dotenv

# Ensure environment variables are loaded
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))

logger = logging.getLogger(__name__)

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    logger.warning("GEMINI_API_KEY environment variable is not set!")
else:
    genai.configure(api_key=api_key)

class GeminiService:
    def __init__(self, model_name: str = "gemini-3.5-flash"):
        self.model_name = model_name

    def _load_prompt_template(self, prompt_name: str) -> str:
        """Loads a prompt template from backend/prompts/ directory."""
        current_dir = os.path.dirname(os.path.dirname(__file__))
        path = os.path.join(current_dir, "prompts", f"{prompt_name}.txt")
        try:
            with open(path, "r", encoding="utf-8") as f:
                return f.read()
        except FileNotFoundError:
            raise HTTPException(
                status_code=500,
                detail=f"Prompt template {prompt_name}.txt not found."
            )

    def generate_text(self, prompt_name: str, variables: Dict[str, Any], retries: int = 3, backoff: float = 1.0) -> str:
        """Generates simple text response from Gemini API."""
        if not os.getenv("GEMINI_API_KEY"):
            raise HTTPException(
                status_code=500,
                detail="GEMINI_API_KEY is missing. Please add the GEMINI_API_KEY environment variable in your Vercel project settings."
            )
        template = self._load_prompt_template(prompt_name)
        prompt_content = template.format(**variables)

        for attempt in range(retries):
            try:
                model = genai.GenerativeModel(self.model_name)
                response = model.generate_content(prompt_content)
                if not response.text:
                    raise ValueError("Empty response received from Gemini API.")
                return response.text.strip()
            except (api_exceptions.GoogleAPICallError, api_exceptions.RetryError, ValueError) as e:
                logger.warning(f"Gemini API error on attempt {attempt + 1}: {str(e)}")
                if attempt == retries - 1:
                    raise HTTPException(
                        status_code=502,
                        detail=f"Failed to generate text from Gemini API: {str(e)}"
                    )
                time.sleep(backoff * (2 ** attempt))
            except Exception as e:
                logger.error(f"Unexpected error calling Gemini API: {str(e)}")
                raise HTTPException(
                    status_code=500,
                    detail=f"Unexpected error: {str(e)}"
                )

    def generate_json(self, prompt_name: str, variables: Dict[str, Any], retries: int = 3, backoff: float = 1.0) -> Dict[str, Any]:
        """Generates structured JSON response from Gemini API."""
        if not os.getenv("GEMINI_API_KEY"):
            raise HTTPException(
                status_code=500,
                detail="GEMINI_API_KEY is missing. Please add the GEMINI_API_KEY environment variable in your Vercel project settings."
            )
        template = self._load_prompt_template(prompt_name)
        prompt_content = template.format(**variables)

        for attempt in range(retries):
            try:
                model = genai.GenerativeModel(self.model_name)
                # Call Gemini forcing JSON MIME type if supported by client, or parse from text
                response = model.generate_content(
                    prompt_content,
                    generation_config={"response_mime_type": "application/json"}
                )
                text = response.text
                if not text:
                    raise ValueError("Empty response from Gemini.")
                
                # Sanitize response text in case markdown blocks are present
                text_clean = text.strip()
                if text_clean.startswith("```json"):
                    text_clean = text_clean[7:]
                if text_clean.endswith("```"):
                    text_clean = text_clean[:-3]
                text_clean = text_clean.strip()

                return json.loads(text_clean)
            except (api_exceptions.GoogleAPICallError, api_exceptions.RetryError, ValueError, json.JSONDecodeError) as e:
                logger.warning(f"Gemini JSON generation error on attempt {attempt + 1}: {str(e)}")
                if attempt == retries - 1:
                    raise HTTPException(
                        status_code=502,
                        detail=f"Failed to generate valid JSON insights from Gemini: {str(e)}"
                    )
                time.sleep(backoff * (2 ** attempt))
            except Exception as e:
                logger.error(f"Unexpected error generating JSON from Gemini: {str(e)}")
                raise HTTPException(
                    status_code=500,
                    detail=f"Unexpected error: {str(e)}"
                )

# Global service instance
gemini_service = GeminiService()
