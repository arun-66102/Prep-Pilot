import os
import asyncpg

pool: asyncpg.Pool = None


async def init_db():
    """Initialize the database connection pool and create tables."""
    global pool

    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise ValueError("DATABASE_URL environment variable is not set")

    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)

    pool = await asyncpg.create_pool(
        database_url,
        min_size=2,
        max_size=10,
        command_timeout=60,
        statement_cache_size=0,  
        max_inactive_connection_lifetime=300 
    )

    async with pool.acquire() as conn:
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                full_name VARCHAR(100) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        """)

        await conn.execute("""
            CREATE TABLE IF NOT EXISTS profiles (
                id SERIAL PRIMARY KEY,
                user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,

                -- Basics
                college VARCHAR(200),
                degree VARCHAR(100),
                branch VARCHAR(100),
                graduation_year INTEGER,
                phone VARCHAR(20),
                linkedin_url VARCHAR(300),
                github_url VARCHAR(300),
                bio TEXT,
                profile_picture_url VARCHAR(500),

                -- Career Goals
                target_roles TEXT,
                job_type VARCHAR(50),
                company_type TEXT,
                target_timeline VARCHAR(50),

                -- Technical Background
                programming_languages TEXT,
                skills TEXT,
                dsa_level VARCHAR(50),
                projects_count VARCHAR(20),
                cp_level VARCHAR(50),

                -- Experience
                interview_experience VARCHAR(20),

                -- Preparation Status
                prep_stage VARCHAR(50),
                daily_time_available VARCHAR(30),
                resume_status VARCHAR(50),

                -- Self-Assessment
                strongest_areas TEXT,
                weakest_areas TEXT,

                -- Resume
                resume_filename VARCHAR(300),
                resume_path VARCHAR(500),

                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        """)

        await conn.execute("""
            CREATE TABLE IF NOT EXISTS plans (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                plan_json JSONB NOT NULL,
                completed_tasks JSONB DEFAULT '{}'::jsonb,
                quiz_score INTEGER,
                created_at TIMESTAMP DEFAULT NOW()
            );
        """)
        
        try:
            await conn.execute("ALTER TABLE plans ADD COLUMN completed_tasks JSONB DEFAULT '{}'::jsonb;")
        except asyncpg.exceptions.DuplicateColumnError:
            pass

        await conn.execute("""
            CREATE TABLE IF NOT EXISTS interviews (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                questions_json JSONB NOT NULL,
                target_role VARCHAR(200),
                created_at TIMESTAMP DEFAULT NOW()
            );
        """)

    print("✅ Database initialized and tables created")


async def close_db():
    """Close the database connection pool."""
    global pool
    if pool:
        await pool.close()
        print("🔒 Database connection pool closed")


def get_pool() -> asyncpg.Pool:
    """Get the database connection pool."""
    return pool
