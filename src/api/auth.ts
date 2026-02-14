const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

interface LoginResponse {
  token: string
  user: {
    id: string
    email: string
    role: 'CLIENT' | 'SPECIALIST' | 'ADMIN'
    firstName?: string
    lastName?: string
    specialist?: any
    client?: any
  }
}

interface RegisterData {
  email: string
  password: string
  role: 'CLIENT' | 'SPECIALIST'
  firstName?: string
  lastName?: string
}

export const loginApi = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Login failed' }))
    throw new Error(error.error || error.message || `HTTP ${response.status}`)
  }

  return response.json()
}

export const registerApi = async (data: RegisterData): Promise<{ message: string; userId: string }> => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Registration failed' }))
    throw new Error(error.error || error.message || `HTTP ${response.status}`)
  }

  return response.json()
}

export const getMeApi = async (): Promise<{ user: any }> => {
  const token = localStorage.getItem('token')

  const response = await fetch(`${API_URL}/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch user')
  }

  return response.json()
}

export const forgotPasswordApi = async (email: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.error || error.message || `HTTP ${response.status}`)
  }

  return response.json()
}

export const resetPasswordApi = async (token: string, newPassword: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword })
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Reset failed' }))
    throw new Error(error.error || error.message || `HTTP ${response.status}`)
  }

  return response.json()
}

export const verifyEmailApi = async (token: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_URL}/auth/verify-email/${token}`)

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Verification failed' }))
    throw new Error(error.error || error.message || `HTTP ${response.status}`)
  }

  return response.json()
}
