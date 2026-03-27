import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { login as loginApi, getMe } from '../services/authService'

interface User {
  _id: string
  name: string
  email: string
  role: 'resident' | 'owner' | 'admin'
  profileImage?: string
  isVerified: boolean
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setAuthData: (token: string, user: User) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('nestease_token')
    const storedUser = localStorage.getItem('nestease_user')
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
      getMe().catch(() => logout())
    }
    setLoading(false)
  }, [])

  const setAuthData = (token: string, user: User) => {
    localStorage.setItem('nestease_token', token)
    localStorage.setItem('nestease_user', JSON.stringify(user))
    setToken(token)
    setUser(user)
  }

  const login = async (email: string, password: string) => {
    const res = await loginApi({ email, password })
    setAuthData(res.data.token, res.data.user)
  }

  const logout = () => {
    localStorage.removeItem('nestease_token')
    localStorage.removeItem('nestease_user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, setAuthData }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
