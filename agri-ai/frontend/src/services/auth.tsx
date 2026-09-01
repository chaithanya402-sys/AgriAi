import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authApi } from './api'
import type { User } from '@/types'

interface AuthContextValue {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: { name: string; email: string; password: string; phone?: string; location?: string }) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('agriai_token'))
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const boot = async () => {
      const stored = localStorage.getItem('agriai_token')
      if (!stored) {
        setLoading(false)
        return
      }
      try {
        const me = await authApi.me()
        setUser(me)
      } catch {
        localStorage.removeItem('agriai_token')
        setToken(null)
      } finally {
        setLoading(false)
      }
    }
    boot()
  }, [])

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password)
    localStorage.setItem('agriai_token', res.access_token)
    setToken(res.access_token)
    setUser(res.user)
  }

  const register = async (data: { name: string; email: string; password: string; phone?: string; location?: string }) => {
    const res = await authApi.register(data)
    localStorage.setItem('agriai_token', res.access_token)
    setToken(res.access_token)
    setUser(res.user)
  }

  const logout = () => {
    localStorage.removeItem('agriai_token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
