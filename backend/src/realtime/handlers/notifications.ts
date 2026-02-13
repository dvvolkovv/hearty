import { Server as SocketIOServer, Socket } from 'socket.io'
import prisma from '../../config/database'

/**
 * Register notification event handlers
 */
export const registerNotificationHandlers = (io: SocketIOServer, socket: Socket) => {
  const userId = socket.data.userId

  /**
   * Subscribe to notifications
   * User is automatically subscribed to their notification room on connection
   */
  socket.on('notifications:subscribe', () => {
    socket.join(`notifications:${userId}`)
    console.log(`User ${userId} subscribed to notifications`)
    socket.emit('notifications:subscribed', { userId })
  })

  /**
   * Unsubscribe from notifications
   */
  socket.on('notifications:unsubscribe', () => {
    socket.leave(`notifications:${userId}`)
    console.log(`User ${userId} unsubscribed from notifications`)
  })

  /**
   * Mark notification as read
   */
  socket.on('notifications:mark-read', async (data: { notificationId: string }) => {
    try {
      const { notificationId } = data

      // Verify notification belongs to user
      const notification = await prisma.notification.findFirst({
        where: {
          id: notificationId,
          userId
        }
      })

      if (!notification) {
        socket.emit('error', { message: 'Notification not found' })
        return
      }

      // Mark as read
      await prisma.notification.update({
        where: { id: notificationId },
        data: { readAt: new Date() }
      })

      socket.emit('notifications:read', { notificationId })
    } catch (error) {
      console.error('Error marking notification as read:', error)
      socket.emit('error', { message: 'Failed to mark notification as read' })
    }
  })

  /**
   * Mark all notifications as read
   */
  socket.on('notifications:mark-all-read', async () => {
    try {
      await prisma.notification.updateMany({
        where: {
          userId,
          readAt: null
        },
        data: {
          readAt: new Date()
        }
      })

      socket.emit('notifications:all-read', { userId })
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      socket.emit('error', { message: 'Failed to mark notifications as read' })
    }
  })

  /**
   * Get unread count
   */
  socket.on('notifications:get-unread-count', async () => {
    try {
      const count = await prisma.notification.count({
        where: {
          userId,
          readAt: null
        }
      })

      socket.emit('notifications:unread-count', { count })
    } catch (error) {
      console.error('Error getting unread count:', error)
      socket.emit('error', { message: 'Failed to get unread count' })
    }
  })
}

/**
 * Emit new notification to user
 * Called from services/notifications.ts after creating a notification
 */
export const emitNewNotification = (io: SocketIOServer, userId: string, notification: any) => {
  io.to(`user:${userId}`).emit('notification:new', notification)
  io.to(`notifications:${userId}`).emit('notification:new', notification)
}

/**
 * Emit notification update to user
 */
export const emitNotificationUpdate = (io: SocketIOServer, userId: string, notification: any) => {
  io.to(`user:${userId}`).emit('notification:updated', notification)
  io.to(`notifications:${userId}`).emit('notification:updated', notification)
}
