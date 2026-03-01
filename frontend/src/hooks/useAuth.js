import { useEffect, useState } from 'react'
import { logout as apiLogout, getToken, getUser } from '../services/api'

export function useAuth() {
    const [user, setUser] = useState(getUser())
    const [isAuthenticated, setIsAuthenticated] = useState(!!getToken())

    useEffect(() => {
        setUser(getUser())
        setIsAuthenticated(!!getToken())
    }, [])

    const handleLogout = () => {
        apiLogout()
        setUser(null)
        setIsAuthenticated(false)
    }

    const refreshUser = () => {
        setUser(getUser())
        setIsAuthenticated(!!getToken())
    }

    return { user, isAuthenticated, logout: handleLogout, refreshUser }
}
