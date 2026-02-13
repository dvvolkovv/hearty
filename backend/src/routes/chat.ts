import { Router } from 'express'
import { prisma } from '../config/database'
import { authenticate, AuthRequest } from '../middleware/auth'
import { AppError } from '../middleware/errorHandler'

const router = Router()

// Все маршруты требуют авторизации
router.use(authenticate)

// ========================================
// GET /api/chat/rooms
// Получить список всех чат-комнат пользователя
// ========================================
router.get('/rooms', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id

    // Определяем роль пользователя
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        client: true,
        specialist: true
      }
    })

    if (!user) {
      throw new AppError('User not found', 404)
    }

    let rooms: any[] = []

    if (user.role === 'CLIENT' && user.client) {
      // Клиент: получаем его комнаты
      rooms = await prisma.chatRoom.findMany({
        where: {
          clientId: user.client.id
        },
        include: {
          specialist: {
            select: {
              id: true,
              name: true,
              image: true,
              specialty: true
            }
          },
          messages: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 1,
            select: {
              id: true,
              text: true,
              createdAt: true,
              isRead: true,
              senderId: true,
              senderRole: true
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      })

      // Подсчет непрочитанных сообщений от специалистов
      const roomsWithUnread = await Promise.all(
        rooms.map(async (room) => {
          const unreadCount = await prisma.message.count({
            where: {
              chatRoomId: room.id,
              isRead: false,
              senderRole: 'SPECIALIST' // Сообщения от специалиста
            }
          })

          return {
            ...room,
            unreadCount,
            lastMessage: room.messages[0] || null
          }
        })
      )

      res.json({
        rooms: roomsWithUnread.map(room => ({
          id: room.id,
          specialist: room.specialist,
          lastMessage: room.lastMessage,
          unreadCount: room.unreadCount,
          createdAt: room.createdAt,
          updatedAt: room.updatedAt
        }))
      })
    } else if (user.role === 'SPECIALIST' && user.specialist) {
      // Специалист: получаем его комнаты
      rooms = await prisma.chatRoom.findMany({
        where: {
          specialistId: user.specialist.id
        },
        include: {
          client: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: true
                }
              }
            }
          },
          messages: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 1,
            select: {
              id: true,
              text: true,
              createdAt: true,
              isRead: true,
              senderId: true,
              senderRole: true
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      })

      // Подсчет непрочитанных сообщений от клиентов
      const roomsWithUnread = await Promise.all(
        rooms.map(async (room) => {
          const unreadCount = await prisma.message.count({
            where: {
              chatRoomId: room.id,
              isRead: false,
              senderRole: 'CLIENT' // Сообщения от клиента
            }
          })

          return {
            ...room,
            unreadCount,
            lastMessage: room.messages[0] || null
          }
        })
      )

      res.json({
        rooms: roomsWithUnread.map(room => ({
          id: room.id,
          client: {
            id: room.client.id,
            name: room.client.name ||
                  `${room.client.user.firstName || ''} ${room.client.user.lastName || ''}`.trim() ||
                  'Клиент',
            avatar: room.client.user.avatar
          },
          lastMessage: room.lastMessage,
          unreadCount: room.unreadCount,
          createdAt: room.createdAt,
          updatedAt: room.updatedAt
        }))
      })
    } else {
      throw new AppError('Only clients and specialists can access chat', 403)
    }
  } catch (error) {
    next(error)
  }
})

// ========================================
// GET /api/chat/rooms/:roomId/messages
// Получить сообщения из комнаты (с пагинацией)
// ========================================
router.get('/rooms/:roomId/messages', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id
    const roomId = req.params.roomId as string
    const limit = parseInt(req.query.limit as string) || 50
    const offset = parseInt(req.query.offset as string) || 0

    // Проверяем доступ к комнате
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        client: true,
        specialist: true
      }
    })

    if (!user) {
      throw new AppError('User not found', 404)
    }

    const room = await prisma.chatRoom.findUnique({
      where: { id: roomId }
    })

    if (!room) {
      throw new AppError('Chat room not found', 404)
    }

    // Проверяем что пользователь - участник комнаты
    const isParticipant =
      (user.role === 'CLIENT' && user.client && room.clientId === user.client.id) ||
      (user.role === 'SPECIALIST' && user.specialist && room.specialistId === user.specialist.id)

    if (!isParticipant) {
      throw new AppError('Access denied to this chat room', 403)
    }

    // Получаем сообщения
    const messages = await prisma.message.findMany({
      where: {
        chatRoomId: roomId
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: offset,
      take: limit
    })

    // Получаем общее количество
    const total = await prisma.message.count({
      where: {
        chatRoomId: roomId
      }
    })

    res.json({
      messages: messages.reverse(), // Возвращаем в хронологическом порядке
      total,
      limit,
      offset
    })
  } catch (error) {
    next(error)
  }
})

