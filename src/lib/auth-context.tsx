'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface AuthUser {
  id: number
  name: string
  email: string
  role: string
  isActive: boolean
}

interface AuthCtx {
  user: AuthUser | null
  loading: boolean
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthCtx>({
  user: null,
  loading: true,
  refresh: async () => {},
})

let globalFetch: Promise<AuthUser | null> | null = null

async function fetchUser(): Promise<AuthUser | null> {
  try {
    const res = await fetch('/api/auth/me', { cache: 'no-store' })
    const data = await res.json()
    return data.user || null
  } catch {
    return null
  }
}

export function AuthProvider({ children, initialUser }: { children: React.ReactNode; initialUser?: AuthUser | null }) {
  const [user, setUser] = useState<AuthUser | null>(initialUser ?? null)
  const [loading, setLoading] = useState(!initialUser)

  useEffect(() => {
    if (initialUser) return
    if (!globalFetch) globalFetch = fetchUser()
    globalFetch.then((u) => {
      setUser(u)
      setLoading(false)
    })
  }, [initialUser])

  async function refresh() {
    setLoading(true)
    globalFetch = fetchUser()
    const u = await globalFetch
    setUser(u)
    setLoading(false)
  }

  return (
    <AuthContext.Provider value={{ user, loading, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useUser() {
  return useContext(AuthContext)
}
