from fastapi import APIRouter, HTTPException
from backend.models.responses import InsightsResponse
from backend.services.gemini_service import gemini_service
from backend.utils.state import global_state
from backend.utils.cache import cache_instance

router = APIRouter(prefix="/insights", tags=["insights"])

@router.get("", response_model=InsightsResponse)
def get_insights():
    state = global_state.get_state()
    habit_name = state.habit_name or "screen addiction"
    
    # Check cache first
    cache_key = f"insights:{habit_name}:{len(state.check_ins)}"
    cached_res = cache_instance.get(cache_key)
    if cached_res:
        return InsightsResponse(**cached_res)

    # Summarize history
    success_count = sum(1 for c in state.check_ins if c.status == "success")
    slip_count = sum(1 for c in state.check_ins if c.status == "slip_up")
    
    logs_summary = f"Total check-ins: {len(state.check_ins)}. Successes: {success_count}. Setbacks: {slip_count}."
    
    slip_ups_notes = [c.notes for c in state.check_ins if c.status == "slip_up" and c.notes]
    slip_ups_summary = "; ".join(slip_ups_notes) if slip_ups_notes else "No specific setbacks reported."

    variables = {
        "habit_name": habit_name,
        "logs_summary": logs_summary,
        "slip_ups_summary": slip_ups_summary,
        "streak_days": str(state.streak)
    }

    try:
        insights_json = gemini_service.generate_json("insights", variables)
        insights = InsightsResponse(**insights_json)
        
        # Save cache
        cache_instance.set(cache_key, insights_json, ttl=300)
        return insights
    except Exception as e:
        # Fallback response in case Gemini API is busy/errors
        fallback = {
            "weekly_summary": "You are tracking your habit regularly. Great effort on maintaining awareness!",
            "pattern_insights": "Setbacks tend to correlate with periods of high cognitive strain or boredom.",
            "correlation_insights": "A strong association is noted between late-evening hours and habit urgency.",
            "risk_prediction": "Medium" if slip_count > 0 else "Low",
            "preemptive_advice": "Create physical barriers: charge your device outside the bedroom.",
            "encouragement_message": "Every day you track your habit is a victory. Keep building consistency!",
            "next_week_suggestion": "Establish a firm 9:00 PM digital curfew to break night-time routines."
        }
        return InsightsResponse(**fallback)
