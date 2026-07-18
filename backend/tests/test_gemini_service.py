import pytest
from unittest.mock import MagicMock, patch
from fastapi import HTTPException
from google.api_core import exceptions as api_exceptions
from backend.services.gemini_service import GeminiService

def test_load_prompt_template_success():
    service = GeminiService()
    template = service._load_prompt_template("assessment")
    assert "habit_name" in template

def test_load_prompt_template_not_found():
    service = GeminiService()
    with pytest.raises(HTTPException) as exc:
        service._load_prompt_template("nonexistent_prompt_template")
    assert exc.value.status_code == 500
    assert "not found" in exc.value.detail

@patch("google.generativeai.GenerativeModel")
def test_generate_text_success(mock_model_class):
    mock_model = MagicMock()
    mock_response = MagicMock()
    mock_response.text = "Hello from AI"
    mock_model.generate_content.return_value = mock_response
    mock_model_class.return_value = mock_model

    service = GeminiService()
    result = service.generate_text("coaching", {
        "habit_name": "Screen",
        "severity_level": "Low",
        "weekly_target": "Limit",
        "monthly_target": "Zero",
        "chat_history": "",
        "user_message": "Hi"
    })
    assert result == "Hello from AI"

@patch("google.generativeai.GenerativeModel")
def test_generate_text_failure(mock_model_class):
    mock_model = MagicMock()
    mock_model.generate_content.side_effect = ValueError("API Error")
    mock_model_class.return_value = mock_model

    service = GeminiService()
    with pytest.raises(HTTPException) as exc:
        service.generate_text("coaching", {
            "habit_name": "Screen",
            "severity_level": "Low",
            "weekly_target": "Limit",
            "monthly_target": "Zero",
            "chat_history": "",
            "user_message": "Hi"
        }, retries=1, backoff=0.01)
    assert exc.value.status_code == 502

@patch("google.generativeai.GenerativeModel")
def test_generate_json_success(mock_model_class):
    mock_model = MagicMock()
    mock_response = MagicMock()
    mock_response.text = '{"nudge_message": "Step away", "suggested_alternative": "Stretch", "urgency_level": "Low", "recovery_tip": "Breath"}'
    mock_model.generate_content.return_value = mock_response
    mock_model_class.return_value = mock_model

    service = GeminiService()
    result = service.generate_json("nudge", {
        "habit_name": "Screen",
        "current_time": "12:00",
        "triggers_or_mood": "Bored",
        "previous_activity": "Reading"
    })
    assert result["nudge_message"] == "Step away"

@patch("google.generativeai.GenerativeModel")
def test_generate_json_decode_error(mock_model_class):
    mock_model = MagicMock()
    mock_response = MagicMock()
    mock_response.text = 'invalid json content'
    mock_model.generate_content.return_value = mock_response
    mock_model_class.return_value = mock_model

    service = GeminiService()
    with pytest.raises(HTTPException) as exc:
        service.generate_json("nudge", {
            "habit_name": "Screen",
            "current_time": "12:00",
            "triggers_or_mood": "Bored",
            "previous_activity": "Reading"
        }, retries=2, backoff=0.01)
    assert exc.value.status_code == 502
