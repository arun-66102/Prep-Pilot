import axios from 'axios'

const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' },
})

// Attach token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('prep_pilot_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

// ===== Auth =====
export async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('prep_pilot_token', data.access_token)
    localStorage.setItem('prep_pilot_user', JSON.stringify(data.user))
    return data
}

export async function register(full_name, email, password) {
    const { data } = await api.post('/auth/register', { full_name, email, password })
    localStorage.setItem('prep_pilot_token', data.access_token)
    localStorage.setItem('prep_pilot_user', JSON.stringify(data.user))
    return data
}

export function logout() {
    localStorage.removeItem('prep_pilot_token')
    localStorage.removeItem('prep_pilot_user')
}

export function getToken() {
    return localStorage.getItem('prep_pilot_token')
}

export function getUser() {
    const data = localStorage.getItem('prep_pilot_user')
    return data ? JSON.parse(data) : null
}

// ===== Profile =====
export async function getProfile() {
    const { data } = await api.get('/profile')
    return data
}

export async function updateProfile(profileData) {
    const { data } = await api.put('/profile', profileData)
    return data
}

export async function uploadResume(file) {
    const formData = new FormData()
    formData.append('file', file)
    const token = localStorage.getItem('prep_pilot_token')
    const { data } = await axios.post('/api/profile/resume', formData, {
        headers: { Authorization: `Bearer ${token}` },
    })
    return data
}

// ===== Quiz =====
export async function generateQuiz() {
    const { data } = await api.post('/quiz/generate')
    return data
}

// ===== Plan =====
export async function generatePlan(quizScore = null) {
    const { data } = await api.post('/plan/generate', { quiz_score: quizScore })
    return data
}

export async function getLatestPlan() {
    const { data } = await api.get('/plan/')
    return data
}

export async function updatePlanProgress(planId, completedTasks) {
    const { data } = await api.put(`/plan/${planId}/progress`, { completed_tasks: completedTasks })
    return data
}

// ===== Interview =====
export async function generateInterview() {
    const { data } = await api.post('/interview/generate')
    return data
}

export async function evaluateInterview(questions, answers, targetRole) {
    const { data } = await api.post('/interview/evaluate', {
        questions,
        answers,
        target_role: targetRole
    })
    return data
}

export default api
