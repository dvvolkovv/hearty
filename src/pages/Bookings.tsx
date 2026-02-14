import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Calendar, Clock, MapPin, User, MessageCircle, X, CheckCircle, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

interface Booking {
  id: string
  service: {
    id: string
    title: string
    duration: number
    price: number
  }
  specialist: {
    id: string
    user: {
      firstName: string
      lastName: string
      avatar?: string
    }
  }
  client: {
    id: string
    user: {
      firstName: string
      lastName: string
      avatar?: string
    }
  }
  date: string
  startTime: string
  endTime: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  notes?: string
  location?: string
}

type FilterType = 'upcoming' | 'past' | 'cancelled'

export const Bookings = () => {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filter, setFilter] = useState<FilterType>('upcoming')
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  useEffect(() => {
    loadBookings()
  }, [user])

  const loadBookings = async () => {
    if (!user) return

    setLoading(true)
    try {
      const clientId = user.role === 'CLIENT' ? user.client?.id : undefined
      const specialistId = user.role === 'SPECIALIST' ? user.specialist?.id : undefined

      const params = new URLSearchParams()
      if (clientId) params.set('clientId', clientId)
      if (specialistId) params.set('specialistId', specialistId)

      const response = await fetch(`${API_URL}/bookings?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to load bookings')
      }

      const data = await response.json()
      setBookings(data.bookings || [])
    } catch (error) {
      console.error('Failed to load bookings:', error)
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Вы уверены, что хотите отменить эту запись?')) return

    setCancellingId(bookingId)
    try {
      const response = await fetch(`${API_URL}/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: 'CANCELLED' })
      })

      if (!response.ok) {
        throw new Error('Failed to cancel booking')
      }

      await loadBookings()
    } catch (error) {
      console.error('Failed to cancel booking:', error)
      alert('Не удалось отменить запись')
    } finally {
      setCancellingId(null)
    }
  }

  const filterBookings = () => {
    const now = new Date()
    return bookings.filter(booking => {
      const bookingDate = new Date(`${booking.date}T${booking.startTime}`)

      switch (filter) {
        case 'upcoming':
          return bookingDate >= now && booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED'
        case 'past':
          return bookingDate < now || booking.status === 'COMPLETED'
        case 'cancelled':
          return booking.status === 'CANCELLED'
        default:
          return true
      }
    })
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatTime = (time: string) => {
    return time.slice(0, 5)
  }

  const getStatusBadge = (status: Booking['status']) => {
    const badges = {
      PENDING: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: AlertCircle,
        text: 'Ожидает подтверждения'
      },
      CONFIRMED: {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle,
        text: 'Подтверждено'
      },
      CANCELLED: {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: X,
        text: 'Отменено'
      },
      COMPLETED: {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: CheckCircle,
        text: 'Завершено'
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

  const filteredBookings = filterBookings()

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-black mb-8">Мои записи</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-6 py-2 rounded-2xl font-bold transition-colors ${
            filter === 'upcoming' ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'
          }`}
        >
          Предстоящие
        </button>
        <button
          onClick={() => setFilter('past')}
          className={`px-6 py-2 rounded-2xl font-bold transition-colors ${
            filter === 'past' ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'
          }`}
        >
          Прошедшие
        </button>
        <button
          onClick={() => setFilter('cancelled')}
          className={`px-6 py-2 rounded-2xl font-bold transition-colors ${
            filter === 'cancelled' ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'
          }`}
        >
          Отмененные
        </button>
      </div>

      {/* Bookings list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-muted/30 rounded-3xl p-12 text-center">
          <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">
            {filter === 'upcoming' && 'У вас нет предстоящих записей'}
            {filter === 'past' && 'У вас нет прошедших записей'}
            {filter === 'cancelled' && 'У вас нет отмененных записей'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map(booking => {
            const otherPerson = user?.role === 'CLIENT' ? booking.specialist : booking.client
            const otherPersonName = `${otherPerson.user.firstName} ${otherPerson.user.lastName}`

            return (
              <div key={booking.id} className="bg-white border-2 border-border rounded-3xl p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  {/* Left side - Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-4">
                      {/* Avatar */}
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-muted flex items-center justify-center flex-shrink-0">
                        {otherPerson.user.avatar ? (
                          <img src={otherPerson.user.avatar} alt={otherPersonName} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-1">{booking.service.title}</h3>
                        <p className="text-muted-foreground mb-2">
                          {user?.role === 'CLIENT' ? 'Специалист:' : 'Клиент:'} {otherPersonName}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(booking.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                          </span>
                          {booking.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {booking.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {booking.notes && (
                      <div className="bg-muted/30 rounded-2xl p-4 mb-4">
                        <p className="text-sm font-bold text-muted-foreground mb-1">Комментарий:</p>
                        <p className="text-sm">{booking.notes}</p>
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-primary">{booking.service.price} ₽</span>
                      <span className="text-muted-foreground">• {booking.service.duration} мин</span>
                    </div>
                  </div>

                  {/* Right side - Actions */}
                  <div className="flex flex-col gap-3 lg:items-end">
                    {getStatusBadge(booking.status)}

                    <div className="flex flex-wrap gap-3">
                      {/* Message button */}
                      <Link
                        to={`/messages?userId=${otherPerson.id}`}
                        className="flex items-center gap-2 px-4 py-2 bg-muted rounded-2xl font-bold hover:bg-muted/80 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Написать
                      </Link>

                      {/* Cancel button - only for upcoming bookings */}
                      {filter === 'upcoming' && booking.status !== 'CANCELLED' && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          disabled={cancellingId === booking.id}
                          className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-2xl font-bold hover:bg-red-200 transition-colors disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                          {cancellingId === booking.id ? 'Отмена...' : 'Отменить'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
