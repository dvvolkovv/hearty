import { Router } from 'express'
import { prisma } from '../config/database'
import { authenticate, AuthRequest } from '../middleware/auth'
import { AppError } from '../middleware/errorHandler'

const router = Router()

// Все routes требуют авторизации
router.use(authenticate)

// POST /api/reviews - Создать отзыв
router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id
    const {
      bookingId,
      rating,
      text,
      professionalismRating,
      empathyRating,
      resultRating
    } = req.body

    // Валидация
    if (!bookingId || !rating) {
      throw new AppError('Booking ID and rating are required', 400)
    }

    if (rating < 1 || rating > 5) {
      throw new AppError('Rating must be between 1 and 5', 400)
    }

    // Проверяем что пользователь - клиент
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { client: true }
    })

    if (!user?.client) {
      throw new AppError('Only clients can create reviews', 403)
    }

    // Проверяем что бронирование существует и завершено
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    })

    if (!booking) {
      throw new AppError('Booking not found', 404)
    }

    if (booking.clientId !== user.client.id) {
      throw new AppError('You can only review your own bookings', 403)
    }

    if (booking.status !== 'COMPLETED') {
      throw new AppError('Can only review completed bookings', 400)
    }

    // Проверяем что отзыв еще не оставлен
    const existingReview = await prisma.review.findFirst({
      where: {
        clientId: user.client.id,
        specialistId: booking.specialistId
      }
    })

    if (existingReview) {
      throw new AppError('You have already reviewed this specialist', 400)
    }

    // Создаем отзыв и обновляем рейтинг в транзакции
    const review = await prisma.$transaction(async (tx) => {
      // Создаем отзыв
      const newReview = await tx.review.create({
        data: {
          clientId: user.client.id,
          specialistId: booking.specialistId,
          rating,
          text: text || null,
          professionalismRating: professionalismRating || null,
          empathyRating: empathyRating || null,
          resultRating: resultRating || null,
          status: 'APPROVED' // Автоматическое одобрение (можно изменить на PENDING для модерации)
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
          }
        }
      })

      // Пересчитываем рейтинг специалиста
      const approvedReviews = await tx.review.findMany({
        where: {
          specialistId: booking.specialistId,
          status: 'APPROVED'
        },
        select: {
          rating: true
        }
      })

      const totalReviews = approvedReviews.length
      const averageRating = totalReviews > 0
        ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0

      // Обновляем специалиста
      await tx.specialist.update({
        where: { id: booking.specialistId },
        data: {
          rating: Math.round(averageRating * 10) / 10, // Округляем до 1 знака
          totalReviews
        }
      })

      return newReview
    })

    res.status(201).json({
      message: 'Review created successfully',
      review
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/reviews/specialist/:specialistId - Получить отзывы специалиста
router.get('/specialist/:specialistId', async (req: AuthRequest, res, next) => {
  try {
    const specialistId = req.params.specialistId as string
    const { page = '1', limit = '10', sortBy = 'createdAt', order = 'desc' } = req.query

    // Проверяем что специалист существует
    const specialist = await prisma.specialist.findUnique({
      where: { id: specialistId }
    })

    if (!specialist) {
      throw new AppError('Specialist not found', 404)
    }

    // Построение условий
    const where = {
      specialistId,
      status: 'APPROVED' as const
    }

    // Сортировка
    const orderBy: any = {}
    if (sortBy === 'rating') {
      orderBy.rating = order
    } else {
      orderBy.createdAt = order
    }

    // Пагинация
    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    // Получение данных
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy,
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

// GET /api/reviews/:id - Получить конкретный отзыв
router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const reviewId = req.params.id as string

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            user: {
              select: {
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
            image: true
          }
        }
      }
    })

    if (!review) {
      throw new AppError('Review not found', 404)
    }

    res.json({ review })
  } catch (error) {
    next(error)
  }
})

// PUT /api/reviews/:id - Обновить отзыв
router.put('/:id', async (req: AuthRequest, res, next) => {
  try {
    const reviewId = req.params.id as string
    const userId = req.user!.id
    const { rating, text, professionalismRating, empathyRating, resultRating } = req.body

    // Валидация рейтинга
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      throw new AppError('Rating must be between 1 and 5', 400)
    }

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        client: {
          include: {
            user: true
          }
        }
      }
    })

    if (!review) {
      throw new AppError('Review not found', 404)
    }

    // Проверяем права доступа (только автор)
    if (review.client.user.id !== userId) {
      throw new AppError('You can only update your own reviews', 403)
    }

    // Обновляем отзыв и пересчитываем рейтинг специалиста
    const updatedReview = await prisma.$transaction(async (tx) => {
      // Обновляем отзыв
      const updated = await tx.review.update({
        where: { id: reviewId },
        data: {
          ...(rating !== undefined && { rating }),
          ...(text !== undefined && { text }),
          ...(professionalismRating !== undefined && { professionalismRating }),
          ...(empathyRating !== undefined && { empathyRating }),
          ...(resultRating !== undefined && { resultRating }),
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
          }
        }
      })

      // Если рейтинг изменился, пересчитываем средний рейтинг специалиста
      if (rating !== undefined) {
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
        const averageRating = totalReviews > 0
          ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
          : 0

        await tx.specialist.update({
          where: { id: review.specialistId },
          data: {
            rating: Math.round(averageRating * 10) / 10
          }
        })
      }

      return updated
    })

    res.json({
      message: 'Review updated successfully',
      review: updatedReview
    })
  } catch (error) {
    next(error)
  }
})

// DELETE /api/reviews/:id - Удалить отзыв
router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const reviewId = req.params.id as string
    const userId = req.user!.id

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        client: {
          include: {
            user: true
          }
        }
      }
    })

    if (!review) {
      throw new AppError('Review not found', 404)
    }

    // Проверяем права доступа
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    const isAuthor = review.client.user.id === userId
    const isAdmin = user?.role === 'ADMIN'

    if (!isAuthor && !isAdmin) {
      throw new AppError('Access denied', 403)
    }

    // Удаляем отзыв и пересчитываем рейтинг
    await prisma.$transaction(async (tx) => {
      // Удаляем отзыв
      await tx.review.delete({
        where: { id: reviewId }
      })

      // Пересчитываем рейтинг специалиста
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
      const averageRating = totalReviews > 0
        ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0

      await tx.specialist.update({
        where: { id: review.specialistId },
        data: {
          rating: Math.round(averageRating * 10) / 10,
          totalReviews
        }
      })
    })

    res.json({
      message: 'Review deleted successfully'
    })
  } catch (error) {
    next(error)
  }
})

export default router
