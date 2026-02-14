import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Eye, EyeOff, LogIn, Heart } from 'lucide-react'

export const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Пожалуйста, заполните все поля')
      return
    }

    if (!email.includes('@')) {
      setError('Пожалуйста, введите корректный email')
      return
    }

    setIsLoading(true)
    try {
      await login(email, password)
      const from = (location.state as any)?.from?.pathname || '/dashboard'
      navigate(from, { replace: true })
    } catch (err: any) {
      // User-friendly error messages
      const msg = err.message?.toLowerCase() || ''
      if (msg.includes('verify') || msg.includes('email first')) {
        setError('Пожалуйста, подтвердите email перед входом. Проверьте почту')
      } else if (msg.includes('suspended')) {
        setError('Аккаунт заблокирован. Обратитесь в поддержку')
      } else if (msg.includes('unauthorized') || msg.includes('invalid')) {
        setError('Неверный email или пароль')
      } else if (msg.includes('network') || msg.includes('fetch')) {
        setError('Проблема с подключением к серверу. Проверьте интернет-соединение')
      } else {
        setError('Не удалось войти в систему. Попробуйте ещё раз')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="w-full max-w-md">
        <div className="bg-white border-2 border-border rounded-[3rem] p-12 shadow-xl">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
              <Heart className="w-8 h-8 text-primary" aria-label="Логотип Hearty" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Вход в Hearty</h1>
            <p className="text-sm text-muted-foreground">Добро пожаловать! Войдите в свой аккаунт</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-2xl p-4 text-center">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-foreground mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full bg-muted border-2 border-transparent focus:border-primary/20 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all placeholder:text-muted-foreground/60"
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-foreground mb-2">
                Пароль
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите пароль"
                  className="w-full bg-muted border-2 border-transparent focus:border-primary/20 rounded-xl px-4 py-3 pr-12 text-sm font-medium outline-none transition-all placeholder:text-muted-foreground/60"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm font-bold text-primary hover:text-primary/80 transition-colors"
              >
                Забыли пароль?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Вход...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" aria-hidden="true" />
                  <span>Войти</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-xs font-medium text-muted-foreground">или</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          {/* Registration Links */}
          <div className="space-y-3">
            <p className="text-sm text-center text-muted-foreground font-medium">
              Нет аккаунта? Зарегистрируйтесь как:
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/register/client"
                className="flex-1 text-center bg-muted hover:bg-muted/80 text-foreground px-6 py-3 rounded-xl font-bold text-sm transition-all border-2 border-transparent hover:border-primary/20"
              >
                Клиент
              </Link>
              <Link
                to="/register/specialist"
                className="flex-1 text-center bg-muted hover:bg-muted/80 text-foreground px-6 py-3 rounded-xl font-bold text-sm transition-all border-2 border-transparent hover:border-primary/20"
              >
                Специалист
              </Link>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  )
}
