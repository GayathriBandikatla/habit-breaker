from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime

class GoalModel(BaseModel):
    weekly_target: str
    monthly_target: str

class AssessmentResponse(BaseModel):
    habit_pattern: str
    severity_level: str
    root_causes: List[str]
    triggers_analysis: List[str]
    recommended_goals: GoalModel
    coping_style_recommendation: str
    motivation_boost: str

class HabitAssessmentInput(BaseModel):
    habit_name: str = Field(..., min_length=2, max_length=100)
    frequency: str = Field(..., min_length=2, max_length=100)
    triggers: str = Field(..., min_length=2, max_length=200)
    impact: str = Field(..., min_length=2, max_length=500)
    motivation: str = Field(..., min_length=2, max_length=100)

class CheckInInput(BaseModel):
    status: str = Field(..., pattern="^(success|slip_up)$")
    notes: Optional[str] = Field(None, max_length=500)

class CheckIn(BaseModel):
    id: str
    timestamp: datetime
    status: str  # "success" or "slip_up"
    notes: Optional[str] = None

class Badge(BaseModel):
    id: str
    name: str
    description: str
    earned_at: datetime

class HabitState(BaseModel):
    habit_name: Optional[str] = None
    assessment: Optional[AssessmentResponse] = None
    check_ins: List[CheckIn] = []
    points: int = 0
    badges: List[Badge] = []
    streak: int = 0
    max_streak: int = 0
    last_check_in_date: Optional[str] = None # YYYY-MM-DD
    coping_ratings: Dict[str, float] = {} # strategy_name -> rating (1-10)
    chat_history: List[Dict[str, str]] = [] # {"role": "user"/"assistant", "content": "..."}
