import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from database import init_db, close_db
from routers import auth, profile, quiz, plan, interview

# Load environment variables from parent directory
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
load_dotenv(dotenv_path=env_path)

# Create FastAPI app
app = FastAPI(
    title="Prep-Pilot API",
    description="Execution-focused placement copilot backend",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(profile.router, prefix="/api/profile", tags=["Profile"])
app.include_router(quiz.router, prefix="/api/quiz", tags=["Quiz"])
app.include_router(plan.router, prefix="/api/plan", tags=["Plan"])
app.include_router(interview.router, prefix="/api/interview", tags=["Interview"])


# Startup & Shutdown Events
@app.on_event("startup")
async def startup():
    await init_db()


@app.on_event("shutdown")
async def shutdown():
    await close_db()


# Health Check
@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "Prep-Pilot API is running"}

