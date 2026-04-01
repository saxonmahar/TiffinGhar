import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../api'
import { tokenStorage } from '../utils/tokenStorage'

const AuthContext = createContext(null)

// Local token helpers for offline fallback
const makeLocalToken = (phone, name) => 'local_' + btoa(JSON.stringify({ phone, name, id: phone, role: 'customer' }))
const parseLocalToken = (token) => {
  try {
    if (!token?.startsWith('local_')) return null
    return JSON.parse(atob(token.replace('local_', '')))
  } catch { return null }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 5000)
    tokenStorage.getToken()
      .then(token => {
        if (!token) { clearTimeout(timeout); setLoading(false); return }

        // Check local token first (works offline)
        const local = parseLocalToken(token)
        if (local) {
          setUser({ _id: local.phone, name: local.name, phone: local.phone, role: local.role })
          clearTimeout(timeout); setLoading(false); return
        }

        // Try real API
        authAPI.me()
          .then(data => setUser(data.user))
          .catch(() => tokenStorage.removeToken())
          .finally(() => { clearTimeout(timeout); setLoading(false) })
      })
      .catch(() => { clearTimeout(timeout); setLoading(false) })
  }, [])

  const login = async (phone, name, role = 'customer', extraData = {}) => {
    try {
      const data = await authAPI.login(phone, name, role, extraData)
      await tokenStorage.setToken(data.token)
      setUser(data.user)
      return data
    } catch {
      // Offline fallback — works without backend
      const userName = name || 'User'
      const token = makeLocalToken(phone, userName)
      await tokenStorage.setToken(token)
      const u = { _id: phone, name: userName, phone, role }
      setUser(u)
      return { user: u, token }
    }
  }

  const logout = async () => {
    await tokenStorage.removeToken()
    setUser(null)
  }

  const updateUser = (updates) => setUser(u => ({ ...u, ...updates }))

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
