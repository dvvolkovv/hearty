import { Router } from 'express'
import { prisma } from '../config/database'
import { authenticate, AuthRequest } from '../middleware/auth'
import { AppError } from '../middleware/errorHandler'

const router = Router()

// Middleware для проверки что пользователь - админ
const requireAdmin = async (req: AuthRequest, res: any, next: any) => {
  const userId = req.user!.id

  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  if (user?.role !== 'ADMIN') {
    return next(new AppError('Admin access required', 403))
  }

  next()
}

// Применяем authenticate и requireAdmin ко всем роутам
router.use(authenticate)
router.use(requireAdmin)

// ========================================
// SPECIALISTS MODERATION
// ========================================

// GET /api/admin/specialists - Список специалистов для модерации
router.get('/specialists', async (req: AuthRequest, res, next) => {
  try {
    const { page = '1', limit = '20', status } = req.query

    // Построение условий фильтрации
    const where: any = {}

    if (status) {
      where.status = status
    }

    // Пагинация
    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    // Получение данных
    const [specialists, total] = await Promise.all([
      prisma.specialist.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              createdAt: true
            }
          },
          _count: {
            select: {
              bookings: true,
              reviews: true,
              sessions: true
            }
          }
        }
      }),
      prisma.specialist.count({ where })
    ])

    res.json({
      specialists,
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

// PUT /api/admin/specialists/:id/approve - Одобрить специалиста
router.put('/specialists/:id/approve', async (req: AuthRequest, res, next) => {
  try {
    const specialistId = req.params.id as string

    const specialist = await prisma.specialist.findUnique({
      where: { id: specialistId }
    })

    if (!specialist) {
      throw new AppError('Specialist not found', 404)
    }

    if (specialist.status === 'APPROVED') {
      throw new AppError('Specialist is already approved', 400)
    }

    const updated = await prisma.specialist.update({
      where: { id: specialistId },
      data: {
        status: 'APPROVED',
        moderationNote: null
      },
      include: {
        user: {
          select: {
            email: true
          }
        }
      }
    })

    res.json({
      message: 'Specialist approved successfully',
      specialist: updated
    })
  } catch (error) {
    next(error)
  }
})

// PUT /api/admin/specialists/:id/reject - Отклонить специалиста
router.put('/specialists/:id/reject', async (req: AuthRequest, res, next) => {
  try {
    const specialistId = req.params.id as string
    const { moderationNote } = req.body

    if (!moderationNote) {
      throw new AppError('Moderation note is required', 400)
    }

    const specialist = await prisma.specialist.findUnique({
      where: { id: specialistId }
    })

    if (!specialist) {
      throw new AppError('Specialist not found', 404)
    }

    const updated = await prisma.specialist.update({
      where: { id: specialistId },
      data: {
        status: 'REJECTED',
        moderationNote
      },
      include: {
        user: {
          select: {
            email: true
          }
        }
      }
    })

    res.json({
      message: 'Specialist rejected successfully',
      specialist: updated
    })
  } catch (error) {
    next(error)
  }
})

// PUT /api/admin/specialists/:id/suspend - Приостановить специалиста
router.put('/specialists/:id/suspend', async (req: AuthRequest, res, next) => {
  try {
    const specialistId = req.params.id as string
    const { moderationNote } = req.body

    if (!moderationNote) {
      throw new AppError('Moderation note is required', 400)
    }

    const specialist = await prisma.specialist.findUnique({
      where: { id: specialistId }
    })

    if (!specialist) {
      throw new AppError('Specialist not found', 404)
    }

    const updated = await prisma.specialist.update({
      where: { id: specialistId },
      data: {
        status: 'SUSPENDED',
        moderationNote
      },
      include: {
        user: {
          select: {
            email: true
          }
        }
      }
    })

    res.json({
      message: 'Specialist suspended successfully',
      specialist: updated
    })
  } catch (error) {
    next(error)
  }
})

// ========================================
// REVIEWS MODERATION
// ========================================

// GET /api/admin/reviews - Список отзывов для модерации
router.get('/reviews', async (req: AuthRequest, res, next) => {
  try {
    const { page = '1', limit = '20', status } = req.query

    // Построение условий фильтрации
    const where: any = {}

    if (status) {
      where.status = status
    }

    // Пагинация
    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    // Получение данных
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
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
                  email: true
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
      }),
      prisma.review.count({ where })
    ])

    res.json({
      reviews,
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

// PUT /api/admin/reviews/:id/approve - Одобрить отзыв
router.put('/reviews/:id/approve', async (req: AuthRequest, res, next) => {
  try {
    const reviewId = req.params.id as string

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        specialist: true
      }
    })

    if (!review) {
      throw new AppError('Review not found', 404)
    }

    if (review.status === 'APPROVED') {
      throw new AppError('Review is already approved', 400)
    }

    // Обновляем отзыв и рейтинг специалиста в транзакции
    await prisma.$transaction(async (tx) => {
      // Одобряем отзыв
      await tx.review.update({
        where: { id: reviewId },
        data: {
          status: 'APPROVED',
          moderationNote: null
        }
      })

      // Пересчитываем рейтинг специалиста (только APPROVED отзывы)
      const approvedReviews = await tx.review.findMany({
        where: {
          specialistId: review.specialistId,
          status: 'APPROVED'
        },
        select: {
          rating: true
        }
      })

      const totalReviews = approvedReviews.length
      const avgRating = totalReviews > 0
        ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0

      // Обновляем статистику специалиста
      await tx.specialist.update({
        where: { id: review.specialistId },
        data: {
          rating: Math.round(avgRating * 10) / 10, // Округление до 1 знака
          totalReviews
        }
      })
    })

    const updatedReview = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        specialist: {
          select: {
            id: true,
            name: true,
            rating: true,
            totalReviews: true
          }
        }
      }
    })

    res.json({
      message: 'Review approved successfully',
      review: updatedReview
    })
  } catch (error) {
    next(error)
  }
})

