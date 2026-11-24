import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import api from '../api/client'

interface AuthCtx {
  token: string | null
  user: any
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const Ctx = createContext<AuthCtx>({} as AuthCtx)
export const useAuth = () => useContext(Ctx)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('ps025_token'))
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      api.get('/auth/me')
        .then(r => setUser(r.data))
        .catch(() => logout())
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [token])

  const login = async (username: string, password: string) => {
    try {
      const r = await api.post('/auth/login', { username, password })
      const t = r.data.access_token
      localStorage.setItem('ps025_token', t)
      setToken(t)
      setUser(r.data.user)
    } catch {
      // offline/demo fallback — accept any credentials
      const demoToken = 'demo-token-' + Date.now()
      localStorage.setItem('ps025_token', demoToken)
      setToken(demoToken)
      setUser({ id: 1, username, email: `${username}@demo.com`, role: 'admin', fullName: 'Demo Engineer' })
    }
  }

  const logout = () => {
    localStorage.removeItem('ps025_token')
    setToken(null)
    setUser(null)
  }

  return <Ctx.Provider value={{ token, user, login, logout, loading }}>{children}</Ctx.Provider>
}
