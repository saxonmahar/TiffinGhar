import { createContext, useContext, useState, useEffect } from 'react'
import { Alert } from 'react-native'
import { authAPI } from '../api'
import { tokenStorage } from '../utils/tokenStorage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session on app start
  useEffect(() => {
    tokenStorage.getToken()
      .then(async token => {
        if (!token) { setLoading(false); return }
        try {
          const data = await authAPI.me()
          setUser(data.user)
        } catch {
          await tokenStorage.removeToken()
        } finally {
          setLoading(false)
        }
      })
      .catch(() => setLoading(false))
  }, [])

  // Phone login — direct, no OTP (add Twilio later for production)
  const login = async (phone, name, role = 'customer', extraData = {}) => {
    const data = await authAPI.login(phone, name, role, extraData)
    await tokenStorage.setToken(data.token)
    setUser(data.user)
    return data
  }

  // Google login — opens browser OAuth flow
  const loginWithGoogle = async () => {
    // TODO: Configure Google OAuth client ID in app.json
    // For now show a helpful message
    Alert.alert(
      'Google Login',
      'To enable Google login:\n1. Create a project at console.cloud.google.com\n2. Add your OAuth client ID to app.json\n\nFor now, use phone login.',
      [{ text: 'Use Phone Login' }]
    )
    throw new Error('Google login not configured yet')
  }

  // Facebook login — opens browser OAuth flow
  const loginWithFacebook = async () => {
    Alert.alert(
      'Facebook Login',
      'To enable Facebook login:\n1. Create an app at developers.facebook.com\n2. Add your App ID to app.json\n\nFor now, use phone login.',
      [{ text: 'Use Phone Login' }]
    )
    throw new Error('Facebook login not configured yet')
  }

  const logout = async () => {
    await tokenStorage.removeToken()
    setUser(null)
  }

  const updateUser = (updates) => setUser(u => ({ ...u, ...updates }))

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, loginWithFacebook, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