// PUT /api/admin/reviews/:id/reject - Отклонить отзыв
router.put('/reviews/:id/reject', async (req: AuthRequest, res, next) => {
  try {
    const reviewId = req.params.id as string
    const { moderationNote } = req.body

    if (!moderationNote) {
      throw new AppError('Moderation note is required', 400)
    }

    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    })

    if (!review) {
      throw new AppError('Review not found', 404)
    }

    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: {
        status: 'REJECTED',
        moderationNote
      },
      include: {
        client: {
          select: {
            name: true
          }
        },
        specialist: {
          select: {
            name: true
          }
        }
      }
    })

    res.json({
      message: 'Review rejected successfully',
      review: updated
    })
  } catch (error) {
    next(error)
  }
})

// ========================================
// PLATFORM STATISTICS
// ========================================

// GET /api/admin/stats - Статистика платформы
router.get('/stats', async (req: AuthRequest, res, next) => {
  try {
    // Параллельное получение всех статистик
    const [
      totalUsers,
      totalClients,
      totalSpecialists,
      specialistsByStatus,
      totalBookings,
      bookingsByStatus,
      totalSessions,
      totalReviews,
      reviewsByStatus,
      totalTransactions,
      transactionStats,
      totalWithdrawals,
      withdrawalStats
    ] = await Promise.all([
      // Пользователи
      prisma.user.count(),
      prisma.client.count(),
      prisma.specialist.count(),
      prisma.specialist.groupBy({
        by: ['status'],
        _count: true
      }),

      // Бронирования
      prisma.booking.count(),
      prisma.booking.groupBy({
        by: ['status'],
        _count: true
      }),

      // Сессии
      prisma.session.count(),

      // Отзывы
      prisma.review.count(),
      prisma.review.groupBy({
        by: ['status'],
        _count: true
      }),

      // Транзакции (платежи)
      prisma.transaction.count(),
      prisma.transaction.aggregate({
        _sum: {
          amount: true,
          platformFee: true
        }
      }),

      // Выплаты
      prisma.withdrawalRequest.count(),
      prisma.withdrawalRequest.groupBy({
        by: ['status'],
        _sum: {
          amount: true
        },
        _count: true
      })
    ])

    // Форматирование статистики
    const stats = {
      users: {
        total: totalUsers,
        clients: totalClients,
        specialists: totalSpecialists
      },
      specialists: {
        total: totalSpecialists,
        byStatus: specialistsByStatus.reduce((acc: any, item) => {
          acc[item.status] = item._count
          return acc
        }, {})
      },
      bookings: {
        total: totalBookings,
        byStatus: bookingsByStatus.reduce((acc: any, item) => {
          acc[item.status] = item._count
          return acc
        }, {})
      },
      sessions: {
        total: totalSessions
      },
      reviews: {
        total: totalReviews,
        byStatus: reviewsByStatus.reduce((acc: any, item) => {
          acc[item.status] = item._count
          return acc
        }, {})
      },
      financials: {
        totalRevenue: transactionStats._sum.amount || 0,
        totalPlatformFee: transactionStats._sum.platformFee || 0,
        totalTransactions: totalTransactions,
        withdrawals: {
          total: totalWithdrawals,
          byStatus: withdrawalStats.reduce((acc: any, item) => {
            acc[item.status] = {
              count: item._count,
              amount: item._sum.amount || 0
            }
            return acc
          }, {})
        }
      }
    }

    res.json({ stats })
  } catch (error) {
    next(error)
  }
})

