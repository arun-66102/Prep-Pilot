import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from database import init_db, close_db
from routers import auth, profile

# Load environment variables
load_dotenv()

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

