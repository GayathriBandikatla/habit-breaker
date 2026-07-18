import os
import threading
import json
from datetime import datetime, date
from typing import Any
from backend.models.tracking import HabitState, Badge, CheckIn

class GlobalState:
    def __init__(self):
        self._lock = threading.Lock()
        
        # Decide file path: if on Vercel or /tmp exists, save in /tmp, otherwise save in backend directory
        if os.getenv("VERCEL") or os.path.exists("/tmp"):
            self._state_file = "/tmp/habit_state.json"
        else:
            current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            self._state_file = os.path.join(current_dir, "habit_state.json")
            
        self._state = HabitState()
        self._load_from_file()

    def _load_from_file(self):
        try:
            if os.path.exists(self._state_file):
                with open(self._state_file, "r", encoding="utf-8") as f:
                    content = f.read().strip()
                    if content:
                        self._state = HabitState.model_validate_json(content)
                        return
        except Exception as e:
            # Fall back to empty state
            pass
        self._state = HabitState()

    def _save_to_file(self):
        try:
            # Ensure containing directory exists
            os.makedirs(os.path.dirname(os.path.abspath(self._state_file)), exist_ok=True)
            with open(self._state_file, "w", encoding="utf-8") as f:
                f.write(self._state.model_dump_json())
        except Exception as e:
            pass

    def get_state(self) -> HabitState:
        with self._lock:
            self._load_from_file()
            return self._state

    def reset_state(self):
        with self._lock:
            self._state = HabitState()
            self._save_to_file()

    def set_habit(self, name: str, assessment_data: Any):
        with self._lock:
            self._state.habit_name = name
            self._state.assessment = assessment_data
            self._state.points = 0
            self._state.streak = 0
            self._state.max_streak = 0
            self._state.check_ins = []
            self._state.badges = []
            self._state.chat_history = []
            self._state.coping_ratings = {}

            # Award initial onboarding badge
            self.award_badge_unlocked("onboarding_complete", "Fresh Start", "Completed habit assessment and set goals!")
            self._save_to_file()

    def add_chat_message(self, role: str, content: str):
        with self._lock:
            self._state.chat_history.append({"role": role, "content": content})
            self._save_to_file()

    def get_chat_history(self) -> list:
        with self._lock:
            self._load_from_file()
            return self._state.chat_history

    def add_check_in(self, status: str, notes: str = None) -> CheckIn:
        with self._lock:
            check_in_id = f"check_{len(self._state.check_ins) + 1}"
            new_check_in = CheckIn(
                id=check_in_id,
                timestamp=datetime.now(),
                status=status,
                notes=notes
            )
            self._state.check_ins.append(new_check_in)
            
            # Update streaks & points
            today_str = date.today().isoformat()
            if status == "success":
                self._state.points += 50
                # If it's a consecutive day
                if self._state.last_check_in_date:
                    try:
                        last_date = date.fromisoformat(self._state.last_check_in_date)
                        delta = (date.today() - last_date).days
                        if delta == 1:
                            self._state.streak += 1
                        elif delta > 1:
                            self._state.streak = 1
                    except Exception:
                        self._state.streak = 1
                else:
                    self._state.streak = 1

                if self._state.streak > self._state.max_streak:
                    self._state.max_streak = self._state.streak
                
                # Check for streak badges
                if self._state.streak == 1:
                    self.award_badge_unlocked("streak_1", "Day One Done", "Completed your first check-in!")
                elif self._state.streak == 3:
                    self.award_badge_unlocked("streak_3", "Consistent", "Maintained a 3-day success streak!")
                elif self._state.streak == 7:
                    self.award_badge_unlocked("streak_7", "Habit Breaker", "A full week of resisting urges!")
            else:
                # Slip up
                self._state.streak = 0
                self._state.points = max(0, self._state.points - 20) # deduct points for relapse check-in
                self.award_badge_unlocked("resilience", "Resilience Starter", "Logged a slip-up. Recovery starts now!")

            self._state.last_check_in_date = today_str
            self._save_to_file()
            return new_check_in

    def award_badge_unlocked(self, badge_id: str, name: str, description: str):
        # Assumes lock is already acquired or does its own locking if needed
        exists = any(b.id == badge_id for b in self._state.badges)
        if not exists:
            self._state.badges.append(
                Badge(
                    id=badge_id,
                    name=name,
                    description=description,
                    earned_at=datetime.now()
                )
            )
            self._state.points += 100 # badge gives points

    def update_coping_rating(self, strategy_name: str, rating: float):
        with self._lock:
            self._state.coping_ratings[strategy_name] = rating
            self._save_to_file()

global_state = GlobalState()

