import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { verifyEmailApi } from '../api/auth'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error')
        setMessage('Токен верификации отсутствует')
        return
      }

      try {
        const response = await verifyEmailApi(token)
        setStatus('success')
        setMessage(response.message || 'Email успешно подтвержден')
      } catch (err: any) {
        setStatus('error')
        setMessage(err.message || 'Не удалось подтвердить email')
      }
    }

    verify()
  }, [token])

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-muted/30">
      <div className="text-center max-w-md">
        {status === 'loading' && (
          <div className="bg-white rounded-3xl shadow-2xl p-12">
            <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto mb-6" />
            <p className="text-lg text-muted-foreground font-medium">Подтверждение email...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="bg-white rounded-3xl shadow-2xl p-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-4xl font-black text-foreground mb-4">
              Email подтвержден!
            </h1>
            <p className="text-muted-foreground mb-8 text-lg">{message}</p>
            <Link
              to="/login"
              className="inline-block bg-primary text-white px-8 py-3 rounded-2xl font-bold hover:scale-105 transition-all shadow-lg shadow-primary/30"
              aria-label="Войти в систему"
            >
              Войти в систему
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-white rounded-3xl shadow-2xl p-12">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
            <h1 className="text-4xl font-black text-foreground mb-4">
              Ошибка верификации
            </h1>
            <p className="text-muted-foreground mb-8 text-lg">{message}</p>
            <Link
              to="/"
              className="inline-block bg-primary text-white px-8 py-3 rounded-2xl font-bold hover:scale-105 transition-all shadow-lg shadow-primary/30"
              aria-label="Вернуться на главную страницу"
            >
              На главную
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
