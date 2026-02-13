import prisma from '../config/database'
import { NotificationType } from '@prisma/client'
import { getIO } from '../realtime/socket'

/**
 * Create an in-app notification for a user
 */
export const createInAppNotification = async (data: {
  userId: string
  subject?: string
  message: string
  actionUrl?: string
  data?: Record<string, any>
}) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: 'IN_APP',
        subject: data.subject,
        message: data.message,
        actionUrl: data.actionUrl,
        data: data.data,
        status: 'SENT', // IN_APP notifications are instantly "sent"
        sentAt: new Date()
      }
    })

    console.log(`In-app notification created for user ${data.userId}`)

    // Emit WebSocket event для real-time доставки
    try {
      const io = getIO()
      io.to(`user:${data.userId}`).emit('notification:new', {
        id: notification.id,
        type: notification.type,
        subject: notification.subject,
        message: notification.message,
        actionUrl: notification.actionUrl,
        data: notification.data,
        readAt: notification.readAt,
        createdAt: notification.createdAt
      })
    } catch (wsError) {
      // WebSocket not initialized yet, ignore
      console.log('WebSocket not available for notification')
    }

    return notification
  } catch (error) {
    console.error('Failed to create in-app notification:', error)
    throw error
  }
}

/**
 * Create an email notification (queued for sending)
 */
export const createEmailNotification = async (data: {
  userId: string
  subject: string
  message: string
  templateId?: string
  data?: Record<string, any>
}) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: 'EMAIL',
        subject: data.subject,
        message: data.message,
        templateId: data.templateId,
        data: data.data,
        status: 'PENDING'
      }
    })

    console.log(`Email notification queued for user ${data.userId}`)
    return notification
  } catch (error) {
    console.error('Failed to create email notification:', error)
    throw error
  }
}

// ========================================
// Notification Templates
// ========================================

/**
 * Booking created notification
 */
export const notifyBookingCreated = async (data: {
  clientId: string
  specialistId: string
  bookingId: string
  specialistName: string
  date: string
  time: string
}) => {
  // Notify client
  await createInAppNotification({
    userId: data.clientId,
    subject: 'Бронирование создано',
    message: `Ваше бронирование с ${data.specialistName} на ${data.date} в ${data.time} создано и ожидает подтверждения.`,
    actionUrl: `/bookings/${data.bookingId}`,
    data: { bookingId: data.bookingId, type: 'BOOKING_CREATED' }
  })

  // Notify specialist
  await createInAppNotification({
    userId: data.specialistId,
    subject: 'Новое бронирование',
    message: `У вас новое бронирование на ${data.date} в ${data.time}. Пожалуйста, подтвердите или отклоните его.`,
    actionUrl: `/bookings/${data.bookingId}`,
    data: { bookingId: data.bookingId, type: 'BOOKING_CREATED' }
  })
}

/**
 * Booking confirmed notification
 */
export const notifyBookingConfirmed = async (data: {
  clientId: string
  bookingId: string
  specialistName: string
  date: string
  time: string
}) => {
  await createInAppNotification({
    userId: data.clientId,
    subject: 'Бронирование подтверждено',
    message: `${data.specialistName} подтвердил(а) ваше бронирование на ${data.date} в ${data.time}.`,
    actionUrl: `/bookings/${data.bookingId}`,
    data: { bookingId: data.bookingId, type: 'BOOKING_CONFIRMED' }
  })
}

/**
 * Booking cancelled notification
 */
export const notifyBookingCancelled = async (data: {
  userId: string
  bookingId: string
  reason?: string
  cancelledBy: 'client' | 'specialist'
}) => {
  const message = data.cancelledBy === 'client'
    ? `Бронирование было отменено клиентом.${data.reason ? ` Причина: ${data.reason}` : ''}`
    : `Бронирование было отменено специалистом.${data.reason ? ` Причина: ${data.reason}` : ''}`

  await createInAppNotification({
    userId: data.userId,
    subject: 'Бронирование отменено',
    message,
    actionUrl: `/bookings/${data.bookingId}`,
    data: { bookingId: data.bookingId, type: 'BOOKING_CANCELLED' }
  })
}

