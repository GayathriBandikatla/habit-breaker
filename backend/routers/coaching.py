from fastapi import APIRouter, HTTPException
from backend.models.responses import CoachingRequest, CoachingResponse
from backend.validators.input_validators import sanitize_text
from backend.services.gemini_service import gemini_service
from backend.utils.state import global_state
from typing import List, Dict

router = APIRouter(prefix="/coaching", tags=["coaching"])

@router.post("/chat", response_model=CoachingResponse)
def coaching_chat(request: CoachingRequest):
    # Sanitize user message
    sanitized_msg = sanitize_text(request.message)
    if not sanitized_msg:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    state = global_state.get_state()
    habit_name = state.habit_name or "habit"
    
    # Extract goals
    weekly_target = "reduce triggers"
    monthly_target = "establish control"
    severity_level = "Medium"
    if state.assessment:
        severity_level = state.assessment.severity_level
        weekly_target = state.assessment.recommended_goals.weekly_target
        monthly_target = state.assessment.recommended_goals.monthly_target

    # Format history
    history_str = ""
    for msg in state.chat_history:
        role_label = "User" if msg["role"] == "user" else "HabitBuddy"
        history_str += f"{role_label}: {msg['content']}\n"

    # Add user message to history
    global_state.add_chat_message("user", sanitized_msg)

    # Call Gemini service
    variables = {
        "habit_name": habit_name,
        "severity_level": severity_level,
        "weekly_target": weekly_target,
        "monthly_target": monthly_target,
        "chat_history": history_str,
        "user_message": sanitized_msg
    }

    try:
        reply = gemini_service.generate_text("coaching", variables)
        
        # Add assistant response to history
        global_state.add_chat_message("assistant", reply)
        
        return CoachingResponse(response=reply)
    except Exception as e:
        # Revert user message in case of failure to maintain correct history
        state.chat_history.pop()
        raise HTTPException(status_code=502, detail=f"Coaching service failed: {str(e)}")

@router.get("/history", response_model=List[Dict[str, str]])
def get_chat_history():
    return global_state.get_chat_history()
