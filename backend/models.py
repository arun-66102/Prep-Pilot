from pydantic import BaseModel
from typing import Optional
from datetime import datetime



class UserRegister(BaseModel):
    full_name: str
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    created_at: Optional[datetime] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class ProfileUpdate(BaseModel):
  
    college: Optional[str] = None
    degree: Optional[str] = None
    branch: Optional[str] = None
    graduation_year: Optional[int] = None
    phone: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    bio: Optional[str] = None
    profile_picture_url: Optional[str] = None

 
    target_roles: Optional[str] = None
    job_type: Optional[str] = None
    company_type: Optional[str] = None
    target_timeline: Optional[str] = None

    
    programming_languages: Optional[str] = None
    skills: Optional[str] = None
    dsa_level: Optional[str] = None
    projects_count: Optional[str] = None
    cp_level: Optional[str] = None

    interview_experience: Optional[str] = None

    prep_stage: Optional[str] = None
    daily_time_available: Optional[str] = None
    resume_status: Optional[str] = None


    strongest_areas: Optional[str] = None
    weakest_areas: Optional[str] = None


class ProfileResponse(BaseModel):
    id: int
    user_id: int


    college: Optional[str] = None
    degree: Optional[str] = None
    branch: Optional[str] = None
    graduation_year: Optional[int] = None
    phone: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    bio: Optional[str] = None
    profile_picture_url: Optional[str] = None


    target_roles: Optional[str] = None
    job_type: Optional[str] = None
    company_type: Optional[str] = None
    target_timeline: Optional[str] = None


    programming_languages: Optional[str] = None
    skills: Optional[str] = None
    dsa_level: Optional[str] = None
    projects_count: Optional[str] = None
    cp_level: Optional[str] = None

 
    interview_experience: Optional[str] = None


    prep_stage: Optional[str] = None
    daily_time_available: Optional[str] = None
    resume_status: Optional[str] = None

 
    strongest_areas: Optional[str] = None
    weakest_areas: Optional[str] = None


    resume_filename: Optional[str] = None

    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
