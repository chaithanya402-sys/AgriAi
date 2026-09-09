import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authApi, getAuthToken, setAuthToken } from '../services/api'
import type { User } from '../types'

interface AuthContextValue {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, pass: string) => Promise<void>
  register: (data: { name: string; email: string; password: string; phone?: string; location?: string }) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setTokenState] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStoredAuth() {
      try {
        const storedToken = await getAuthToken()
        if (storedToken) {
          setTokenState(storedToken)
          try {
            const me = await authApi.me()
            setUser(me)
          } catch {
            // Token might be expired
            await setAuthToken(null)
            setTokenState(null)
          }
        }
      } catch (err) {
        console.warn('Error loading auth from storage:', err)
      } finally {
        setLoading(false)
      }
    }
    loadStoredAuth()
  }, [])

  const login = async (email: string, pass: string) => {
    const res = await authApi.login(email, pass)
    await setAuthToken(res.access_token)
    setTokenState(res.access_token)
    setUser(res.user)
  }

  const register = async (data: {
    name: string
    email: string
    password: string
    phone?: string
    location?: string
  }) => {
    const res = await authApi.register(data)
    await setAuthToken(res.access_token)
    setTokenState(res.access_token)
    setUser(res.user)
  }

  const logout = async () => {
    await setAuthToken(null)
    setTokenState(null)
    setUser(null)
  }

  const refreshUser = async () => {
    if (!token) return
    try {
      const me = await authApi.me()
      setUser(me)
    } catch (err) {
      console.warn('Failed to refresh user:', err)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
