import { tokenStorage } from '../utils/tokenStorage'

// Priority: EXPO_PUBLIC_API_BASE_URL env var → LAN IP fallback
// To change: update tiffinghar-app/.env with your PC's LAN IP
export const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.1.4:5000/api'
export const SOCKET_URL = BASE_URL.replace('/api', '')

const request = async (method, path, body = null) => {
  let token = null
  try { token = await tokenStorage.getToken() } catch {}

  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 8000)

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })
    clearTimeout(timer)
    const raw = await res.text()
    let data = {}
    try { data = raw ? JSON.parse(raw) : {} } catch { data = { message: raw || 'Server error' } }
    if (!res.ok) throw new Error(data.message || 'Request failed')
    return data
  } catch (err) {
    clearTimeout(timer)
    if (err.name === 'AbortError') throw new Error('Request timed out. Check your connection.')
    throw err
  }
}

export const api = {
  get:    (path)       => request('GET', path),
  post:   (path, body) => request('POST', path, body),
  put:    (path, body) => request('PUT', path, body),
  delete: (path)       => request('DELETE', path),
}
