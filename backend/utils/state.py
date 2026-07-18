import os
import threading
import contextvars
from datetime import datetime, date
from typing import Any
from backend.models.tracking import HabitState, Badge, CheckIn

# Context variable to hold the request-local state
state_var = contextvars.ContextVar("habit_state", default=None)

class GlobalState:
    def __init__(self):
        self._fallback_state = HabitState()
        self._lock = threading.Lock()

    def get_state(self) -> HabitState:
        state = state_var.get()
        if state is None:
            with self._lock:
                return self._fallback_state
        return state

    def reset_state(self):
        state = state_var.get()
        if state is not None:
            # Set context state to a clean HabitState
            state_var.set(HabitState())
        else:
            with self._lock:
                self._fallback_state = HabitState()

    def set_habit(self, name: str, assessment_data: Any):
        state = self.get_state()
        state.habit_name = name
        state.assessment = assessment_data
        state.points = 0
        state.streak = 0
        state.max_streak = 0
        state.check_ins = []
        state.badges = []
        state.chat_history = []
        state.coping_ratings = {}

        # Award initial onboarding badge
        self.award_badge_unlocked("onboarding_complete", "Fresh Start", "Completed habit assessment and set goals!")

    def add_chat_message(self, role: str, content: str):
        state = self.get_state()
        state.chat_history.append({"role": role, "content": content})

    def get_chat_history(self) -> list:
        return self.get_state().chat_history

    def add_check_in(self, status: str, notes: str = None) -> CheckIn:
        state = self.get_state()
        check_in_id = f"check_{len(state.check_ins) + 1}"
        new_check_in = CheckIn(
            id=check_in_id,
            timestamp=datetime.now(),
            status=status,
            notes=notes
        )
        state.check_ins.append(new_check_in)
        
        # Update streaks & points
        today_str = date.today().isoformat()
        if status == "success":
            state.points += 50
            if state.last_check_in_date:
                try:
                    last_date = date.fromisoformat(state.last_check_in_date)
                    delta = (date.today() - last_date).days
                    if delta == 1:
                        state.streak += 1
                    elif delta > 1:
                        state.streak = 1
                except Exception:
                    state.streak = 1
            else:
                state.streak = 1

            if state.streak > state.max_streak:
                state.max_streak = state.streak
            
            if state.streak == 1:
                self.award_badge_unlocked("streak_1", "Day One Done", "Completed your first check-in!")
            elif state.streak == 3:
                self.award_badge_unlocked("streak_3", "Consistent", "Maintained a 3-day success streak!")
            elif state.streak == 7:
                self.award_badge_unlocked("streak_7", "Habit Breaker", "A full week of resisting urges!")
        else:
            state.streak = 0
            state.points = max(0, state.points - 20)
            self.award_badge_unlocked("resilience", "Resilience Starter", "Logged a slip-up. Recovery starts now!")

        state.last_check_in_date = today_str
        return new_check_in

    def award_badge_unlocked(self, badge_id: str, name: str, description: str):
        state = self.get_state()
        exists = any(b.id == badge_id for b in state.badges)
        if not exists:
            state.badges.append(
                Badge(
                    id=badge_id,
                    name=name,
                    description=description,
                    earned_at=datetime.now()
                )
            )
            state.points += 100

    def update_coping_rating(self, strategy_name: str, rating: float):
        state = self.get_state()
        state.coping_ratings[strategy_name] = rating

global_state = GlobalState()
