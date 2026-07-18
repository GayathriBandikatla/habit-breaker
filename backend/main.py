import os
import json
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from dotenv import load_dotenv

# Import routers
from backend.routers import (
    assessment,
    coaching,
    nudges,
    dashboard,
    strategies,
    accountability,
    insights,
    gamification
)

# Load env variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

# Initialize FastAPI with metadata
app = FastAPI(
    title="Habit Breaker AI Backend",
    description="FastAPI service powered by Gemini for breaking habits and screen time addiction",
    version="1.0.0"
)

# Setup Rate Limiting
rate_limit_str = os.getenv("RATE_LIMIT", "60/minute")
limiter = Limiter(key_func=get_remote_address, default_limits=[rate_limit_str])
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Setup CORS
cors_origins_raw = os.getenv("CORS_ORIGINS")
if cors_origins_raw:
    try:
        cors_origins = json.loads(cors_origins_raw)
    except Exception:
        cors_origins = [cors_origins_raw]
else:
    cors_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoints
@app.get("/")
@limiter.limit("5/minute")
def read_root(request: Request):
    return {"message": "Welcome to the Habit Breaker AI API. Powered by Google Gemini."}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# Mount Feature Routers under /api
app.include_router(assessment.router, prefix="/api")
app.include_router(coaching.router, prefix="/api")
app.include_router(nudges.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(strategies.router, prefix="/api")
app.include_router(accountability.router, prefix="/api")
app.include_router(insights.router, prefix="/api")
app.include_router(gamification.router, prefix="/api")

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal Server Error: {str(exc)}"}
    )
