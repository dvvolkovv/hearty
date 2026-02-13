import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPasswordApi } from '../api/auth'
import { Mail, ArrowLeft } from 'lucide-react'

export const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email) {
      setError('Введите email')
      return
    }

    setIsLoading(true)
    try {
      await forgotPasswordApi(email)
      setIsSubmitted(true)
    } catch (err: any) {
      setError('Произошла ошибка. Попробуйте снова.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-muted/30">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="h-8 w-8 text-green-600" />
            </div>

            <h1 className="text-3xl font-black text-foreground mb-4">
              Проверьте email
            </h1>

            <p className="text-muted-foreground mb-8">
              Мы отправили инструкции по восстановлению пароля на адрес{' '}
              <span className="font-semibold text-foreground">{email}</span>
            </p>

            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-primary font-bold hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Вернуться ко входу
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-muted/30">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="mb-8">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Назад
            </Link>

            <h1 className="text-4xl font-black text-foreground mb-3">
              Забыли пароль?
            </h1>

            <p className="text-muted-foreground">
              Введите email, и мы отправим вам ссылку для восстановления пароля
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-foreground mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-input rounded-2xl focus:border-primary focus:outline-none transition-colors"
                  placeholder="your@email.com"
                  disabled={isLoading}
                  aria-label="Email адрес"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white py-3 rounded-2xl font-bold hover:scale-105 transition-all shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              aria-label="Отправить ссылку для восстановления пароля"
            >
              {isLoading ? 'Отправка...' : 'Отправить ссылку для восстановления'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Вспомнили пароль?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline">
                Войти
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