/**
 * New message notification
 */
export const notifyNewMessage = async (data: {
  recipientId: string
  senderId: string
  senderName: string
  messagePreview: string
  roomId: string
}) => {
  await createInAppNotification({
    userId: data.recipientId,
    subject: 'Новое сообщение',
    message: `${data.senderName}: ${data.messagePreview}`,
    actionUrl: `/chat/${data.roomId}`,
    data: { roomId: data.roomId, senderId: data.senderId, type: 'NEW_MESSAGE' }
  })
}

/**
 * Payment received notification
 */
export const notifyPaymentReceived = async (data: {
  specialistId: string
  amount: number
  bookingId: string
  clientName: string
}) => {
  await createInAppNotification({
    userId: data.specialistId,
    subject: 'Оплата получена',
    message: `Получена оплата ${data.amount / 100} ₽ от ${data.clientName} за сессию.`,
    actionUrl: `/bookings/${data.bookingId}`,
    data: { bookingId: data.bookingId, amount: data.amount, type: 'PAYMENT_RECEIVED' }
  })
}

/**
 * Withdrawal completed notification
 */
export const notifyWithdrawalCompleted = async (data: {
  specialistId: string
  amount: number
  withdrawalId: string
}) => {
  await createInAppNotification({
    userId: data.specialistId,
    subject: 'Вывод средств завершен',
    message: `Вывод ${data.amount / 100} ₽ успешно завершен. Средства поступят на ваш счет в течение 1-3 рабочих дней.`,
    actionUrl: `/withdrawals/${data.withdrawalId}`,
    data: { withdrawalId: data.withdrawalId, amount: data.amount, type: 'WITHDRAWAL_COMPLETED' }
  })
}

/**
 * Review received notification
 */
export const notifyReviewReceived = async (data: {
  specialistId: string
  clientName: string
  rating: number
  reviewId: string
}) => {
  await createInAppNotification({
    userId: data.specialistId,
    subject: 'Новый отзыв',
    message: `${data.clientName} оставил(а) отзыв с оценкой ${data.rating}/5.`,
    actionUrl: `/reviews/${data.reviewId}`,
    data: { reviewId: data.reviewId, rating: data.rating, type: 'REVIEW_RECEIVED' }
  })
}

/**
 * Session reminder notification (15 minutes before)
 */
export const notifySessionReminder = async (data: {
  userId: string
  sessionId: string
  participantName: string
  time: string
}) => {
  await createInAppNotification({
    userId: data.userId,
    subject: 'Напоминание о сессии',
    message: `Сессия с ${data.participantName} начнется через 15 минут (в ${data.time}).`,
    actionUrl: `/sessions/${data.sessionId}`,
    data: { sessionId: data.sessionId, type: 'SESSION_REMINDER' }
  })
}

/**
 * Specialist profile approved notification
 */
export const notifySpecialistApproved = async (data: {
  specialistId: string
}) => {
  await createInAppNotification({
    userId: data.specialistId,
    subject: 'Профиль одобрен',
    message: 'Ваш профиль специалиста был одобрен модератором. Теперь вы можете принимать бронирования!',
    actionUrl: '/dashboard',
    data: { type: 'SPECIALIST_APPROVED' }
  })
}

/**
 * Specialist profile rejected notification
 */
export const notifySpecialistRejected = async (data: {
  specialistId: string
  reason?: string
}) => {
  const message = data.reason
    ? `Ваш профиль специалиста был отклонен. Причина: ${data.reason}`
    : 'Ваш профиль специалиста был отклонен. Пожалуйста, свяжитесь с поддержкой для уточнения причины.'

  await createInAppNotification({
    userId: data.specialistId,
    subject: 'Профиль отклонен',
    message,
    actionUrl: '/dashboard',
    data: { type: 'SPECIALIST_REJECTED', reason: data.reason }
  })
}
