import { Router } from 'express'
import { prisma } from '../config/database'
import { authenticate, AuthRequest } from '../middleware/auth'
import { AppError } from '../middleware/errorHandler'

const router = Router()

// POST /api/payments - Создать платеж (требует авторизации)
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id
    const { bookingId } = req.body

    // Валидация
    if (!bookingId) {
      throw new AppError('Booking ID is required', 400)
    }

    // Проверяем что пользователь - клиент
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { client: true }
    })

    if (!user?.client) {
      throw new AppError('Only clients can create payments', 403)
    }

    // Проверяем бронирование
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        specialist: {
          select: {
            id: true,
            name: true,
            price: true
          }
        }
      }
    })

    if (!booking) {
      throw new AppError('Booking not found', 404)
    }

    // Проверяем что это бронирование клиента
    if (booking.clientId !== user.client.id) {
      throw new AppError('You can only pay for your own bookings', 403)
    }

    // Проверяем что еще не оплачено
    if (booking.isPaid) {
      throw new AppError('Booking is already paid', 400)
    }

    // Проверяем что статус PENDING
    if (booking.status !== 'PENDING') {
      throw new AppError('Can only pay for pending bookings', 400)
    }

    // Проверяем что транзакция еще не создана
    const existingTransaction = await prisma.transaction.findUnique({
      where: { bookingId }
    })

    if (existingTransaction) {
      throw new AppError('Payment already exists for this booking', 400)
    }

    // Вычисляем комиссию платформы (например, 15%)
    const PLATFORM_FEE_PERCENT = 0.15
    const amount = booking.price
    const platformFee = Math.round(amount * PLATFORM_FEE_PERCENT)

    // Создаем транзакцию
    const transaction = await prisma.transaction.create({
      data: {
        type: 'BOOKING_PAYMENT',
        status: 'PENDING',
        amount,
        platformFee,
        clientId: user.client.id,
        specialistId: booking.specialistId,
        bookingId,
        paymentProvider: 'yookassa', // или из конфига
        metadata: {
          bookingDate: booking.date,
          bookingTime: booking.time
        }
      },
      include: {
        booking: {
          select: {
            id: true,
            date: true,
            time: true,
            status: true
          }
        },
        specialist: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // В реальном приложении здесь был бы вызов API платежной системы
    // Например, для ЮКassa:
    // const yookassaPayment = await createYookassaPayment({
    //   amount: { value: amount / 100, currency: 'RUB' },
    //   confirmation: { type: 'redirect', return_url: '...' },
    //   metadata: { transactionId: transaction.id }
    // })

    // Для тестирования возвращаем mock URL
    const paymentUrl = `https://yookassa.ru/checkout/${transaction.id}`

    res.status(201).json({
      message: 'Payment created successfully',
      transaction,
      paymentUrl, // URL для редиректа на страницу оплаты
      // В реальности: confirmationUrl: yookassaPayment.confirmation.confirmation_url
    })
  } catch (error) {
    next(error)
  }
})

// POST /api/payments/webhook - Webhook от платежной системы (БЕЗ авторизации!)
router.post('/webhook', async (req, res, next) => {
  try {
    // В реальном приложении нужна проверка подписи от платежной системы
    // Например, для ЮКassa проверяется заголовок X-Signature

    const { event, object } = req.body

    // Для ЮКassa структура: { event: 'payment.succeeded', object: { id, status, metadata, ... } }
    if (event !== 'payment.succeeded') {
      return res.json({ message: 'Event ignored' })
    }

    const transactionId = object.metadata?.transactionId
    if (!transactionId) {
      throw new AppError('Transaction ID not found in metadata', 400)
    }

    // Находим транзакцию
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        booking: true
      }
    })

    if (!transaction) {
      throw new AppError('Transaction not found', 404)
    }

    // Проверяем что еще не обработано
    if (transaction.status === 'COMPLETED') {
      return res.json({ message: 'Payment already processed' })
    }

    // Обновляем транзакцию и бронирование в одной транзакции
    await prisma.$transaction(async (tx) => {
      // Обновляем транзакцию
      await tx.transaction.update({
        where: { id: transactionId },
        data: {
          status: 'COMPLETED',
          paymentId: object.id, // ID платежа в ЮКassa
          updatedAt: new Date()
        }
      })

      // Обновляем бронирование
      await tx.booking.update({
        where: { id: transaction.bookingId! },
        data: {
          status: 'CONFIRMED',
          isPaid: true,
          paymentId: object.id,
          updatedAt: new Date()
        }
      })

      // Начисляем деньги на баланс специалиста (сумма минус комиссия)
      const specialistAmount = transaction.amount - transaction.platformFee
      await tx.specialist.update({
        where: { id: transaction.specialistId! },
        data: {
          balance: { increment: specialistAmount }
        }
      })
    })

    res.json({ message: 'Payment processed successfully' })
  } catch (error) {
    next(error)
  }
})

// GET /api/payments - Получить историю платежей (требует авторизации)
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id
    const { page = '1', limit = '10', status, type } = req.query

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

    if (user.client) {
      where.clientId = user.client.id
    } else if (user.specialist) {
      where.specialistId = user.specialist.id
    } else {
      throw new AppError('User must be a client or specialist', 403)
    }

    // Фильтр по статусу
    if (status) {
      where.status = status
    }

    // Фильтр по типу
    if (type) {
      where.type = type
    }

    // Пагинация
    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    // Получение данных
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
        include: {
          booking: {
            select: {
              id: true,
              date: true,
              time: true,
              status: true
            }
          },
          client: {
            select: {
              id: true,
              name: true
            }
          },
          specialist: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }),
      prisma.transaction.count({ where })
    ])

    res.json({
      transactions,
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

// GET /api/payments/:id - Получить детали платежа (требует авторизации)
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const transactionId = req.params.id as string
    const userId = req.user!.id

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        booking: {
          select: {
            id: true,
            date: true,
            time: true,
            status: true,
            price: true
          }
        },
        client: {
          select: {
            id: true,
            name: true,
            user: {
              select: {
                id: true,
                email: true
              }
            }
          }
        },
        specialist: {
          select: {
            id: true,
            name: true,
            specialty: true,
            user: {
              select: {
                id: true
              }
            }
          }
        }
      }
    })

    if (!transaction) {
      throw new AppError('Transaction not found', 404)
    }

    // Проверяем права доступа (только участники или админ)
    const isClient = transaction.client?.user.id === userId
    const isSpecialist = transaction.specialist?.user.id === userId

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })
    const isAdmin = user?.role === 'ADMIN'

    if (!isClient && !isSpecialist && !isAdmin) {
      throw new AppError('Access denied', 403)
    }

    res.json({ transaction })
  } catch (error) {
    next(error)
  }
})

export default router
