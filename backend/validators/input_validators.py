import re
from fastapi import HTTPException

def sanitize_text(text: str) -> str:
    """
    Sanitize text input by removing HTML tags, script contents, and stripping surrounding whitespace.
    """
    if not text:
        return ""
    # Strip script tags and their contents completely
    clean = re.sub(r'<script\b[^>]*>([\s\S]*?)<\/script>', '', text, flags=re.IGNORECASE)
    # Strip other HTML tags
    clean = re.sub(r'<[^>]*>', '', clean)
    # Remove excessive whitespaces
    clean = re.sub(r'\s+', ' ', clean)
    return clean.strip()

def validate_habit_input(habit_name: str, frequency: str, triggers: str, impact: str, motivation: str):
    """
    Validates assessment inputs, raising HTTPException if any rules are violated.
    """
    sanitized_name = sanitize_text(habit_name)
    sanitized_freq = sanitize_text(frequency)
    sanitized_triggers = sanitize_text(triggers)
    sanitized_impact = sanitize_text(impact)
    sanitized_motivation = sanitize_text(motivation)

    if not sanitized_name or len(sanitized_name) < 2:
        raise HTTPException(status_code=400, detail="Habit name must be at least 2 characters.")
    if len(sanitized_name) > 100:
        raise HTTPException(status_code=400, detail="Habit name must be under 100 characters.")
        
    if not sanitized_freq or len(sanitized_freq) < 2:
        raise HTTPException(status_code=400, detail="Frequency must be at least 2 characters.")
        
    if not sanitized_triggers or len(sanitized_triggers) < 2:
        raise HTTPException(status_code=400, detail="Triggers must be at least 2 characters.")
        
    if not sanitized_impact or len(sanitized_impact) < 2:
        raise HTTPException(status_code=400, detail="Impact details must be at least 2 characters.")
        
    if not sanitized_motivation or len(sanitized_motivation) < 2:
        raise HTTPException(status_code=400, detail="Motivation level must be at least 2 characters.")

    return sanitized_name, sanitized_freq, sanitized_triggers, sanitized_impact, sanitized_motivation
