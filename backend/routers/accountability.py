from fastapi import APIRouter, HTTPException
from backend.models.tracking import CheckInInput, CheckIn
from backend.models.responses import RelapseResponse
from backend.validators.input_validators import sanitize_text
from backend.services.gemini_service import gemini_service
from backend.utils.state import global_state
from typing import List

router = APIRouter(prefix="/accountability", tags=["accountability"])

@router.post("/checkin")
def add_checkin(payload: CheckInInput):
    notes_sanitized = sanitize_text(payload.notes) if payload.notes else None
    
    # Store check-in and update streak/points
    check_in = global_state.add_check_in(payload.status, notes_sanitized)
    
    state = global_state.get_state()
    habit_name = state.habit_name or "screen addiction"

    if payload.status == "slip_up":
        # Fetch relapse recovery response from Gemini
        variables = {
            "habit_name": habit_name,
            "slip_up_detail": notes_sanitized or "Felt overwhelmed and checked phone."
        }
        try:
            relapse_message = gemini_service.generate_text("relapse", variables)
        except Exception as e:
            relapse_message = "Remember, slip-ups are a natural part of growth. Take a deep breath and start fresh tomorrow!"

        return {
            "check_in": check_in,
            "recovery": RelapseResponse(
                message=relapse_message,
                next_steps=[
                    "Put the device in another room or out of sight.",
                    "Drink a glass of water and do 5 slow breaths.",
                    "Review your triggers analysis in the Insights dashboard."
                ]
            )
        }
    else:
        # Success check-in response
        return {
            "check_in": check_in,
            "message": "Awesome job! You're making real progress. Keep it up!"
        }

@router.get("/history", response_model=List[CheckIn])
def get_checkin_history():
    state = global_state.get_state()
    return state.check_ins
