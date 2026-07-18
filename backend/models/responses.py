from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from backend.models.tracking import AssessmentResponse, CheckIn, Badge

class CoachingRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=500)

class CoachingResponse(BaseModel):
    response: str
    role: str = "assistant"

class NudgeRequest(BaseModel):
    triggers_or_mood: str = Field(..., min_length=2, max_length=200)
    previous_activity: str = Field(..., min_length=2, max_length=200)

class NudgeResponse(BaseModel):
    nudge_message: str
    suggested_alternative: str
    urgency_level: str
    recovery_tip: str

class StrategyItem(BaseModel):
    name: str
    type: str
    description: str
    steps: List[str]
    time_required: str
    rating: float

class StrategyRatingUpdate(BaseModel):
    rating: float = Field(..., ge=1.0, le=10.0)

class DashboardResponse(BaseModel):
    habit_name: Optional[str]
    has_assessment: bool
    streak: int
    max_streak: int
    points: int
    badges: List[Badge]
    check_ins_count: int
    success_rate: float
    milestones: List[str]

class InsightsResponse(BaseModel):
    weekly_summary: str
    pattern_insights: str
    correlation_insights: str
    risk_prediction: str
    preemptive_advice: str
    encouragement_message: str
    next_week_suggestion: str

class RelapseResponse(BaseModel):
    message: str
    next_steps: List[str]

class ErrorResponse(BaseModel):
    detail: str
