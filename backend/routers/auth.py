from fastapi import APIRouter, HTTPException, status
from models import UserRegister, UserLogin, UserResponse, TokenResponse
from database import get_pool
from utils.security import hash_password, verify_password, create_access_token

router = APIRouter()


@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserRegister):
    """Register a new user account."""
    pool = get_pool()

    async with pool.acquire() as conn:
        # Check if email already exists
        existing = await conn.fetchrow(
            "SELECT id FROM users WHERE email = $1",
            user_data.email.lower()
        )

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email already exists"
            )

        # Hash password and create user
        hashed = hash_password(user_data.password)

        user = await conn.fetchrow(
            """
            INSERT INTO users (full_name, email, password_hash)
            VALUES ($1, $2, $3)
            RETURNING id, full_name, email, created_at
            """,
            user_data.full_name,
            user_data.email.lower(),
            hashed
        )

    # Create JWT token
    access_token = create_access_token({"user_id": user["id"], "email": user["email"]})

    return TokenResponse(
        access_token=access_token,
        user=UserResponse(
            id=user["id"],
            full_name=user["full_name"],
            email=user["email"],
            created_at=user["created_at"]
        )
    )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """Login with email and password."""
    pool = get_pool()

    async with pool.acquire() as conn:
        user = await conn.fetchrow(
            "SELECT id, full_name, email, password_hash, created_at FROM users WHERE email = $1",
            credentials.email.lower()
        )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Create JWT token
    access_token = create_access_token({"user_id": user["id"], "email": user["email"]})

    return TokenResponse(
        access_token=access_token,
        user=UserResponse(
            id=user["id"],
            full_name=user["full_name"],
            email=user["email"],
            created_at=user["created_at"]
        )
    )
