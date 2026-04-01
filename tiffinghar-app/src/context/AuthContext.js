import { createContext, useContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { authAPI } from '../api'

// ── Offline/local fallback token ──────────────────────────────────────────────
const makeLocalToken = (phone, name) =>
  'local_' + btoa(JSON.stringify({ phone, name, id: phone, role: 'customer' }))

const parseLocalToken = (token) => {
  try {
    if (!token?.startsWith('local_')) return null
    return JSON.parse(atob(token.replace('local_', '')))
  } catch { return null }
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 5000)
    AsyncStorage.getItem('token').then(token => {
      if (token) {
        // Check local token first (offline mode)
        const local = parseLocalToken(token)
        if (local) {
          setUser({ _id: local.phone, name: local.name, phone: local.phone, role: local.role })
          clearTimeout(timeout)
          setLoading(false)
          return
        }
        // Try real API
        authAPI.me()
          .then(data => setUser(data.user))
          .catch(() => AsyncStorage.removeItem('token'))
          .finally(() => { clearTimeout(timeout); setLoading(false) })
      } else {
        clearTimeout(timeout)
        setLoading(false)
      }
    }).catch(() => { clearTimeout(timeout); setLoading(false) })
  }, [])

  const login = async (phone, name, role = 'customer', extraData = {}) => {
    try {
      const data = await authAPI.login(phone, name, role, extraData)
      await AsyncStorage.setItem('token', data.token)
      setUser(data.user)
      return data
    } catch {
      // Fallback: local login
      const userName = name || 'User'
      const token = makeLocalToken(phone, userName)
      await AsyncStorage.setItem('token', token)
      const user = { _id: phone, name: userName, phone, role: role || 'customer', ...extraData }
      setUser(user)
      return { user, token }
    }
  }

  const logout = async () => {
    await AsyncStorage.removeItem('token')
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
