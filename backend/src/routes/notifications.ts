import { Router } from 'express'
import prisma from '../config/database'
import { authenticate, AuthRequest } from '../middleware/auth'
import { AppError } from '../middleware/errorHandler'

const router = Router()

// Apply authentication to all routes
router.use(authenticate)

// ========================================
// Get Notifications
// ========================================
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id
    const { limit = '20', offset = '0', unreadOnly = 'false' } = req.query

    const limitNum = parseInt(limit as string, 10)
    const offsetNum = parseInt(offset as string, 10)

    // Build where clause
    const where: any = {
      userId,
      type: 'IN_APP' // Only return in-app notifications
    }

    if (unreadOnly === 'true') {
      where.isRead = false
    }

    // Get notifications
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limitNum,
      skip: offsetNum,
      select: {
        id: true,
        subject: true,
        message: true,
        actionUrl: true,
        data: true,
        isRead: true,
        readAt: true,
        createdAt: true
      }
    })

    // Get total count
    const total = await prisma.notification.count({ where })

    res.json({
      data: notifications,
      pagination: {
        total,
        limit: limitNum,
        offset: offsetNum,
        hasMore: offsetNum + limitNum < total
      }
    })
  } catch (error) {
    next(error)
  }
})

// ========================================
// Get Unread Count
// ========================================
router.get('/unread-count', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id

    const count = await prisma.notification.count({
      where: {
        userId,
        type: 'IN_APP',
        isRead: false
      }
    })

    res.json({
      data: { count }
    })
  } catch (error) {
    next(error)
  }
})

// ========================================
// Mark Notification as Read
// ========================================
router.put('/:id/read', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id
    const notificationId = req.params.id as string

    // Check if notification exists and belongs to user
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      select: { userId: true, isRead: true }
    })

    if (!notification) {
      throw new AppError('Notification not found', 404)
    }

    if (notification.userId !== userId) {
      throw new AppError('Access denied to this notification', 403)
    }

    if (notification.isRead) {
      // Already read, just return success
      res.json({
        message: 'Notification already marked as read'
      })
      return
    }

    // Mark as read
    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date()
      },
      select: {
        id: true,
        subject: true,
        message: true,
        actionUrl: true,
        data: true,
        isRead: true,
        readAt: true,
        createdAt: true
      }
    })

    res.json({
      message: 'Notification marked as read',
      data: updated
    })
  } catch (error) {
    next(error)
  }
})

// ========================================
// Mark All Notifications as Read
// ========================================
router.put('/read-all', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id

    const result = await prisma.notification.updateMany({
      where: {
        userId,
        type: 'IN_APP',
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    })

    res.json({
      message: 'All notifications marked as read',
      data: { count: result.count }
    })
  } catch (error) {
    next(error)
  }
})

// ========================================
// Delete Notification
// ========================================
router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id
    const notificationId = req.params.id as string

    // Check if notification exists and belongs to user
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      select: { userId: true }
    })

    if (!notification) {
      throw new AppError('Notification not found', 404)
    }

    if (notification.userId !== userId) {
      throw new AppError('Access denied to this notification', 403)
    }

    // Delete notification
    await prisma.notification.delete({
      where: { id: notificationId }
    })

    res.json({
      message: 'Notification deleted successfully',
      data: { id: notificationId }
    })
  } catch (error) {
    next(error)
  }
})

// ========================================
// Delete All Read Notifications
// ========================================
router.delete('/read/all', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id

    const result = await prisma.notification.deleteMany({
      where: {
        userId,
        type: 'IN_APP',
        isRead: true
      }
    })

    res.json({
      message: 'All read notifications deleted',
      data: { count: result.count }
    })
  } catch (error) {
    next(error)
  }
})

export default router
