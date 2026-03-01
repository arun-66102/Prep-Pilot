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

export default api
