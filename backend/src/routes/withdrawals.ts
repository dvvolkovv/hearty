import { Router } from 'express'
import { prisma } from '../config/database'
import { authenticate, AuthRequest } from '../middleware/auth'
import { AppError } from '../middleware/errorHandler'

const router = Router()

// POST /api/withdrawals - Создать заявку на вывод (требует авторизации, SPECIALIST only)
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id
    const { amount, paymentMethod, paymentDetails } = req.body

    // Валидация
    if (!amount || amount <= 0) {
      throw new AppError('Amount must be a positive number', 400)
    }

    if (!paymentMethod) {
      throw new AppError('Payment method is required', 400)
    }

    if (!['card', 'bank_account'].includes(paymentMethod)) {
      throw new AppError('Payment method must be "card" or "bank_account"', 400)
    }

    if (!paymentDetails || typeof paymentDetails !== 'object') {
      throw new AppError('Payment details are required', 400)
    }

    // Проверяем что пользователь - специалист
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { specialist: true }
    })

    if (!user?.specialist) {
      throw new AppError('Only specialists can request withdrawals', 403)
    }

    // Проверяем баланс
    if (user.specialist.balance < amount) {
      throw new AppError(
        `Insufficient balance. Available: ${user.specialist.balance}, requested: ${amount}`,
        400
      )
    }

    // Проверяем что нет активных заявок
    const activeWithdrawal = await prisma.withdrawalRequest.findFirst({
      where: {
        specialistId: user.specialist.id,
        status: {
          in: ['PENDING', 'PROCESSING']
        }
      }
    })

    if (activeWithdrawal) {
      throw new AppError(
        'You already have an active withdrawal request. Please wait for it to be processed.',
        400
      )
    }

    // Создаем заявку на вывод
    const withdrawal = await prisma.withdrawalRequest.create({
      data: {
        specialistId: user.specialist.id,
        amount,
        paymentMethod,
        paymentDetails,
        status: 'PENDING'
      },
      include: {
        specialist: {
          select: {
            id: true,
            name: true,
            balance: true,
            user: {
              select: {
                email: true
              }
            }
          }
        }
      }
    })

    res.status(201).json({
      message: 'Withdrawal request created successfully',
      withdrawal
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/withdrawals - Получить список заявок (требует авторизации)
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id
    const { page = '1', limit = '10', status } = req.query

    // Определяем роль пользователя
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        specialist: true
      }
    })

    if (!user) {
      throw new AppError('User not found', 404)
    }

    // Построение условий фильтрации
    const where: any = {}

    // Специалист видит только свои заявки
    if (user.specialist) {
      where.specialistId = user.specialist.id
    } else if (user.role !== 'ADMIN') {
      // Клиенты не имеют доступа к выводам
      throw new AppError('Only specialists and admins can view withdrawals', 403)
    }

    // Фильтр по статусу
    if (status) {
      where.status = status
    }

    // Пагинация
    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    // Получение данных
    const [withdrawals, total] = await Promise.all([
      prisma.withdrawalRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
        include: {
          specialist: {
            select: {
              id: true,
              name: true,
              balance: true,
              user: {
                select: {
                  email: true
                }
              }
            }
          }
        }
      }),
      prisma.withdrawalRequest.count({ where })
    ])

    res.json({
      withdrawals,
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

// GET /api/withdrawals/:id - Получить детали заявки (требует авторизации)
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const withdrawalId = req.params.id as string
    const userId = req.user!.id

    const withdrawal = await prisma.withdrawalRequest.findUnique({
      where: { id: withdrawalId },
      include: {
        specialist: {
          select: {
            id: true,
            name: true,
            specialty: true,
            balance: true,
            user: {
              select: {
                id: true,
                email: true
              }
            }
          }
        }
      }
    })

    if (!withdrawal) {
      throw new AppError('Withdrawal request not found', 404)
    }

    // Проверяем права доступа (только владелец или админ)
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    const isOwner = withdrawal.specialist.user.id === userId
    const isAdmin = user?.role === 'ADMIN'

    if (!isOwner && !isAdmin) {
      throw new AppError('Access denied', 403)
    }

    res.json({ withdrawal })
  } catch (error) {
    next(error)
  }
})