// ========================================
// POST /api/chat/messages
// Отправить сообщение
// ========================================
router.post('/messages', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id
    const { recipientId, text, attachments } = req.body

    if (!recipientId || !text) {
      throw new AppError('recipientId and text are required', 400)
    }

    if (text.trim().length === 0) {
      throw new AppError('Message text cannot be empty', 400)
    }

    // Получаем информацию об отправителе
    const sender = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        client: true,
        specialist: true
      }
    })

    if (!sender) {
      throw new AppError('User not found', 404)
    }

    // Получаем информацию о получателе
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
      include: {
        client: true,
        specialist: true
      }
    })

    if (!recipient) {
      throw new AppError('Recipient not found', 404)
    }

    // Проверяем что это общение между клиентом и специалистом
    const isClientToSpecialist =
      (sender.role === 'CLIENT' && recipient.role === 'SPECIALIST') ||
      (sender.role === 'SPECIALIST' && recipient.role === 'CLIENT')

    if (!isClientToSpecialist) {
      throw new AppError('Chat is only available between clients and specialists', 400)
    }

    // Определяем clientId и specialistId
    let clientId: string
    let specialistId: string

    if (sender.role === 'CLIENT' && sender.client && recipient.specialist) {
      clientId = sender.client.id
      specialistId = recipient.specialist.id
    } else if (sender.role === 'SPECIALIST' && sender.specialist && recipient.client) {
      clientId = recipient.client.id
      specialistId = sender.specialist.id
    } else {
      throw new AppError('Invalid sender or recipient profile', 400)
    }

    // Находим или создаем комнату
    let room = await prisma.chatRoom.findUnique({
      where: {
        clientId_specialistId: {
          clientId,
          specialistId
        }
      }
    })

    if (!room) {
      // Создаем новую комнату
      room = await prisma.chatRoom.create({
        data: {
          clientId,
          specialistId
        }
      })
    }

    // Создаем сообщение
    const message = await prisma.message.create({
      data: {
        chatRoomId: room.id,
        senderId: userId,
        senderRole: sender.role,
        text: text.trim(),
        attachments: attachments || []
      }
    })

    // Обновляем updatedAt комнаты
    await prisma.chatRoom.update({
      where: { id: room.id },
      data: {
        updatedAt: new Date()
      }
    })

    // Emit WebSocket event для real-time доставки
    const io = req.app.locals.io
    if (io) {
      // Отправляем событие в комнату чата
      io.to(`chat:${room.id}`).emit('chat:message:new', {
        id: message.id,
        chatRoomId: message.chatRoomId,
        senderId: message.senderId,
        senderRole: message.senderRole,
        text: message.text,
        attachments: message.attachments,
        isRead: message.isRead,
        readAt: message.readAt,
        createdAt: message.createdAt
      })

      // Также отправляем в личную комнату получателя для уведомления
      io.to(`user:${recipientId}`).emit('chat:message:new', {
        id: message.id,
        chatRoomId: message.chatRoomId,
        senderId: message.senderId,
        senderRole: message.senderRole,
        text: message.text,
        attachments: message.attachments,
        isRead: message.isRead,
        readAt: message.readAt,
        createdAt: message.createdAt
      })
    }

    res.status(201).json({
      message: 'Message sent successfully',
      data: message
    })
  } catch (error) {
    next(error)
  }
})

// ========================================
// PUT /api/chat/messages/:id/read
// Пометить сообщение как прочитанное
// ========================================
router.put('/messages/:id/read', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id
    const messageId = req.params.id as string

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        chatRoom: true
      }
    })

    if (!message) {
      throw new AppError('Message not found', 404)
    }

    // Проверяем что пользователь - получатель (не отправитель)
    if (message.senderId === userId) {
      throw new AppError('Cannot mark own message as read', 400)
    }

    // Проверяем что пользователь - участник комнаты
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        client: true,
        specialist: true
      }
    })

    if (!user) {
      throw new AppError('User not found', 404)
    }

    const isParticipant =
      (user.role === 'CLIENT' && user.client && message.chatRoom.clientId === user.client.id) ||
      (user.role === 'SPECIALIST' && user.specialist && message.chatRoom.specialistId === user.specialist.id)

    if (!isParticipant) {
      throw new AppError('Access denied', 403)
    }

    // Помечаем как прочитанное
    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        isRead: true,
        readAt: new Date()
      }
    })

    // Emit WebSocket event для уведомления отправителя
    const io = req.app.locals.io
    if (io) {
      io.to(`chat:${message.chatRoom.id}`).emit('chat:message:read', {
        messageId: updatedMessage.id,
        roomId: message.chatRoom.id,
        readBy: userId,
        readAt: updatedMessage.readAt
      })

      // Также отправляем в личную комнату отправителя
      io.to(`user:${message.senderId}`).emit('chat:message:read', {
        messageId: updatedMessage.id,
        roomId: message.chatRoom.id,
        readBy: userId,
        readAt: updatedMessage.readAt
      })
    }

    res.json({
      message: 'Message marked as read',
      data: updatedMessage
    })
  } catch (error) {
    next(error)
  }
})

// ========================================
// PUT /api/chat/rooms/:roomId/read-all
// Пометить все сообщения в комнате как прочитанные
// ========================================
router.put('/rooms/:roomId/read-all', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id
    const roomId = req.params.roomId as string

    // Проверяем доступ к комнате
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        client: true,
        specialist: true
      }
    })

    if (!user) {
      throw new AppError('User not found', 404)
    }

    const room = await prisma.chatRoom.findUnique({
      where: { id: roomId }
    })

    if (!room) {
      throw new AppError('Chat room not found', 404)
    }

    // Проверяем что пользователь - участник комнаты
    const isParticipant =
      (user.role === 'CLIENT' && user.client && room.clientId === user.client.id) ||
      (user.role === 'SPECIALIST' && user.specialist && room.specialistId === user.specialist.id)

    if (!isParticipant) {
      throw new AppError('Access denied to this chat room', 403)
    }

    // Определяем роль собеседника (чьи сообщения нужно пометить)
    const otherRole = user.role === 'CLIENT' ? 'SPECIALIST' : 'CLIENT'

    // Помечаем все непрочитанные сообщения от собеседника
    const result = await prisma.message.updateMany({
      where: {
        chatRoomId: roomId,
        senderRole: otherRole,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    })

    res.json({
      message: 'All messages marked as read',
      count: result.count
    })
  } catch (error) {
    next(error)
  }
})

export default router
