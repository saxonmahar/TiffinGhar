import { useState, useEffect } from 'react'
import { BASE_URL } from '../api/client'

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [checking, setChecking] = useState(false)

  const check = async () => {
    setChecking(true)
    try {
      const res = await fetch(BASE_URL.replace('/api', '/'), {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      })
      setIsOnline(res.ok || res.status < 500)
    } catch {
      setIsOnline(false)
    } finally {
      setChecking(false)
    }
  }

  useEffect(() => {
    check()
    const interval = setInterval(check, 30000) // check every 30s
    return () => clearInterval(interval)
  }, [])

  return { isOnline, checking, recheck: check }
}
