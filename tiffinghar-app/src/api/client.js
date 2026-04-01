import AsyncStorage from '@react-native-async-storage/async-storage'

// Change this to your backend URL
// For local dev: use your PC's LAN IP, e.g. http://192.168.1.4:5000
export const BASE_URL = 'http://192.168.1.4:5000/api'

const request = async (method, path, body = null) => {
  const token = await AsyncStorage.getItem('token')
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 8000) // 8s timeout

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })
    clearTimeout(timer)
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Request failed')
    return data
  } catch (err) {
    clearTimeout(timer)
    if (err.name === 'AbortError') throw new Error('Request timed out. Check your connection.')
    throw err
  }
}

export const api = {
  get:    (path)        => request('GET', path),
  post:   (path, body)  => request('POST', path, body),
  put:    (path, body)  => request('PUT', path, body),
  delete: (path)        => request('DELETE', path),
}
