import os
import sys

# Vercel Monorepo Path Resolution:
# When Vercel builds the backend in isolation, the 'backend' folder contents are placed at root.
# Thus, 'from backend.routers import ...' fails because there is no 'backend' folder.
# We create a virtual 'backend' package in /tmp containing symlinks to our directories.
if not os.path.exists("backend") and os.path.exists("routers"):
    tmp_backend = "/tmp/backend"
    try:
        os.makedirs(tmp_backend, exist_ok=True)
        for folder in ["routers", "models", "services", "utils", "validators", "prompts"]:
            src = os.path.abspath(folder)
            dst = os.path.join(tmp_backend, folder)
            if os.path.exists(src) and not os.path.exists(dst):
                os.symlink(src, dst, target_is_directory=True)
        if "/tmp" not in sys.path:
            sys.path.insert(0, "/tmp")
    except Exception:
        pass

import json
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from backend.utils.limiter import limiter
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
    cors_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]

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
