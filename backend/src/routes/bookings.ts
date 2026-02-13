import { Router, Response, NextFunction } from 'express'
import { prisma } from '../config/database'
import { authenticate, AuthRequest } from '../middleware/auth'
import { AppError } from '../middleware/errorHandler'
import { notifyBookingCreated, notifyBookingConfirmed, notifyBookingCancelled } from '../services/notifications'

const router = Router()

// Все routes требуют авторизации
router.use(authenticate)

// POST /api/bookings - Создать бронирование
router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id
    const { specialistId, date, time, clientMessage } = req.body

    // Валидация
    if (!specialistId || !date || !time) {
      throw new AppError('Specialist ID, date, and time are required', 400)
    }

    // Проверяем что пользователь - клиент
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { client: true }
    })

    if (!user?.client) {
      throw new AppError('Only clients can create bookings', 403)
    }

    // Проверяем что специалист существует и одобрен
    const specialist = await prisma.specialist.findUnique({
      where: { id: specialistId }
    })

    if (!specialist) {
      throw new AppError('Specialist not found', 404)
    }

    if (specialist.status !== 'APPROVED') {
      throw new AppError('Specialist is not available for booking', 400)
    }

    // Проверяем что слот доступен
    const timeSlot = await prisma.timeSlot.findFirst({
      where: {
        specialistId,
        date: new Date(date),
        time,
        isBooked: false
      }
    })

    if (!timeSlot) {
      throw new AppError('Time slot is not available', 400)
    }

    // Проверяем что дата в будущем
    const bookingDate = new Date(date)
    if (bookingDate < new Date()) {
      throw new AppError('Cannot book in the past', 400)
    }

    // Создаем бронирование и обновляем слот в транзакции
    const booking = await prisma.$transaction(async (tx) => {
      // Создаем бронирование
      const newBooking = await tx.booking.create({
        data: {
          clientId: user.client.id,
          specialistId,
          date: new Date(date),
          time,
          price: specialist.price,
          status: 'PENDING',
          isPaid: false,
          clientMessage: clientMessage || null
        },
        include: {
          specialist: {
            select: {
              id: true,
              name: true,
              specialty: true,
              price: true,
              image: true
            }
          },
          client: {
            select: {
              id: true,
              name: true,
              user: {
                select: {
                  email: true,
                  phone: true
                }
              }
            }
          }
        }
      })

      // Обновляем слот как занятый
      await tx.timeSlot.update({
        where: { id: timeSlot.id },
        data: {
          isBooked: true,
          bookingId: newBooking.id
        }
      })

      return newBooking
    })

    // Send notifications to both client and specialist
    await notifyBookingCreated({
      clientId: userId,
      specialistId: specialist.userId,
      bookingId: booking.id,
      specialistName: specialist.name,
      date: new Date(date).toLocaleDateString('ru-RU'),
      time
    })

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/bookings - Получить список бронирований текущего пользователя
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id
    const { status, sortBy = 'date', order = 'asc', page = '1', limit = '20' } = req.query

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

    // Построение условий фильтрации
    const where: any = {}

    if (user.client) {
      where.clientId = user.client.id
    } else if (user.specialist) {
      where.specialistId = user.specialist.id
    } else {
      throw new AppError('User must be a client or specialist', 403)
    }

    if (status) {
      where.status = status as string
    }

    // Сортировка
    const orderBy: any = {}
    if (sortBy === 'date') {
      orderBy.date = order
    } else if (sortBy === 'createdAt') {
      orderBy.createdAt = order
    } else {
      orderBy.date = 'asc'
    }

    // Пагинация
    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    // Получение данных
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          specialist: {
            select: {
              id: true,
              name: true,
              specialty: true,
              image: true,
              phone: true,
              email: true
            }
          },
          client: {
            select: {
              id: true,
              name: true,
              user: {
                select: {
                  email: true,
                  phone: true
                }
              }
            }
          }
        }
      }),
      prisma.booking.count({ where })
    ])

    res.json({
      bookings,
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

// GET /api/bookings/:id - Получить детали бронирования
router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const id = req.params.id as string
    const userId = req.user!.id

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        specialist: {
          include: {
            user: {
              select: {
                email: true,
                phone: true
              }
            }
          }
        },
        client: {
          include: {
            user: {
              select: {
                email: true,
                phone: true,
                avatar: true
              }
            }
          }
        },
        session: true,
        transaction: true
      }
    })

    if (!booking) {
      throw new AppError('Booking not found', 404)
    }

    // Проверяем права доступа
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        client: true,
        specialist: true
      }
    })

    const isClientOwner = user?.client?.id === booking.clientId
    const isSpecialistOwner = user?.specialist?.id === booking.specialistId
    const isAdmin = user?.role === 'ADMIN'

    if (!isClientOwner && !isSpecialistOwner && !isAdmin) {
      throw new AppError('Access denied', 403)
    }

    res.json({ booking })
  } catch (error) {
    next(error)
  }
})

