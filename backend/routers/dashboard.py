from fastapi import APIRouter
from backend.models.responses import DashboardResponse
from backend.utils.state import global_state

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("", response_model=DashboardResponse)
def get_dashboard():
    state = global_state.get_state()
    
    # Calculate success rate
    check_ins = state.check_ins
    check_ins_count = len(check_ins)
    success_count = sum(1 for c in check_ins if c.status == "success")
    success_rate = (success_count / check_ins_count * 100.0) if check_ins_count > 0 else 0.0

    # Calculate dynamic milestones
    milestones = []
    if state.assessment:
        milestones.append("Onboarded: Assessment Completed")
    if check_ins_count >= 1:
        milestones.append("First Check-in Logged")
    if state.max_streak >= 1:
        milestones.append(f"Reached 1-Day Streak")
    if state.max_streak >= 3:
        milestones.append("Consistency Achieved (3-Day Streak)")
    if state.max_streak >= 7:
        milestones.append("Habit Breaker Elite (7-Day Streak)")
    if state.points >= 500:
        milestones.append("Points Champion (500+ Points)")

    return DashboardResponse(
        habit_name=state.habit_name,
        has_assessment=state.assessment is not None,
        streak=state.streak,
        max_streak=state.max_streak,
        points=state.points,
        badges=state.badges,
        check_ins_count=check_ins_count,
        success_rate=round(success_rate, 2),
        milestones=milestones
    )
