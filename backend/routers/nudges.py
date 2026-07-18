from fastapi import APIRouter, HTTPException
from backend.models.responses import NudgeRequest, NudgeResponse
from backend.validators.input_validators import sanitize_text
from backend.services.gemini_service import gemini_service
from backend.utils.state import global_state
from datetime import datetime

router = APIRouter(prefix="/nudges", tags=["nudges"])

@router.post("/generate", response_model=NudgeResponse)
def generate_nudge(request: NudgeRequest):
    # Sanitize inputs
    mood = sanitize_text(request.triggers_or_mood)
    activity = sanitize_text(request.previous_activity)

    if not mood or not activity:
        raise HTTPException(status_code=400, detail="Mood and previous activity are required.")

    state = global_state.get_state()
    habit_name = state.habit_name or "screen addiction"

    variables = {
        "habit_name": habit_name,
        "current_time": datetime.now().strftime("%H:%M"),
        "triggers_or_mood": mood,
        "previous_activity": activity
    }

    try:
        nudge_json = gemini_service.generate_json("nudge", variables)
        return NudgeResponse(**nudge_json)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to generate nudge: {str(e)}")