// ========================================
// TRANSACTIONS OVERVIEW
// ========================================

// GET /api/admin/transactions - Все транзакции (платежи)
router.get('/transactions', async (req: AuthRequest, res, next) => {
  try {
    const { page = '1', limit = '20', status, type } = req.query

    // Построение условий фильтрации
    const where: any = {}

    if (status) {
      where.status = status
    }

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
          client: {
            select: {
              id: true,
              name: true,
              user: {
                select: {
                  email: true
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
              id: true,
              date: true,
              time: true,
              status: true
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

// ========================================
// USER MANAGEMENT
// ========================================

// GET /api/admin/users - Список всех пользователей с фильтрами
router.get('/users', async (req: AuthRequest, res, next) => {
  try {
    const { page = '1', limit = '20', role, status, search } = req.query

    // Построение условий фильтрации
    const where: any = {}

    if (role) {
      where.role = role
    }

    if (status) {
      where.status = status
    }

    if (search) {
      where.OR = [
        { email: { contains: search as string, mode: 'insensitive' } },
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } }
      ]
    }

    // Пагинация
    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    // Получение данных
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatar: true,
          emailVerified: true,
          bannedAt: true,
          banReason: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
          specialist: {
            select: {
              id: true,
              name: true,
              specialty: true,
              status: true
            }
          },
          client: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ])

    res.json({
      users,
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

// GET /api/admin/users/:id - Детали конкретного пользователя
router.get('/users/:id', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.params.id as string

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        specialist: {
          include: {
            _count: {
              select: {
                bookings: true,
                reviews: true,
                sessions: true,
                chatRooms: true
              }
            }
          }
        },
        client: {
          include: {
            _count: {
              select: {
                bookings: true,
                reviews: true,
                sessions: true,
                chatRooms: true
              }
            }
          }
        }
      }
    })

    if (!user) {
      throw new AppError('User not found', 404)
    }

    res.json({ user })
  } catch (error) {
    next(error)
  }
})

// PUT /api/admin/users/:id/ban - Заблокировать пользователя
router.put('/users/:id/ban', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.params.id as string
    const { banReason } = req.body

    if (!banReason) {
      throw new AppError('Ban reason is required', 400)
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new AppError('User not found', 404)
    }

    if (user.status === 'SUSPENDED') {
      throw new AppError('User is already banned', 400)
    }

    if (user.role === 'ADMIN') {
      throw new AppError('Cannot ban admin users', 403)
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        status: 'SUSPENDED',
        bannedAt: new Date(),
        banReason
      }
    })

    res.json({
      message: 'User banned successfully',
      user: updated
    })
  } catch (error) {
    next(error)
  }
})

// PUT /api/admin/users/:id/unban - Разблокировать пользователя
router.put('/users/:id/unban', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.params.id as string

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new AppError('User not found', 404)
    }

    if (user.status !== 'SUSPENDED') {
      throw new AppError('User is not banned', 400)
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        status: 'ACTIVE',
        bannedAt: null,
        banReason: null
      }
    })

    res.json({
      message: 'User unbanned successfully',
      user: updated
    })
  } catch (error) {
    next(error)
  }
})

// ========================================
// BOOKING MANAGEMENT
// ========================================

