from fastapi import APIRouter, Request
from backend.utils.state import global_state
from backend.utils.limiter import limiter
from typing import List, Dict, Any

router = APIRouter(prefix="/gamification", tags=["gamification"])

@router.get("")
@limiter.limit("60/minute")
def get_gamification(request: Request):
    state = global_state.get_state()
    
    # Calculate progress toward next point milestone (e.g., 500, 1000)
    points = state.points
    next_level = 500
    if points >= 500:
        next_level = 1000
    if points >= 1000:
        next_level = 2000
        
    progress_percentage = min(100, int((points / next_level) * 100))
    
    # List of all possible badges for display/locked state comparison
    all_available_badges = [
        {"id": "onboarding_complete", "name": "Fresh Start", "description": "Completed habit assessment and set goals!", "reward_pts": 100},
        {"id": "streak_1", "name": "Day One Done", "description": "Completed your first check-in!", "reward_pts": 100},
        {"id": "streak_3", "name": "Consistent", "description": "Maintained a 3-day success streak!", "reward_pts": 100},
        {"id": "streak_7", "name": "Habit Breaker", "description": "A full week of resisting urges!", "reward_pts": 100},
        {"id": "resilience", "name": "Resilience Starter", "description": "Logged a slip-up. Recovery starts now!", "reward_pts": 100}
    ]

    earned_ids = {b.id for b in state.badges}
    badges_report = []
    for b in all_available_badges:
        earned = b["id"] in earned_ids
        earned_at = next((x.earned_at for x in state.badges if x.id == b["id"]), None)
        badges_report.append({
            "id": b["id"],
            "name": b["name"],
            "description": b["description"],
            "earned": earned,
            "earned_at": earned_at
        })

    return {
        "points": points,
        "next_level_points": next_level,
        "progress_percentage": progress_percentage,
        "badges": badges_report
    }

