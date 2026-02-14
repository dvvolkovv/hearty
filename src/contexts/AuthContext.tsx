import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { loginApi, registerApi, getMeApi } from '../api/auth'

interface User {
  id: string
  email: string
  role: 'CLIENT' | 'SPECIALIST' | 'ADMIN'
  firstName?: string
  lastName?: string
  avatar?: string | null
  phone?: string | null
  specialist?: {
    id: string
    name: string
    specialty: string
    image: string | null
  }
  client?: {
    id: string
    name?: string
  }
}

interface RegisterData {
  email: string
  password: string
  role: 'CLIENT' | 'SPECIALIST'
  firstName?: string
  lastName?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<{ message: string }>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user && !!token

  // Load user on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const userData = await getMeApi()
          setUser(userData.user)
        } catch (error) {
          console.error('Failed to load user:', error)
          localStorage.removeItem('token')
          setToken(null)
        }
      }
      setIsLoading(false)
    }
    loadUser()
  }, [token])

  const login = async (email: string, password: string) => {
    const response = await loginApi(email, password)
    localStorage.setItem('token', response.token)
    setToken(response.token)
    setUser(response.user)
  }

  const register = async (data: RegisterData) => {
    const result = await registerApi(data)
    // Auto-login after successful registration
    await login(data.email, data.password)
    return { message: result.message }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  const refreshUser = async () => {
    if (token) {
      const userData = await getMeApi()
      setUser(userData.user)
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
