import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from backend.main import app
from backend.utils.state import global_state
from backend.utils.cache import cache_instance

@pytest.fixture(autouse=True)
def clean_state():
    """Resets global state and cache before each test."""
    global_state.reset_state()
    cache_instance.clear()
    yield
    global_state.reset_state()
    cache_instance.clear()

@pytest.fixture
def client():
    """Provides a TestClient for making API requests."""
    return TestClient(app)

@pytest.fixture
def mock_gemini():
    """Fixture to mock all methods on the global gemini_service."""
    with patch("backend.routers.assessment.gemini_service") as mock_assess, \
         patch("backend.routers.coaching.gemini_service") as mock_coach, \
         patch("backend.routers.nudges.gemini_service") as mock_nudge, \
         patch("backend.routers.strategies.gemini_service") as mock_strategy, \
         patch("backend.routers.accountability.gemini_service") as mock_account, \
         patch("backend.routers.insights.gemini_service") as mock_insight:
         
        # Return a dictionary of mocks to configure in individual tests
        yield {
            "assessment": mock_assess,
            "coaching": mock_coach,
            "nudges": mock_nudge,
            "strategies": mock_strategy,
            "accountability": mock_account,
            "insights": mock_insight
        }
