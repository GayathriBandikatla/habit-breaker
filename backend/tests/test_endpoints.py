import pytest
from unittest.mock import MagicMock

def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    assert "Habit Breaker" in response.json()["message"]

def test_assessment_endpoints(client, mock_gemini):
    # Mock Gemini assessment output
    mock_data = {
        "habit_pattern": "Obsessive scrolling after 10 PM",
        "severity_level": "High",
        "root_causes": ["Boredom", "Dopamine seeking"],
        "triggers_analysis": ["Late night boredom", "Device next to bed"],
        "recommended_goals": {
            "weekly_target": "Limit to 30 mins late night",
            "monthly_target": "Zero device after 10 PM"
        },
        "coping_style_recommendation": "Cognitive Behavioral",
        "motivation_boost": "You can do this!"
    }
    mock_gemini["assessment"].generate_json.return_value = mock_data

    # Test GET without assessment
    response = client.get("/api/assessment")
    assert response.status_code == 404

    # Test POST assessment
    payload = {
        "habit_name": "Screen Time",
        "frequency": "Daily",
        "triggers": "Boredom",
        "impact": "No sleep",
        "motivation": "Very High"
    }
    response = client.post("/api/assessment", json=payload)
    assert response.status_code == 200
    assert response.json()["severity_level"] == "High"

    # Test GET with assessment
    response = client.get("/api/assessment")
    assert response.status_code == 200
    assert response.json()["severity_level"] == "High"

def test_coaching_endpoints(client, mock_gemini):
    # Setup assessment first
    test_assessment_endpoints(client, mock_gemini)
    
    mock_gemini["coaching"].generate_text.return_value = "Keep focusing on your breathing. What is your plan for tonight?"

    # Test coaching chat
    payload = {"message": "I feel a strong urge to open social media."}
    response = client.post("/api/coaching/chat", json=payload)
    assert response.status_code == 200
    assert "breathing" in response.json()["response"]

    # Test coaching history
    response = client.get("/api/coaching/history")
    assert response.status_code == 200
    assert len(response.json()) == 2
    assert response.json()[0]["content"] == "I feel a strong urge to open social media."

def test_nudges_endpoints(client, mock_gemini):
    mock_gemini["nudges"].generate_json.return_value = {
        "nudge_message": "Put the phone down now!",
        "suggested_alternative": "Read a paperback book",
        "urgency_level": "High",
        "recovery_tip": "Leave the room for 5 minutes"
    }

    payload = {"triggers_or_mood": "anxious", "previous_activity": "working"}
    response = client.post("/api/nudges/generate", json=payload)
    assert response.status_code == 200
    assert response.json()["urgency_level"] == "High"

def test_strategies_endpoints(client, mock_gemini):
    mock_gemini["strategies"].generate_json.return_value = [
        {"name": "Box Breathing", "type": "physical", "description": "Box breathing to reduce anxiety.", "steps": ["Inhale 4s", "Hold 4s", "Exhale 4s", "Hold 4s"], "time_required": "5 mins", "rating": 8.0},
        {"name": "Write Urges", "type": "mental", "description": "Journal your current triggers.", "steps": ["Write feelings"], "time_required": "10 mins", "rating": 7.0}
    ]

    # Test GET strategies (should fetch and cache)
    response = client.get("/api/strategies")
    assert response.status_code == 200
    assert len(response.json()) == 2
    assert response.json()[0]["name"] == "Box Breathing"

    # Test POST rating
    response = client.post("/api/strategies/Box Breathing/rate", json={"rating": 9.5})
    assert response.status_code == 200
    assert response.json()["rating"] == 9.5

    # Test GET strategies again (should have merged rating)
    response = client.get("/api/strategies")
    assert response.json()[0]["rating"] == 9.5

def test_accountability_endpoints(client, mock_gemini):
    mock_gemini["accountability"].generate_text.return_value = "It is okay to slip up. Focus on the next moment!"

    # Test Success Check-in
    response = client.post("/api/accountability/checkin", json={"status": "success", "notes": "No screens today!"})
    assert response.status_code == 200
    assert "progress" in response.json()["message"]

    # Test Slip-up Check-in
    response = client.post("/api/accountability/checkin", json={"status": "slip_up", "notes": "Opened Instagram"})
    assert response.status_code == 200
    assert "recovery" in response.json()
    assert "slip up" in response.json()["recovery"]["message"]

    # Test History
    response = client.get("/api/accountability/history")
    assert response.status_code == 200
    assert len(response.json()) == 2

def test_insights_endpoint(client, mock_gemini):
    mock_gemini["insights"].generate_json.return_value = {
        "weekly_summary": "Overall solid progress.",
        "pattern_insights": "No specific patterns.",
        "correlation_insights": "Stress leads to urges.",
        "risk_prediction": "Low",
        "preemptive_advice": "Prepare evening routine.",
        "encouragement_message": "Awesome work!",
        "next_week_suggestion": "Stay consistent."
    }

    response = client.get("/api/insights")
    assert response.status_code == 200
    assert response.json()["risk_prediction"] == "Low"

def test_dashboard_and_gamification(client, mock_gemini):
    # Onboard
    test_assessment_endpoints(client, mock_gemini)
    
    # Success check-in (triggers points/streak)
    client.post("/api/accountability/checkin", json={"status": "success"})

    # Check Dashboard
    response = client.get("/api/dashboard")
    assert response.status_code == 200
    assert response.json()["streak"] == 1
    assert response.json()["points"] > 0
    assert len(response.json()["badges"]) > 0

    # Check Gamification
    response = client.get("/api/gamification")
    assert response.status_code == 200
    assert response.json()["points"] > 0
    assert len(response.json()["badges"]) > 0
    assert response.json()["progress_percentage"] > 0
