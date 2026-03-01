import { Toaster } from 'react-hot-toast'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AuthPage from './pages/AuthPage'
import InterviewPage from './pages/InterviewPage'
import LandingPage from './pages/LandingPage'
import PlanPage from './pages/PlanPage'
import ProfilePage from './pages/ProfilePage'
import QuizPage from './pages/QuizPage'
import ReportPage from './pages/ReportPage'
import { getToken } from './services/api'

function ProtectedRoute({ children }) {
    return getToken() ? children : <Navigate to="/auth" replace />
}

function GuestRoute({ children }) {
    return getToken() ? <Navigate to="/profile" replace /> : children
}

export default function App() {
    return (
        <BrowserRouter>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: 'rgba(255,255,255,0.06)',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(16px)',
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '0.9rem',
                    },
                    success: {
                        style: { background: 'rgba(57,255,20,0.1)', border: '1px solid rgba(57,255,20,0.3)', color: '#39ff14' },
                    },
                    error: {
                        style: { background: 'rgba(255,16,240,0.1)', border: '1px solid rgba(255,16,240,0.3)', color: '#ff10f0' },
                    },
                }}
            />
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<GuestRoute><AuthPage /></GuestRoute>} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/quiz" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
                <Route path="/plan" element={<ProtectedRoute><PlanPage /></ProtectedRoute>} />
                <Route path="/interview" element={<ProtectedRoute><InterviewPage /></ProtectedRoute>} />
                <Route path="/report" element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    )
}
