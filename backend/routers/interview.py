import json
import os
import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Dict, Any

from utils.deps import get_current_user
from utils.n8n import generate_interview
from database import get_pool

router = APIRouter()

class InterviewEvaluateRequest(BaseModel):
    questions: List[Dict[str, Any]]
    answers: Dict[str, str]
    target_role: str

@router.post("/generate")
async def create_interview(current_user: dict = Depends(get_current_user)):
    """Generate role-specific mock interview questions based on user profile."""
    pool = get_pool()
    
    async with pool.acquire() as conn:
        profile = await conn.fetchrow("SELECT target_roles, skills, interview_experience FROM profiles WHERE user_id = $1", current_user["id"])
        
    if not profile:
        raise HTTPException(status_code=400, detail="Profile not found. Please complete your profile first.")
        
    profile_dict = dict(profile)
    target_role = profile_dict.get("target_roles", "Software Engineer").split(",")[0] if profile_dict.get("target_roles") else "Software Engineer"

    interview_result = await generate_interview(current_user, profile_dict)

    if "error" in interview_result:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=interview_result["error"]
        )

    questions_json_str = json.dumps(interview_result)
    async with pool.acquire() as conn:
        interview_id = await conn.fetchval("""
            INSERT INTO interviews (user_id, questions_json, target_role)
            VALUES ($1, $2, $3)
            RETURNING id
        """, current_user["id"], questions_json_str, target_role)

    return {"id": interview_id, "interview": interview_result}


@router.post("/evaluate")
async def evaluate_interview(request: InterviewEvaluateRequest, current_user: dict = Depends(get_current_user)):
    """
    Evaluate user's answers to the interview questions.
    This requires a direct LLM call or another n8n webhook specifically for evaluation.
    For simplicity, we'll hit the same webhook but pass an action flag, assuming the n8n
    workflow is configured to route based on an "action" field.
    """
    webhook_url = os.getenv("N8N_INTERVIEW_WEBHOOK_URL")
    if not webhook_url:
        raise HTTPException(status_code=500, detail="N8N_INTERVIEW_WEBHOOK_URL not configured")

    payload = {
        "action": "evaluate",
        "role": request.target_role,
        "questions": request.questions,
        "answers": request.answers
    }

    try:
        async with httpx.AsyncClient(timeout=90.0) as client:
            response = await client.post(
                webhook_url,
                json=payload
            )

        if response.status_code not in (200, 201):
            raise HTTPException(status_code=502, detail=f"n8n returned status {response.status_code}")

        n8n_data = response.json()
        if isinstance(n8n_data, list) and len(n8n_data) > 0: n8n_data = n8n_data[0]
        
        if isinstance(n8n_data, dict) and "choices" in n8n_data:
            content = n8n_data["choices"][0]["message"]["content"]
            return json.loads(content) if isinstance(content, str) else content

        if isinstance(n8n_data, dict) and "feedback" in n8n_data: return n8n_data

        return n8n_data

    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Evaluation timed out. The LLM might be slow — try again.")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {exc}")
