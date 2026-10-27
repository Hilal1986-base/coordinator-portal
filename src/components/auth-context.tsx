'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'

interface Coordinator {
  id: string
  name: string
  email: string
  department: string
  role: string
}

interface AuthContextValue {
  coordinator: Coordinator | null
  loading: boolean
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  coordinator: null,
  loading: true,
  logout: async () => {},
  refresh: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [coordinator, setCoordinator] = useState<Coordinator | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', {
        cache: 'no-store',
        credentials: 'include', // مهم: إرسال الـ cookies
      })
      if (res.ok) {
        const data = await res.json()
        setCoordinator(data.coordinator || null)
        return data.coordinator
      } else {
        setCoordinator(null)
        return null
      }
    } catch {
      setCoordinator(null)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } catch {
      // ignore
    }
    setCoordinator(null)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return (
    <AuthContext.Provider value={{ coordinator, loading, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
