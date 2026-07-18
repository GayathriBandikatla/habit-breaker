from fastapi import APIRouter, HTTPException, Depends, Request
from backend.models.tracking import HabitAssessmentInput, AssessmentResponse
from backend.validators.input_validators import validate_habit_input
from backend.services.gemini_service import gemini_service
from backend.utils.state import global_state
from backend.utils.limiter import limiter

router = APIRouter(prefix="/assessment", tags=["assessment"])

@router.post("", response_model=AssessmentResponse)
@limiter.limit("60/minute")
def create_assessment(request: Request, input_data: HabitAssessmentInput):
    # Validate and sanitize input
    name, freq, triggers, impact, motivation = validate_habit_input(
        input_data.habit_name,
        input_data.frequency,
        input_data.triggers,
        input_data.impact,
        input_data.motivation
    )

    try:
        # Call Gemini service to generate structured JSON report
        variables = {
            "habit_name": name,
            "frequency": freq,
            "triggers": triggers,
            "impact": impact,
            "motivation": motivation
        }
        assessment_json = gemini_service.generate_json("assessment", variables)
        
        # Validate that the response contains the fields we need
        assessment = AssessmentResponse(**assessment_json)
        
        # Save to global state
        global_state.set_habit(name, assessment)
        
        return assessment
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to generate assessment: {str(e)}")

@router.get("", response_model=AssessmentResponse)
@limiter.limit("60/minute")
def get_assessment(request: Request):
    state = global_state.get_state()
    if not state.assessment:
        raise HTTPException(status_code=404, detail="No assessment found. Please complete the assessment form first.")
    return state.assessment

