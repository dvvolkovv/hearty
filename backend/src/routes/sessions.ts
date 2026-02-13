import { Router } from 'express'
import { prisma } from '../config/database'
import { authenticate, AuthRequest } from '../middleware/auth'
import { AppError } from '../middleware/errorHandler'

const router = Router()

// Все routes требуют авторизации
router.use(authenticate)

// POST /api/sessions - Создать сессию из подтвержденного бронирования
router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id
    const { bookingId } = req.body

    // Валидация
    if (!bookingId) {
      throw new AppError('Booking ID is required', 400)
    }

    // Проверяем что пользователь - специалист
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { specialist: true }
    })

    if (!user?.specialist) {
      throw new AppError('Only specialists can create sessions', 403)
    }

    // Проверяем бронирование
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            user: {
              select: {
                avatar: true
              }
            }
          }
        },
        specialist: {
          select: {
            id: true,
            name: true,
            specialty: true
          }
        }
      }
    })

    if (!booking) {
      throw new AppError('Booking not found', 404)
    }

    // Проверяем что это бронирование специалиста
    if (booking.specialistId !== user.specialist.id) {
      throw new AppError('You can only create sessions for your own bookings', 403)
    }

    // Проверяем статус бронирования
    if (booking.status !== 'CONFIRMED') {
      throw new AppError('Can only create session for confirmed bookings', 400)
    }

    // Проверяем что сессия еще не создана
    const existingSession = await prisma.session.findUnique({
      where: { bookingId }
    })

    if (existingSession) {
      throw new AppError('Session already exists for this booking', 400)
    }

    // Создаем сессию
    const session = await prisma.session.create({
      data: {
        bookingId,
        clientId: booking.clientId,
        specialistId: booking.specialistId,
        startedAt: new Date()
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            user: {
              select: {
                avatar: true
              }
            }
          }
        },
        specialist: {
          select: {
            id: true,
            name: true,
            specialty: true
          }
        },
        booking: {
          select: {
            date: true,
            time: true,
            price: true
          }
        }
      }
    })

    res.status(201).json({
      message: 'Session created successfully',
      session
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/sessions - Получить список сессий пользователя
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id
    const { page = '1', limit = '10', status, dateFrom, dateTo } = req.query

    // Определяем роль пользователя
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        specialist: true,
        client: true
      }
    })

    if (!user) {
      throw new AppError('User not found', 404)
    }

    // Построение условий фильтрации
    const where: any = {}

    if (user.specialist) {
      where.specialistId = user.specialist.id
    } else if (user.client) {
      where.clientId = user.client.id
    } else {
      throw new AppError('User must be a client or specialist', 403)
    }

    // Фильтр по статусу (upcoming/ongoing/completed)
    if (status) {
      if (status === 'ongoing') {
        where.startedAt = { not: null }
        where.endedAt = null
      } else if (status === 'completed') {
        where.endedAt = { not: null }
      } else if (status === 'upcoming') {
        where.startedAt = null
      }
    }

    // Фильтр по дате (через booking)
    const bookingWhere: any = {}
    if (dateFrom || dateTo) {
      bookingWhere.date = {}
      if (dateFrom) bookingWhere.date.gte = new Date(dateFrom as string)
      if (dateTo) bookingWhere.date.lte = new Date(dateTo as string)
    }

    // Пагинация
    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    // Получение данных
    const [sessions, total] = await Promise.all([
      prisma.session.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              user: {
                select: {
                  avatar: true
                }
              }
            }
          },
          specialist: {
            select: {
              id: true,
              name: true,
              specialty: true,
              image: true
            }
          },
          booking: {
            select: {
              id: true,
              date: true,
              time: true,
              price: true,
              status: true
            },
            ...(Object.keys(bookingWhere).length > 0 && { where: bookingWhere })
          }
        }
      }),
      prisma.session.count({ where })
    ])

    // Для клиентов убираем specialistNotes
    const sanitizedSessions = sessions.map(session => {
      if (user.client) {
        const { specialistNotes, ...rest } = session
        return rest
      }
      return session
    })

    res.json({
      sessions: sanitizedSessions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/sessions/:id - Получить конкретную сессию
router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const sessionId = req.params.id as string
    const userId = req.user!.id

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            user: {
              select: {
                id: true,
                email: true,
                avatar: true
              }
            }
          }
        },
        specialist: {
          select: {
            id: true,
            name: true,
            specialty: true,
            image: true,
            user: {
              select: {
                id: true
              }
            }
          }
        },
        booking: {
          select: {
            id: true,
            date: true,
            time: true,
            price: true,
            status: true
          }
        }
      }
    })

    if (!session) {
      throw new AppError('Session not found', 404)
    }

    // Проверяем права доступа (только участники)
    const isClient = session.client.user.id === userId
    const isSpecialist = session.specialist.user.id === userId

    if (!isClient && !isSpecialist) {
      throw new AppError('Access denied', 403)
    }

    // Для клиентов убираем specialistNotes
    if (isClient) {
      const { specialistNotes, ...rest } = session
      return res.json({ session: rest })
    }

    res.json({ session })
  } catch (error) {
    next(error)
  }
})

