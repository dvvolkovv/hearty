import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Eye, EyeOff, UserPlus, Heart, CheckCircle2, Rocket } from 'lucide-react'

export const RegisterSpecialist = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { register } = useAuth()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const validateForm = (): boolean => {
    const { firstName, lastName, email, password, confirmPassword } = formData

    if (!firstName.trim() || !lastName.trim() || !email || !password || !confirmPassword) {
      setError('Пожалуйста, заполните все поля')
      return false
    }

    if (!email.includes('@')) {
      setError('Пожалуйста, введите корректный email')
      return false
    }

    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов')
      return false
    }

    if (password !== confirmPassword) {
      setError('Пароли не совпадают')
      return false
    }

    if (!agreedToTerms) {
      setError('Необходимо согласиться с условиями использования')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      await register({
        email: formData.email,
        password: formData.password,
        role: 'SPECIALIST',
        firstName: formData.firstName,
        lastName: formData.lastName
      })
      setIsSuccess(true)
    } catch (err: any) {
      // User-friendly error messages
      if (err.message?.toLowerCase().includes('already exists') || err.message?.toLowerCase().includes('duplicate')) {
        setError('Этот email уже зарегистрирован. Попробуйте войти')
      } else if (err.message?.toLowerCase().includes('network') || err.message?.toLowerCase().includes('fetch')) {
        setError('Проблема с подключением к серверу. Проверьте интернет-соединение')
      } else {
        setError('Не удалось создать аккаунт. Попробуйте ещё раз')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
    if (!password) return { strength: 0, label: '', color: '' }

    let strength = 0
    if (password.length >= 6) strength++
    if (password.length >= 10) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++

    if (strength <= 2) return { strength, label: 'Слабый', color: 'bg-red-500' }
    if (strength <= 3) return { strength, label: 'Средний', color: 'bg-yellow-500' }
    return { strength, label: 'Надёжный', color: 'bg-green-500' }
  }

  const passwordStrength = getPasswordStrength(formData.password)

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="w-full max-w-md">
          <div className="bg-white border-2 border-border rounded-[3rem] p-12 shadow-xl text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-50 rounded-2xl mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-500" aria-label="Успешная регистрация" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-4">Регистрация успешна!</h1>
            <div className="bg-gradient-to-r from-primary/10 via-secondary/5 to-primary/10 border-2 border-primary/20 rounded-2xl p-6 mb-6">
              <Rocket className="w-8 h-8 text-primary mx-auto mb-3" aria-hidden="true" />
              <p className="text-sm text-foreground font-medium mb-3">
                Добро пожаловать в Hearty, {formData.firstName}!
              </p>
              <p className="text-xs text-muted-foreground mb-2">
                Проверьте вашу почту <span className="font-bold text-primary">{formData.email}</span> для подтверждения регистрации
              </p>
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  После подтверждения вы сможете пройти процесс онбординга и начать принимать клиентов
                </p>
              </div>
            </div>
            <Link
              to="/login"
              className="inline-block w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Перейти к входу
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="w-full max-w-md">
        <div className="bg-white border-2 border-border rounded-[3rem] p-12 shadow-xl">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
              <Heart className="w-8 h-8 text-primary" aria-label="Логотип Hearty" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Регистрация специалиста</h1>
            <p className="text-sm text-muted-foreground">Присоединяйтесь к сообществу профессионалов</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-2xl p-4 text-center">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="block text-sm font-bold text-foreground mb-2">
                  Имя
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Иван"
                  className="w-full bg-muted border-2 border-transparent focus:border-primary/20 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all placeholder:text-muted-foreground/60"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-bold text-foreground mb-2">
                  Фамилия
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Иванов"
                  className="w-full bg-muted border-2 border-transparent focus:border-primary/20 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all placeholder:text-muted-foreground/60"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-foreground mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
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
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Минимум 6 символов"
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
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${passwordStrength.color} transition-all`}
                        style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-muted-foreground">{passwordStrength.label}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-bold text-foreground mb-2">
                Подтверждение пароля
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Повторите пароль"
                  className="w-full bg-muted border-2 border-transparent focus:border-primary/20 rounded-xl px-4 py-3 pr-12 text-sm font-medium outline-none transition-all placeholder:text-muted-foreground/60"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  aria-label={showConfirmPassword ? 'Скрыть пароль' : 'Показать пароль'}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3">
              <input
                id="terms"
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-2 border-muted-foreground/30 text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
                disabled={isLoading}
              />
              <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                Я согласен с{' '}
                <Link to="/terms" className="text-primary font-bold hover:text-primary/80 transition-colors">
                  условиями использования
                </Link>{' '}
                и{' '}
                <Link to="/privacy" className="text-primary font-bold hover:text-primary/80 transition-colors">
                  политикой конфиденциальности
                </Link>
              </label>
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
                  <span>Регистрация...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" aria-hidden="true" />
                  <span>Зарегистрироваться</span>
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

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Уже есть аккаунт?{' '}
              <Link to="/login" className="font-bold text-primary hover:text-primary/80 transition-colors">
                Войти
              </Link>
            </p>
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
