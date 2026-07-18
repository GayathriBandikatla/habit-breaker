from fastapi import APIRouter, HTTPException, Request
from backend.models.responses import StrategyItem, StrategyRatingUpdate
from backend.services.gemini_service import gemini_service
from backend.utils.state import global_state
from backend.utils.cache import cache_instance
from backend.utils.limiter import limiter
from typing import List

router = APIRouter(prefix="/strategies", tags=["strategies"])

@router.get("", response_model=List[StrategyItem])
@limiter.limit("60/minute")
def get_strategies(request: Request):
    state = global_state.get_state()
    habit_name = state.habit_name or "screen addiction"
    
    cache_key = f"strategies:{habit_name}"
    cached_strategies = cache_instance.get(cache_key)

    if cached_strategies:
        strategies_list = cached_strategies
    else:
        try:
            variables = {"habit_name": habit_name}
            strategies_json = gemini_service.generate_json("strategies", variables)
            if not isinstance(strategies_json, list):
                raise ValueError("Expected a list of strategies.")
            
            # Cache it
            cache_instance.set(cache_key, strategies_json, ttl=300)
            strategies_list = strategies_json
        except Exception as e:
            # Fallback to basic strategies if Gemini fails, ensuring no breakdown
            strategies_list = [
                {"name": "5-Minute Breathwork", "type": "physical", "description": "Box breathing to reduce anxiety.", "steps": ["Inhale 4s", "Hold 4s", "Exhale 4s", "Hold 4s"], "time_required": "5 mins", "rating": 8.0},
                {"name": "Cognitive Pause", "type": "mental", "description": "Question the immediate impulse.", "steps": ["Identify urge", "Wait 10 minutes", "Reassess"], "time_required": "10 mins", "rating": 7.5},
                {"name": "Call a Friend", "type": "social", "description": "Engage in conversation to distract yourself.", "steps": ["Dial a supporter", "Share progress"], "time_required": "15 mins", "rating": 9.0},
                {"name": "Muscle Relaxation", "type": "physical", "description": "Progressive muscle relaxation.", "steps": ["Tense muscles", "Release tension"], "time_required": "8 mins", "rating": 7.0},
                {"name": "Mindful Writing", "type": "mental", "description": "Journal your current triggers.", "steps": ["Write feelings", "Identify solutions"], "time_required": "10 mins", "rating": 8.0},
                {"name": "Online Community Check-in", "type": "social", "description": "Check supportive forum.", "steps": ["Read forum", "Post update"], "time_required": "5 mins", "rating": 7.5}
            ]

    # Merge ratings with user state ratings
    merged_strategies = []
    for item in strategies_list:
        name = item["name"]
        rating = state.coping_ratings.get(name, float(item["rating"]))
        merged_strategies.append(
            StrategyItem(
                name=name,
                type=item["type"],
                description=item["description"],
                steps=item["steps"],
                time_required=item["time_required"],
                rating=rating
            )
        )
    return merged_strategies

@router.post("/{name}/rate", response_model=dict)
@limiter.limit("60/minute")
def rate_strategy(request: Request, name: str, payload: StrategyRatingUpdate):
    global_state.update_coping_rating(name, payload.rating)
    return {"message": "Rating updated successfully", "name": name, "rating": payload.rating}

