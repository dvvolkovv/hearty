import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { CreditCard, CheckCircle, XCircle, Clock, Calendar, Download } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

interface Payment {
  id: string
  amount: number
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
  createdAt: string
  description?: string
  booking?: {
    id: string
    service: {
      title: string
    }
    specialist: {
      user: {
        firstName: string
        lastName: string
      }
    }
  }
}

type DateFilter = 'all' | 'month' | 'quarter' | 'year'

export const Payments = () => {
  const { user } = useAuth()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState<DateFilter>('all')

  useEffect(() => {
    loadPayments()
  }, [user])

  const loadPayments = async () => {
    if (!user) return

    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/payments`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to load payments')
      }

      const data = await response.json()
      setPayments(data.payments || [])
    } catch (error) {
      console.error('Failed to load payments:', error)
      setPayments([])
    } finally {
      setLoading(false)
    }
  }

  const filterPayments = () => {
    const now = new Date()
    return payments.filter(payment => {
      const paymentDate = new Date(payment.createdAt)

      switch (dateFilter) {
        case 'month':
          const monthAgo = new Date(now)
          monthAgo.setMonth(monthAgo.getMonth() - 1)
          return paymentDate >= monthAgo
        case 'quarter':
          const quarterAgo = new Date(now)
          quarterAgo.setMonth(quarterAgo.getMonth() - 3)
          return paymentDate >= quarterAgo
        case 'year':
          const yearAgo = new Date(now)
          yearAgo.setFullYear(yearAgo.getFullYear() - 1)
          return paymentDate >= yearAgo
        default:
          return true
      }
    })
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: Payment['status']) => {
    const badges = {
      PENDING: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock,
        text: 'Ожидает'
      },
      COMPLETED: {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle,
        text: 'Выполнен'
      },
      FAILED: {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: XCircle,
        text: 'Отклонен'
      },
      REFUNDED: {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: CheckCircle,
        text: 'Возврат'
      }
    }

    const badge = badges[status]
    const Icon = badge.icon

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-sm font-bold border-2 ${badge.color}`}>
        <Icon className="w-4 h-4" />
        {badge.text}
      </span>
    )
  }

  const calculateTotal = (status?: Payment['status']) => {
    return filterPayments()
      .filter(p => !status || p.status === status)
      .reduce((sum, p) => sum + p.amount, 0)
  }

  const filteredPayments = filterPayments()

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-black mb-8">История платежей</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-3xl p-6">
          <p className="text-sm font-bold text-green-600 mb-2">Всего получено</p>
          <p className="text-3xl font-black text-green-800">{calculateTotal('COMPLETED')} ₽</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-3xl p-6">
          <p className="text-sm font-bold text-yellow-600 mb-2">В ожидании</p>
          <p className="text-3xl font-black text-yellow-800">{calculateTotal('PENDING')} ₽</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-3xl p-6">
          <p className="text-sm font-bold text-blue-600 mb-2">Возвраты</p>
          <p className="text-3xl font-black text-blue-800">{calculateTotal('REFUNDED')} ₽</p>
        </div>
      </div>

      {/* Date filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        <button
          onClick={() => setDateFilter('all')}
          className={`px-6 py-2 rounded-2xl font-bold transition-colors ${
            dateFilter === 'all' ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'
          }`}
        >
          Все время
        </button>
        <button
          onClick={() => setDateFilter('month')}
          className={`px-6 py-2 rounded-2xl font-bold transition-colors ${
            dateFilter === 'month' ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'
          }`}
        >
          Месяц
        </button>
        <button
          onClick={() => setDateFilter('quarter')}
          className={`px-6 py-2 rounded-2xl font-bold transition-colors ${
            dateFilter === 'quarter' ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'
          }`}
        >
          Квартал
        </button>
        <button
          onClick={() => setDateFilter('year')}
          className={`px-6 py-2 rounded-2xl font-bold transition-colors ${
            dateFilter === 'year' ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'
          }`}
        >
          Год
        </button>
      </div>

      {/* Payments list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="bg-muted/30 rounded-3xl p-12 text-center">
          <CreditCard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">Платежи отсутствуют</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPayments.map(payment => (
            <div key={payment.id} className="bg-white border-2 border-border rounded-3xl p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Left side */}
                <div className="flex-1">
                  <div className="flex items-start gap-4 mb-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <CreditCard className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-1">
                        {payment.booking
                          ? payment.booking.service.title
                          : payment.description || 'Платеж'}
                      </h3>
                      {payment.booking && (
                        <p className="text-sm text-muted-foreground">
                          Специалист: {payment.booking.specialist.user.firstName}{' '}
                          {payment.booking.specialist.user.lastName}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {formatDate(payment.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right side */}
                <div className="flex flex-col lg:items-end gap-3">
                  <span className="text-2xl font-black text-primary">{payment.amount} ₽</span>
                  <div className="flex flex-wrap items-center gap-3">
                    {getStatusBadge(payment.status)}
                    <button className="flex items-center gap-2 px-4 py-2 bg-muted rounded-2xl font-bold hover:bg-muted/80 transition-colors">
                      <Download className="w-4 h-4" />
                      Квитанция
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Export section */}
      {filteredPayments.length > 0 && (
        <div className="mt-8 bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-border rounded-3xl p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold mb-1">Экспорт данных</h3>
              <p className="text-muted-foreground">Выгрузите историю платежей для отчетности</p>
            </div>
            <button className="px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-colors">
              Скачать отчет (CSV)
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
