import os
import uuid
from fastapi import APIRouter, Depends, UploadFile, File
from models import ProfileUpdate, ProfileResponse
from database import get_pool
from utils.deps import get_current_user
from utils.n8n import trigger_n8n_background

router = APIRouter()

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads", "resumes")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("", response_model=ProfileResponse)
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Get the current user's profile."""
    pool = get_pool()

    async with pool.acquire() as conn:
        profile = await conn.fetchrow(
            "SELECT * FROM profiles WHERE user_id = $1",
            current_user["id"]
        )

    if not profile:
        return ProfileResponse(id=0, user_id=current_user["id"])

    return ProfileResponse(**dict(profile))


@router.put("", response_model=ProfileResponse)
async def update_profile(
    profile_data: ProfileUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Create or update the current user's profile."""
    pool = get_pool()

    async with pool.acquire() as conn:
        existing = await conn.fetchrow(
            "SELECT id FROM profiles WHERE user_id = $1",
            current_user["id"]
        )

        if existing:
            profile = await conn.fetchrow(
                """
                UPDATE profiles SET
                    college = $2, degree = $3, branch = $4, graduation_year = $5,
                    phone = $6, linkedin_url = $7, github_url = $8, bio = $9,
                    profile_picture_url = $10,
                    target_roles = $11, job_type = $12, company_type = $13, target_timeline = $14,
                    programming_languages = $15, skills = $16, dsa_level = $17,
                    projects_count = $18, cp_level = $19,
                    interview_experience = $20,
                    prep_stage = $21, daily_time_available = $22, resume_status = $23,
                    strongest_areas = $24, weakest_areas = $25,
                    updated_at = NOW()
                WHERE user_id = $1
                RETURNING *
                """,
                current_user["id"],
                profile_data.college, profile_data.degree, profile_data.branch,
                profile_data.graduation_year, profile_data.phone,
                profile_data.linkedin_url, profile_data.github_url, profile_data.bio,
                profile_data.profile_picture_url,
                profile_data.target_roles, profile_data.job_type,
                profile_data.company_type, profile_data.target_timeline,
                profile_data.programming_languages, profile_data.skills,
                profile_data.dsa_level, profile_data.projects_count, profile_data.cp_level,
                profile_data.interview_experience,
                profile_data.prep_stage, profile_data.daily_time_available,
                profile_data.resume_status,
                profile_data.strongest_areas, profile_data.weakest_areas
            )
        else:
            profile = await conn.fetchrow(
                """
                INSERT INTO profiles (
                    user_id, college, degree, branch, graduation_year,
                    phone, linkedin_url, github_url, bio, profile_picture_url,
                    target_roles, job_type, company_type, target_timeline,
                    programming_languages, skills, dsa_level, projects_count, cp_level,
                    interview_experience,
                    prep_stage, daily_time_available, resume_status,
                    strongest_areas, weakest_areas
                )
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)
                RETURNING *
                """,
                current_user["id"],
                profile_data.college, profile_data.degree, profile_data.branch,
                profile_data.graduation_year, profile_data.phone,
                profile_data.linkedin_url, profile_data.github_url, profile_data.bio,
                profile_data.profile_picture_url,
                profile_data.target_roles, profile_data.job_type,
                profile_data.company_type, profile_data.target_timeline,
                profile_data.programming_languages, profile_data.skills,
                profile_data.dsa_level, profile_data.projects_count, profile_data.cp_level,
                profile_data.interview_experience,
                profile_data.prep_stage, profile_data.daily_time_available,
                profile_data.resume_status,
                profile_data.strongest_areas, profile_data.weakest_areas
            )

    profile_dict = dict(profile)
    trigger_n8n_background(
        user_data={
            "id": current_user["id"],
            "full_name": current_user.get("full_name", ""),
            "email": current_user.get("email", ""),
        },
        profile_data=profile_dict,
    )

    return ProfileResponse(**profile_dict)


@router.post("/resume")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload a resume file (PDF, DOC, DOCX). Max 5MB."""
    allowed_types = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ]
    if file.content_type not in allowed_types:
        return {"error": "Only PDF, DOC, DOCX files are allowed"}

    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        return {"error": "File size must be under 5MB"}

    ext = os.path.splitext(file.filename)[1]
    unique_name = f"resume_{current_user['id']}_{uuid.uuid4().hex[:8]}{ext}"
    filepath = os.path.join(UPLOAD_DIR, unique_name)

    with open(filepath, "wb") as f:
        f.write(content)

    pool = get_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            """
            UPDATE profiles
            SET resume_filename = $2, resume_path = $3, updated_at = NOW()
            WHERE user_id = $1
            """,
            current_user["id"],
            file.filename,
            filepath
        )

    return {
        "message": "Resume uploaded successfully",
        "filename": file.filename,
        "saved_as": unique_name
    }