// PUT /api/sessions/:id - Обновить сессию (только специалист)
router.put('/:id', async (req: AuthRequest, res, next) => {
  try {
    const sessionId = req.params.id as string
    const userId = req.user!.id
    const { specialistNotes, endedAt, duration, recordingUrl } = req.body

    // Проверяем что пользователь - специалист
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { specialist: true }
    })

    if (!user?.specialist) {
      throw new AppError('Only specialists can update sessions', 403)
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        booking: true
      }
    })

    if (!session) {
      throw new AppError('Session not found', 404)
    }

    // Проверяем права доступа (только специалист этой сессии)
    if (session.specialistId !== user.specialist.id) {
      throw new AppError('You can only update your own sessions', 403)
    }

    // Валидация duration
    if (duration !== undefined && duration < 0) {
      throw new AppError('Duration must be positive', 400)
    }

    // Обновляем сессию и при необходимости статус бронирования
    const updatedSession = await prisma.$transaction(async (tx) => {
      // Обновляем сессию
      const updated = await tx.session.update({
        where: { id: sessionId },
        data: {
          ...(specialistNotes !== undefined && { specialistNotes }),
          ...(endedAt !== undefined && { endedAt: endedAt ? new Date(endedAt) : null }),
          ...(duration !== undefined && { duration }),
          ...(recordingUrl !== undefined && { recordingUrl }),
          updatedAt: new Date()
        },
        include: {
          client: {
            select: {
              id: true,
              name: true
            }
          },
          specialist: {
            select: {
              id: true,
              name: true,
              specialty: true
            }
          },
          booking: {
            select: {
              id: true,
              date: true,
              time: true,
              status: true
            }
          }
        }
      })

      // Если установлен endedAt и booking еще не COMPLETED, обновляем статус
      if (endedAt && session.booking.status !== 'COMPLETED') {
        await tx.booking.update({
          where: { id: session.bookingId },
          data: {
            status: 'COMPLETED',
            updatedAt: new Date()
          }
        })

        // Также увеличиваем totalSessions специалиста
        await tx.specialist.update({
          where: { id: session.specialistId },
          data: {
            totalSessions: { increment: 1 }
          }
        })
      }

      return updated
    })

    res.json({
      message: 'Session updated successfully',
      session: updatedSession
    })
  } catch (error) {
    next(error)
  }
})

// DELETE /api/sessions/:id - Удалить сессию (только админ или автор)
router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const sessionId = req.params.id as string
    const userId = req.user!.id

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        specialist: {
          include: {
            user: true
          }
        }
      }
    })

    if (!session) {
      throw new AppError('Session not found', 404)
    }

    // Проверяем права доступа
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    const isSpecialist = session.specialist.user.id === userId
    const isAdmin = user?.role === 'ADMIN'

    if (!isSpecialist && !isAdmin) {
      throw new AppError('Access denied', 403)
    }

    // Удаляем сессию
    await prisma.session.delete({
      where: { id: sessionId }
    })

    res.json({
      message: 'Session deleted successfully'
    })
  } catch (error) {
    next(error)
  }
})

export default router
