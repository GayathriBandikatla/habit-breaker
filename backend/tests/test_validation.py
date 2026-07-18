import pytest
from fastapi import HTTPException
from backend.validators.input_validators import sanitize_text, validate_habit_input

def test_sanitize_text():
    assert sanitize_text("<script>alert('xss')</script> Hello") == "Hello"
    assert sanitize_text("  hello    world   ") == "hello world"
    assert sanitize_text("<b>Bold</b> text") == "Bold text"
    assert sanitize_text(None) == ""

def test_validate_habit_input_success():
    name, freq, trig, imp, mot = validate_habit_input(
        "Screen Time", "10 times/day", "Boredom", "Affects sleep", "High"
    )
    assert name == "Screen Time"
    assert freq == "10 times/day"
    assert trig == "Boredom"
    assert imp == "Affects sleep"
    assert mot == "High"

def test_validate_habit_input_failures():
    # Habit name too short
    with pytest.raises(HTTPException) as exc:
        validate_habit_input("", "Daily", "Boredom", "Bad sleep", "High")
    assert exc.value.status_code == 400
    
    # Habit name too long
    with pytest.raises(HTTPException) as exc:
        validate_habit_input("a" * 101, "Daily", "Boredom", "Bad sleep", "High")
    assert exc.value.status_code == 400

    # Frequency too short
    with pytest.raises(HTTPException) as exc:
        validate_habit_input("Screen", "a", "Boredom", "Bad sleep", "High")
    assert exc.value.status_code == 400
