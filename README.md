# Prep-Pilot 🚀

> Your execution-focused placement copilot — know exactly what to do next for internships and jobs.

---

## 🎯 What is Prep-Pilot?

Prep-Pilot is a personalized placement copilot that helps students stop guessing and start executing. It collects detailed user profiles — career goals, technical skills, preparation status, and self-assessment — to generate:

- **AI Screening Tests** dynamically generated based on user skills (powered by n8n).
- **Personalized 7-Day Action Plans** tailored to each user's skill gaps and quiz performance.
- **PDF Report Downloads** for offline tracking and easy sharing.
- **ATS-Ready Resume Tips** to pass automated screening.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React (Vite), TailwindCSS, React Router |
| **Backend** | Python — FastAPI |
| **Database** | PostgreSQL (Neon.tech) with `asyncpg` |
| **AI Integration** | n8n webhooks for Quiz Generation |
| **Auth** | JWT (bcrypt + python-jose) |
| **Deployment** | Vercel (Frontend & Serverless Backend) |

---

## 📁 Project Structure

```
PrePilot/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx  # Hero section, features, CTA
│   │   │   ├── AuthPage.jsx     # Login/Register split-screen
│   │   │   ├── ProfilePage.jsx  # 6-section comprehensive profile
│   │   │   ├── QuizPage.jsx     # Dynamic AI screening test
│   │   │   └── PlanPage.jsx     # 7-day action plan with PDF export
│   │   ├── services/
│   │   │   └── api.js           # Axios instance, token management, endpoints
│   │   ├── index.css            # Chocolate Truffle dark/neon theme system
│   │   ├── main.jsx             # React DOM entry and routing setup
│   │   └── App.jsx
│   ├── package.json             # npm dependencies
│   ├── vite.config.js           # Vite configuration
│   └── vercel.json              # Vercel deployment config for frontend
│
├── backend/
│   ├── main.py                  # FastAPI app, CORS
│   ├── database.py              # asyncpg connection pool
│   ├── models.py                # Pydantic schemas (auth + profile)
│   ├── requirements.txt         # Python dependencies
│   ├── .env.example             # Environment variable template
│   ├── vercel.json              # Serverless configuration for deployment
│   ├── utils/
│   │   ├── security.py          # bcrypt hashing, JWT logic
│   │   └── deps.py              # Auth dependency injection
│   └── routers/
│       ├── auth.py              # Login/Register endpoints
│       ├── profile.py           # User profile CRUD
│       ├── quiz.py              # AI Quiz proxy to n8n webhook
│       └── plan.py              # Action plan generation endpoint
│
└── README.md
```

---

## ✅ Core Features

| Feature | Description | Status |
|---------|-------------|--------|
| **Authentication** | Secure JWT-based login and registration | 🟢 Live |
| **Profile Builder** | Collects extensive data across 6 domains (Career, Tech, Prep) | 🟢 Live |
| **AI Screening Quiz** | n8n-powered webhook generates a custom technical quiz based on profile | 🟢 Live |
| **Action Plan** | 7-day milestone dashboard tailored to interview weaknesses | 🟢 Live |
| **PDF Export** | Download action plan directly as PDF (`html2pdf.js`) | 🟢 Live |

---

## 🚀 Setup & Run Locally

### Prerequisites
- Node.js (v18+)
- Python 3.10+
- PostgreSQL database (free at [neon.tech](https://neon.tech))

### 1. Database & Backend Setup

```bash
cd PrePilot/backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux
pip install -r requirements.txt
```

Edit backend `.env`:
```env
DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require
JWT_SECRET_KEY=your-random-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440
N8N_WEBHOOK_URL=https://your-n8n-instance/webhook/generate-quiz
```

Start the Server:
```bash
uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup

In a new terminal:
```bash
cd PrePilot/frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`. Make sure the `VITE_API_URL` in your frontend environment correctly points to the backend (or defaults to `http://localhost:8000/api`).

---

## ☁️ Deployment (Vercel)

The project includes `vercel.json` configurations for both the frontend and backend to enable seamless Vercel deployment.
- **Frontend:** Standard Vite build command (`npm run build`) mapped to `dist/`.
- **Backend:** FastAPI exposed as a standard Python serverless function.

---

## 📄 License

This project is for educational and personal use.
