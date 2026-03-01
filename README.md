# Prep-Pilot 🚀

> Your execution-focused placement copilot — know exactly what to do next for internships and jobs.

---

## 🎯 What is Prep-Pilot?

Prep-Pilot is a personalized placement copilot that helps students stop guessing and start executing. It collects detailed user profiles — career goals, technical skills, preparation status, and self-assessment — to generate:

- **Personalized 7-Day Action Plans** tailored to each user's unique skill gaps
- **Role-Specific Mock Interviews** with real-time feedback
- **ATS-Ready Resume Tips** to pass automated screening
- **Readiness Scores** with shareable cards and leaderboards

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | HTML, CSS, JavaScript |
| **Backend** | Python — FastAPI |
| **Database** | PostgreSQL (Neon.tech) |
| **Auth** | JWT (bcrypt + python-jose) |

---

## 📁 Project Structure

```
PrePilot/
├── frontend/
│   ├── index.html            # Landing page with hero, features, CTA
│   ├── auth.html             # Login/Register — split-screen layout
│   ├── profile.html          # Comprehensive profile setup (6 sections)
│   ├── css/
│   │   └── styles.css        # Design system (dark mode, glassmorphism)
│   └── js/
│       ├── api.js            # API helper, token management, auth guard
│       ├── auth.js           # Login/register form logic
│       └── profile.js        # Tags, chips, radio cards, file upload, progress ring
│
├── backend/
│   ├── main.py               # FastAPI app, CORS, routers, static file serving
│   ├── database.py           # asyncpg connection pool, table creation
│   ├── models.py             # Pydantic schemas (auth + profile)
│   ├── requirements.txt      # Python dependencies
│   ├── .env.example          # Environment variable template
│   ├── utils/
│   │   ├── security.py       # bcrypt hashing, JWT create/decode
│   │   └── deps.py           # get_current_user dependency
│   └── routers/
│       ├── auth.py           # POST /api/auth/register, /api/auth/login
│       └── profile.py        # GET/PUT /api/profile, POST /api/profile/resume
│
├── uploads/                  # Resume files (auto-created)
│   └── resumes/
│
├── .gitignore
└── README.md
```

---

## ✅ What's Implemented

### 🖥️ Frontend Pages

| Page | Description |
|------|------------|
| **Landing** (`index.html`) | Hero section, feature cards, how-it-works, CTA — scroll animations |
| **Auth** (`auth.html`) | Split-screen layout: branding panel + login/register forms with validation |
| **Profile** (`profile.html`) | Full-width dashboard with 6 comprehensive sections (see below) |

### 📋 Profile Sections (Comprehensive Data Collection)

| Section | Fields | UI Component |
|---------|--------|--------------|
| 👤 Personal Info | Phone, Graduation Year | Inputs + Select |
| 🎓 Education | College, Degree, Branch | Inputs + Select |
| 🎯 Career Goals | Target Roles, Job Type, Company Type, Timeline | Chip multi-select |
| 💻 Technical | Languages, Skills, DSA Level, Projects, CP, Interviews | Tag inputs + Radio cards |
| 📊 Prep Status | Current Stage, Daily Time, Resume Status | Radio cards with emojis |
| 🧠 Self-Assessment | Strongest Areas, Weakest Areas, Bio | Chip multi-select |
| 📄 Resume Upload | PDF / DOC / DOCX (optional, max 5MB) | Drag-and-drop zone |

### ⚙️ Backend API

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/register` | POST | ❌ | Create new user account |
| `/api/auth/login` | POST | ❌ | Login, returns JWT token |
| `/api/profile` | GET | ✅ | Fetch user profile |
| `/api/profile` | PUT | ✅ | Create/update user profile (25 fields) |
| `/api/profile/resume` | POST | ✅ | Upload resume file |
| `/api/health` | GET | ❌ | Health check |
| `/docs` | GET | ❌ | Swagger API documentation |

### 🗄️ Database Schema

**`users`** — id, full_name, email, password_hash, timestamps  
**`profiles`** — 25+ fields covering basics, career goals, technical background, preparation status, self-assessment, and resume info

---

## 🚀 Setup & Run

### Prerequisites
- Python 3.10+
- PostgreSQL database (free at [neon.tech](https://neon.tech))

### 1. Clone & Install

```bash
cd PrePilot/backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
copy .env.example .env         # Windows
# cp .env.example .env         # Mac/Linux
```

Edit `.env`:
```env
DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require
JWT_SECRET_KEY=your-random-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440
```

### 3. Start the Server

```bash
uvicorn main:app --reload --port 8000
```

### 4. Open in Browser

| Page | URL |
|------|-----|
| Landing | http://localhost:8000 |
| Auth | http://localhost:8000/auth.html |
| Profile | http://localhost:8000/profile.html |
| API Docs | http://localhost:8000/docs |

---

## 🗺️ Upcoming Features

- [ ] Screening test based on user profile data
- [ ] Personalized 7-day action plan generation
- [ ] Role-specific mock interview system
- [ ] ATS resume analysis from uploaded resumes
- [ ] Readiness score dashboard with shareable cards
- [ ] Leaderboard for accountability

---

## 📄 License

This project is for educational and personal use.