// GET /api/admin/bookings - Все бронирования платформы с фильтрами
router.get('/bookings', async (req: AuthRequest, res, next) => {
  try {
    const { page = '1', limit = '20', status, dateFrom, dateTo, specialistId, clientId } = req.query

    // Построение условий фильтрации
    const where: any = {}

    if (status) {
      where.status = status
    }

    if (specialistId) {
      where.specialistId = specialistId
    }

    if (clientId) {
      where.clientId = clientId
    }

    if (dateFrom || dateTo) {
      where.date = {}
      if (dateFrom) {
        where.date.gte = new Date(dateFrom as string)
      }
      if (dateTo) {
        where.date.lte = new Date(dateTo as string)
      }
    }

    // Пагинация
    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    // Получение данных
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
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
                  email: true,
                  firstName: true,
                  lastName: true
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
                  email: true
                }
              }
            }
          },
          transaction: {
            select: {
              id: true,
              amount: true,
              platformFee: true,
              status: true
            }
          },
          session: {
            select: {
              id: true,
              startedAt: true,
              endedAt: true,
              duration: true
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

// PUT /api/admin/bookings/:id/cancel - Отменить бронирование с возвратом средств
router.put('/bookings/:id/cancel', async (req: AuthRequest, res, next) => {
  try {
    const bookingId = req.params.id as string
    const { reason } = req.body
    const adminId = req.user!.id

    if (!reason) {
      throw new AppError('Cancellation reason is required', 400)
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        transaction: true,
        client: true,
        specialist: true
      }
    })

    if (!booking) {
      throw new AppError('Booking not found', 404)
    }

    if (booking.status === 'CANCELLED') {
      throw new AppError('Booking is already cancelled', 400)
    }

    if (booking.status === 'COMPLETED') {
      throw new AppError('Cannot cancel completed booking', 400)
    }

    // Отменяем бронирование и создаем возврат средств в транзакции
    await prisma.$transaction(async (tx) => {
      // Обновляем статус бронирования
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancelledBy: adminId,
          cancellationReason: reason
        }
      })

      // Если было оплачено, создаем транзакцию возврата
      if (booking.isPaid && booking.transaction) {
        await tx.transaction.create({
          data: {
            type: 'REFUND',
            status: 'COMPLETED',
            amount: booking.price,
            platformFee: 0,
            clientId: booking.clientId,
            specialistId: booking.specialistId,
            metadata: {
              originalTransactionId: booking.transaction.id,
              refundReason: reason,
              refundedBy: adminId
            }
          }
        })

        // Возвращаем средства специалисту (уменьшаем баланс)
        if (booking.specialist) {
          const specialistEarnings = booking.price - (booking.transaction.platformFee || 0)
          await tx.specialist.update({
            where: { id: booking.specialistId },
            data: {
              balance: {
                decrement: specialistEarnings
              }
            }
          })
        }
      }

      // Освобождаем тайм-слот
      await tx.timeSlot.updateMany({
        where: {
          specialistId: booking.specialistId,
          date: booking.date,
          time: booking.time
        },
        data: {
          isBooked: false,
          bookingId: null
        }
      })
    })

    const updatedBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        client: {
          select: {
            name: true,
            user: { select: { email: true } }
          }
        },
        specialist: {
          select: {
            name: true,
            user: { select: { email: true } }
          }
        }
      }
    })

    res.json({
      message: 'Booking cancelled and refund processed successfully',
      booking: updatedBooking
    })
  } catch (error) {
    next(error)
  }
})

// ========================================
// FINANCIAL REPORTS
// ========================================

// GET /api/admin/financials/summary - Детальный финансовый отчет по периодам
router.get('/financials/summary', async (req: AuthRequest, res, next) => {
  try {
    const { dateFrom, dateTo, groupBy = 'day' } = req.query

    if (!dateFrom || !dateTo) {
      throw new AppError('dateFrom and dateTo parameters are required', 400)
    }

    const startDate = new Date(dateFrom as string)
    const endDate = new Date(dateTo as string)

    // Общая статистика за период
    const [
      totalTransactions,
      transactionStats,
      bookingStats,
      refunds,
      withdrawalStats,
      specialistPayouts
    ] = await Promise.all([
      // Количество транзакций
      prisma.transaction.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      }),

      // Агрегация транзакций по типам
      prisma.transaction.groupBy({
        by: ['type', 'status'],
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        _sum: {
          amount: true,
          platformFee: true
        },
        _count: true
      }),

      // Статистика бронирований
      prisma.booking.groupBy({
        by: ['status'],
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        _sum: {
          price: true
        },
        _count: true
      }),

      // Возвраты
      prisma.transaction.aggregate({
        where: {
          type: 'REFUND',
          status: 'COMPLETED',
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        _sum: {
          amount: true
        },
        _count: true
      }),

      // Статистика выводов средств
      prisma.withdrawalRequest.groupBy({
        by: ['status'],
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        _sum: {
          amount: true
        },
        _count: true
      }),

      // Выплаты специалистам
      prisma.transaction.aggregate({
        where: {
          type: 'SPECIALIST_PAYOUT',
          status: 'COMPLETED',
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        _sum: {
          amount: true
        },
        _count: true
      })
    ])

    // Расчет метрик
    const totalRevenue = transactionStats
      .filter(t => t.type === 'BOOKING_PAYMENT' && t.status === 'COMPLETED')
      .reduce((sum, t) => sum + (t._sum.amount || 0), 0)

    const totalPlatformFee = transactionStats
      .reduce((sum, t) => sum + (t._sum.platformFee || 0), 0)

    const totalRefunds = refunds._sum.amount || 0

    const netRevenue = totalRevenue - totalRefunds

    const totalWithdrawals = withdrawalStats
      .filter(w => w.status === 'COMPLETED')
      .reduce((sum, w) => sum + (w._sum.amount || 0), 0)

    const summary = {
      period: {
        from: dateFrom,
        to: dateTo
      },
      overview: {
        totalRevenue,
        totalPlatformFee,
        totalRefunds,
        netRevenue,
        totalWithdrawals,
        totalSpecialistPayouts: specialistPayouts._sum.amount || 0
      },
      transactions: {
        total: totalTransactions,
        byType: transactionStats.reduce((acc: any, item) => {
          const key = `${item.type}_${item.status}`
          acc[key] = {
            count: item._count,
            amount: item._sum.amount || 0,
            platformFee: item._sum.platformFee || 0
          }
          return acc
        }, {})
      },
      bookings: {
        byStatus: bookingStats.reduce((acc: any, item) => {
          acc[item.status] = {
            count: item._count,
            totalPrice: item._sum.price || 0
          }
          return acc
        }, {})
      },
      refunds: {
        count: refunds._count,
        totalAmount: totalRefunds
      },
      withdrawals: {
        byStatus: withdrawalStats.reduce((acc: any, item) => {
          acc[item.status] = {
            count: item._count,
            amount: item._sum.amount || 0
          }
          return acc
        }, {})
      }
    }

    res.json({ summary })
  } catch (error) {
    next(error)
  }
})

