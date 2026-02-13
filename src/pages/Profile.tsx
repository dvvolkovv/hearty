import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { User, Mail, Phone, Lock, Camera, Save } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export const Profile = () => {
  const { user, refreshUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    avatar: user?.avatar || ''
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleSave = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`${API_URL}/api/users/${user?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      await refreshUser()
      setSuccess('Профиль успешно обновлен')
      setIsEditing(false)
    } catch (err) {
      setError('Не удалось обновить профиль')
      console.error('Profile update error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Пароли не совпадают')
      return
    }

    if (passwordData.newPassword.length < 6) {
      setError('Пароль должен содержать минимум 6 символов')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`${API_URL}/api/users/${user?.id}/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      if (!response.ok) {
        throw new Error('Failed to change password')
      }

      setSuccess('Пароль успешно изменен')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (err) {
      setError('Не удалось изменить пароль')
      console.error('Password change error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('avatar', file)

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_URL}/api/users/${user?.id}/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to upload avatar')
      }

      const data = await response.json()
      setFormData(prev => ({ ...prev, avatar: data.avatarUrl }))
      await refreshUser()
      setSuccess('Аватар успешно обновлен')
    } catch (err) {
      setError('Не удалось загрузить аватар')
      console.error('Avatar upload error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <p className="text-muted-foreground">Загрузка...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-black mb-8">Профиль</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-2xl text-green-600">
          {success}
        </div>
      )}

      {/* Avatar Section */}
      <div className="bg-white border-2 border-border rounded-3xl p-8 mb-6">
        <h2 className="text-2xl font-bold mb-6">Фотография профиля</h2>
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-muted flex items-center justify-center">
              {formData.avatar ? (
                <img src={formData.avatar} alt={user.firstName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-muted-foreground" />
              )}
            </div>
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
            >
              <Camera className="w-4 h-4" />
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={loading}
              />
            </label>
          </div>
          <div>
            <p className="font-bold text-lg">{user.firstName} {user.lastName}</p>
            <p className="text-muted-foreground">{user.email}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {user.role === 'CLIENT' ? 'Клиент' : user.role === 'SPECIALIST' ? 'Специалист' : 'Администратор'}
            </p>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white border-2 border-border rounded-3xl p-8 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Личная информация</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-2 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-colors"
            >
              Редактировать
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-muted-foreground mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Имя
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              disabled={!isEditing}
              className="w-full px-4 py-3 border-2 border-border rounded-2xl focus:outline-none focus:border-primary disabled:bg-muted disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-muted-foreground mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Фамилия
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              disabled={!isEditing}
              className="w-full px-4 py-3 border-2 border-border rounded-2xl focus:outline-none focus:border-primary disabled:bg-muted disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-muted-foreground mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-4 py-3 border-2 border-border rounded-2xl bg-muted cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground mt-1">Email нельзя изменить</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-muted-foreground mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              Телефон
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={!isEditing}
              placeholder="+7 (999) 999-99-99"
              className="w-full px-4 py-3 border-2 border-border rounded-2xl focus:outline-none focus:border-primary disabled:bg-muted disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {isEditing && (
          <div className="flex gap-4 mt-6">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              Сохранить изменения
            </button>
            <button
              onClick={() => {
                setIsEditing(false)
                setFormData({
                  firstName: user.firstName || '',
                  lastName: user.lastName || '',
                  phone: user.phone || '',
                  avatar: user.avatar || ''
                })
              }}
              disabled={loading}
              className="px-6 py-3 bg-muted rounded-2xl font-bold hover:bg-muted/80 transition-colors disabled:opacity-50"
            >
              Отмена
            </button>
          </div>
        )}
      </div>

      {/* Security Section */}
      <div className="bg-white border-2 border-border rounded-3xl p-8 mb-6">
        <h2 className="text-2xl font-bold mb-6">
          <Lock className="w-6 h-6 inline mr-2" />
          Безопасность
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-muted-foreground mb-2">
              Текущий пароль
            </label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              className="w-full px-4 py-3 border-2 border-border rounded-2xl focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-muted-foreground mb-2">
              Новый пароль
            </label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              className="w-full px-4 py-3 border-2 border-border rounded-2xl focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-muted-foreground mb-2">
              Подтвердите новый пароль
            </label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              className="w-full px-4 py-3 border-2 border-border rounded-2xl focus:outline-none focus:border-primary"
            />
          </div>

          <button
            onClick={handlePasswordChange}
            disabled={loading || !passwordData.currentPassword || !passwordData.newPassword}
            className="px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            Изменить пароль
          </button>
        </div>
      </div>

      {/* Specialist Profile Link */}
      {user.role === 'SPECIALIST' && (
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-border rounded-3xl p-8">
          <h3 className="text-xl font-bold mb-2">Профиль специалиста</h3>
          <p className="text-muted-foreground mb-4">
            Управляйте своими услугами, расписанием и портфолио
          </p>
          <Link
            to="/specialist/profile/edit"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-colors"
          >
            Редактировать профиль специалиста →
          </Link>
        </div>
      )}
    </div>
  )
}