// PUT /api/withdrawals/:id/approve - Одобрить заявку (ADMIN only)
router.put('/:id/approve', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const withdrawalId = req.params.id as string
    const userId = req.user!.id

    // Проверяем что пользователь - админ
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (user?.role !== 'ADMIN') {
      throw new AppError('Only admins can approve withdrawals', 403)
    }

    // Находим заявку
    const withdrawal = await prisma.withdrawalRequest.findUnique({
      where: { id: withdrawalId },
      include: {
        specialist: true
      }
    })

    if (!withdrawal) {
      throw new AppError('Withdrawal request not found', 404)
    }

    // Проверяем что заявка в статусе PENDING или PROCESSING
    if (!['PENDING', 'PROCESSING'].includes(withdrawal.status)) {
      throw new AppError(
        `Cannot approve withdrawal with status ${withdrawal.status}`,
        400
      )
    }

    // Проверяем что у специалиста достаточно средств
    if (withdrawal.specialist.balance < withdrawal.amount) {
      throw new AppError(
        `Specialist has insufficient balance. Available: ${withdrawal.specialist.balance}, requested: ${withdrawal.amount}`,
        400
      )
    }

    // Обновляем заявку и баланс в транзакции
    const updatedWithdrawal = await prisma.$transaction(async (tx) => {
      // 1. Обновляем заявку
      const updated = await tx.withdrawalRequest.update({
        where: { id: withdrawalId },
        data: {
          status: 'COMPLETED',
          processedAt: new Date(),
          processedBy: userId
        },
        include: {
          specialist: {
            select: {
              id: true,
              name: true,
              balance: true,
              user: {
                select: {
                  email: true
                }
              }
            }
          }
        }
      })

      // 2. Списываем средства с баланса специалиста
      await tx.specialist.update({
        where: { id: withdrawal.specialistId },
        data: {
          balance: {
            decrement: withdrawal.amount
          }
        }
      })

      return updated
    })

    res.json({
      message: 'Withdrawal approved successfully',
      withdrawal: updatedWithdrawal
    })
  } catch (error) {
    next(error)
  }
})

// PUT /api/withdrawals/:id/reject - Отклонить заявку (ADMIN only)
router.put('/:id/reject', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const withdrawalId = req.params.id as string
    const userId = req.user!.id
    const { rejectionReason } = req.body

    // Проверяем что пользователь - админ
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (user?.role !== 'ADMIN') {
      throw new AppError('Only admins can reject withdrawals', 403)
    }

    if (!rejectionReason) {
      throw new AppError('Rejection reason is required', 400)
    }

    // Находим заявку
    const withdrawal = await prisma.withdrawalRequest.findUnique({
      where: { id: withdrawalId }
    })

    if (!withdrawal) {
      throw new AppError('Withdrawal request not found', 404)
    }

    // Проверяем что заявка в статусе PENDING или PROCESSING
    if (!['PENDING', 'PROCESSING'].includes(withdrawal.status)) {
      throw new AppError(
        `Cannot reject withdrawal with status ${withdrawal.status}`,
        400
      )
    }

    // Обновляем заявку
    const updatedWithdrawal = await prisma.withdrawalRequest.update({
      where: { id: withdrawalId },
      data: {
        status: 'REJECTED',
        processedAt: new Date(),
        processedBy: userId,
        rejectionReason
      },
      include: {
        specialist: {
          select: {
            id: true,
            name: true,
            balance: true,
            user: {
              select: {
                email: true
              }
            }
          }
        }
      }
    })

    res.json({
      message: 'Withdrawal rejected successfully',
      withdrawal: updatedWithdrawal
    })
  } catch (error) {
    next(error)
  }
})

export default router
