from fastapi import APIRouter, Depends
from database import get_pool
from utils.deps import get_current_user
from utils.n8n import generate_quiz

router = APIRouter()


@router.post("/generate")
async def generate_quiz_endpoint(current_user: dict = Depends(get_current_user)):
    """
    Generate a screening quiz based on the user's profile.
    Calls n8n webhook which uses Groq to create skill-based questions.
    """
    pool = get_pool()

    async with pool.acquire() as conn:
        profile = await conn.fetchrow(
            "SELECT * FROM profiles WHERE user_id = $1",
            current_user["id"]
        )

    if not profile:
        return {"error": "Please complete your profile first before taking the quiz."}

    profile_dict = dict(profile)

    if not profile_dict.get("skills") and not profile_dict.get("programming_languages"):
        return {"error": "Please add your skills and programming languages in your profile first."}

    user_data = {
        "id": current_user["id"],
        "full_name": current_user.get("full_name", ""),
        "email": current_user.get("email", ""),
    }

    quiz_data = await generate_quiz(user_data, profile_dict)

    return quiz_data