// PUT /api/bookings/:id/status - Обновить статус бронирования
router.put('/:id/status', async (req: AuthRequest, res, next) => {
  try {
    const id = req.params.id as string
    const userId = req.user!.id
    const { status } = req.body

    if (!status) {
      throw new AppError('Status is required', 400)
    }

    // Валидация статуса
    const validStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']
    if (!validStatuses.includes(status)) {
      throw new AppError('Invalid status', 400)
    }

    const booking = await prisma.booking.findUnique({
      where: { id }
    })

    if (!booking) {
      throw new AppError('Booking not found', 404)
    }

    // Проверяем права доступа
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        client: true,
        specialist: true
      }
    })

    const isClientOwner = user?.client?.id === booking.clientId
    const isSpecialistOwner = user?.specialist?.id === booking.specialistId
    const isAdmin = user?.role === 'ADMIN'

    if (!isClientOwner && !isSpecialistOwner && !isAdmin) {
      throw new AppError('Access denied', 403)
    }

    // Валидация переходов статусов
    if (status === 'CONFIRMED' && booking.status !== 'PENDING') {
      throw new AppError('Can only confirm pending bookings', 400)
    }

    if (status === 'COMPLETED' && booking.status !== 'CONFIRMED') {
      throw new AppError('Can only complete confirmed bookings', 400)
    }

    // Обновляем статус
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status,
        ...(status === 'CONFIRMED' && { isPaid: true }),
        updatedAt: new Date()
      },
      include: {
        specialist: {
          select: {
            id: true,
            name: true,
            specialty: true,
            userId: true
          }
        },
        client: {
          select: {
            id: true,
            name: true,
            userId: true
          }
        }
      }
    })

    // Send notification when booking is confirmed
    if (status === 'CONFIRMED') {
      await notifyBookingConfirmed({
        clientId: updatedBooking.client.userId,
        bookingId: updatedBooking.id,
        specialistName: updatedBooking.specialist.name,
        date: updatedBooking.date.toLocaleDateString('ru-RU'),
        time: updatedBooking.time
      })
    }

    res.json({
      message: 'Booking status updated successfully',
      booking: updatedBooking
    })
  } catch (error) {
    next(error)
  }
})

// DELETE /api/bookings/:id - Отменить бронирование
router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const id = req.params.id as string
    const userId = req.user!.id
    const { cancellationReason } = req.body

    const booking = await prisma.booking.findUnique({
      where: { id }
    })

    if (!booking) {
      throw new AppError('Booking not found', 404)
    }

    // Проверяем что бронирование не отменено и не завершено
    if (booking.status === 'CANCELLED') {
      throw new AppError('Booking is already cancelled', 400)
    }

    if (booking.status === 'COMPLETED') {
      throw new AppError('Cannot cancel completed booking', 400)
    }

    // Проверяем права доступа
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        client: true,
        specialist: true
      }
    })

    const isClientOwner = user?.client?.id === booking.clientId
    const isSpecialistOwner = user?.specialist?.id === booking.specialistId
    const isAdmin = user?.role === 'ADMIN'

    if (!isClientOwner && !isSpecialistOwner && !isAdmin) {
      throw new AppError('Access denied', 403)
    }

    // Отменяем бронирование и освобождаем слот в транзакции
    const cancelledBooking = await prisma.$transaction(async (tx) => {
      // Обновляем статус бронирования
      const updated = await tx.booking.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancelledBy: userId,
          cancellationReason: cancellationReason || null
        },
        include: {
          client: {
            select: {
              userId: true
            }
          },
          specialist: {
            select: {
              userId: true
            }
          }
        }
      })

      // Освобождаем слот
      await tx.timeSlot.updateMany({
        where: {
          bookingId: id
        },
        data: {
          isBooked: false,
          bookingId: null
        }
      })

      return updated
    })

    // Notify the other party about cancellation
    const cancelledBy = isClientOwner ? 'client' : 'specialist'
    const recipientId = isClientOwner
      ? cancelledBooking.specialist.userId
      : cancelledBooking.client.userId

    await notifyBookingCancelled({
      userId: recipientId,
      bookingId: cancelledBooking.id,
      reason: cancellationReason,
      cancelledBy
    })

    res.json({
      message: 'Booking cancelled successfully',
      booking: cancelledBooking
    })
  } catch (error) {
    next(error)
  }
})

export default router