// GET /api/admin/financials/specialists/:id - Детальный финансовый отчет конкретного специалиста
router.get('/financials/specialists/:id', async (req: AuthRequest, res, next) => {
  try {
    const specialistId = req.params.id as string
    const { dateFrom, dateTo } = req.query

    // Проверяем существование специалиста
    const specialist = await prisma.specialist.findUnique({
      where: { id: specialistId },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    if (!specialist) {
      throw new AppError('Specialist not found', 404)
    }

    // Построение условий фильтрации по дате
    const dateFilter: any = {}
    if (dateFrom || dateTo) {
      if (dateFrom) {
        dateFilter.gte = new Date(dateFrom as string)
      }
      if (dateTo) {
        dateFilter.lte = new Date(dateTo as string)
      }
    }

    const where: any = { specialistId }
    if (Object.keys(dateFilter).length > 0) {
      where.createdAt = dateFilter
    }

    // Получение финансовых данных
    const [
      totalEarnings,
      bookingsStats,
      transactionsList,
      withdrawalsList,
      sessionsCount
    ] = await Promise.all([
      // Общий заработок из транзакций
      prisma.transaction.aggregate({
        where: {
          ...where,
          type: 'BOOKING_PAYMENT',
          status: 'COMPLETED'
        },
        _sum: {
          amount: true,
          platformFee: true
        },
        _count: true
      }),

      // Статистика бронирований
      prisma.booking.groupBy({
        by: ['status'],
        where,
        _sum: {
          price: true
        },
        _count: true
      }),

      // Список транзакций
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 100,
        select: {
          id: true,
          type: true,
          status: true,
          amount: true,
          platformFee: true,
          createdAt: true,
          booking: {
            select: {
              id: true,
              date: true,
              time: true
            }
          }
        }
      }),

      // Список выводов средств
      prisma.withdrawalRequest.findMany({
        where: {
          specialistId,
          ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {})
        },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          amount: true,
          status: true,
          paymentMethod: true,
          createdAt: true,
          processedAt: true
        }
      }),

      // Количество проведенных сессий
      prisma.session.count({ where })
    ])

    const totalRevenue = totalEarnings._sum.amount || 0
    const totalPlatformFee = totalEarnings._sum.platformFee || 0
    const netEarnings = totalRevenue - totalPlatformFee

    const totalWithdrawn = withdrawalsList
      .filter(w => w.status === 'COMPLETED')
      .reduce((sum, w) => sum + w.amount, 0)

    const report = {
      specialist: {
        id: specialist.id,
        name: specialist.name,
        specialty: specialist.specialty,
        email: specialist.user.email,
        currentBalance: specialist.balance
      },
      period: {
        from: dateFrom || 'all time',
        to: dateTo || 'now'
      },
      summary: {
        totalRevenue,
        totalPlatformFee,
        netEarnings,
        totalWithdrawn,
        availableBalance: specialist.balance,
        totalSessions: sessionsCount,
        totalCompletedBookings: totalEarnings._count
      },
      bookings: {
        byStatus: bookingsStats.reduce((acc: any, item) => {
          acc[item.status] = {
            count: item._count,
            totalPrice: item._sum.price || 0
          }
          return acc
        }, {})
      },
      recentTransactions: transactionsList,
      recentWithdrawals: withdrawalsList
    }

    res.json({ report })
  } catch (error) {
    next(error)
  }
})

export default router
