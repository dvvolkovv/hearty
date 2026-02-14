import { Router, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../config/database'
import config from '../config/env'
import { authenticate, AuthRequest } from '../middleware/auth'
import { AppError } from '../middleware/errorHandler'

const router = Router()

// GET /api/specialists - Получить список всех специалистов
router.get('/', async (req, res, next) => {
  try {
    const {
      specialty,
      format,
      minPrice,
      maxPrice,
      minRating,
      location,
      search,
      sortBy = 'rating',
      order = 'desc',
      page = '1',
      limit = '12'
    } = req.query

    // Построение условий фильтрации
    const where: any = {
      status: 'APPROVED', // Показываем только одобренных специалистов
    }

    if (specialty) {
      where.specialty = {
        contains: specialty as string,
        mode: 'insensitive'
      }
    }

    if (format) {
      where.format = {
        has: format as string
      }
    }

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseInt(minPrice as string)
      if (maxPrice) where.price.lte = parseInt(maxPrice as string)
    }

    if (minRating) {
      where.rating = {
        gte: parseFloat(minRating as string)
      }
    }

    if (location) {
      where.location = {
        contains: location as string,
        mode: 'insensitive'
      }
    }

    if (search) {
      where.OR = [
        {
          name: {
            contains: search as string,
            mode: 'insensitive'
          }
        },
        {
          specialty: {
            contains: search as string,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: search as string,
            mode: 'insensitive'
          }
        }
      ]
    }

    // Сортировка
    const orderBy: any = {}
    if (sortBy === 'price') {
      orderBy.price = order
    } else if (sortBy === 'rating') {
      orderBy.rating = order
    } else if (sortBy === 'experience') {
      orderBy.experience = order
    } else {
      orderBy.createdAt = 'desc'
    }

    // Пагинация
    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    // Получение данных
    const [specialists, total] = await Promise.all([
      prisma.specialist.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        select: {
          id: true,
          name: true,
          specialty: true,
          description: true,
          price: true,
          location: true,
          format: true,
          tags: true,
          rating: true,
          totalReviews: true,
          experience: true,
          image: true,
          status: true,
          createdAt: true,
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

// GET /api/specialists/:id - Получить полный профиль специалиста
router.get('/:id', async (req, res, next) => {
  try {
    const id = req.params.id as string

    const specialist = await prisma.specialist.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            status: true,
          }
        },
        reviews: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 10,
          include: {
            client: {
              select: {
                name: true,
                user: {
                  select: {
                    avatar: true
                  }
                }
              }
            }
          }
        },
        timeSlots: {
          where: {
            isBooked: false,
            date: {
              gte: new Date()
            }
          },
          orderBy: {
            date: 'asc'
          },
          take: 30
        }
      }
    })

    if (!specialist) {
      throw new AppError('Specialist not found', 404)
    }

    // Allow the owner to view their own profile regardless of status
    let isOwner = false
    const authHeader = req.headers.authorization
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7)
        const decoded = jwt.verify(token, config.jwtSecret) as any
        isOwner = decoded.userId === specialist.userId
      } catch {
        // Invalid token, not the owner
      }
    }

    if (specialist.status !== 'APPROVED' && !isOwner) {
      throw new AppError('Specialist profile is not available', 403)
    }

    res.json({ specialist })
  } catch (error) {
    next(error)
  }
})

// PUT /api/specialists/:id - Обновить профиль специалиста (защищенный роут)
router.put('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const id = req.params.id as string
    const userId = req.user!.id

    // Проверяем, что специалист существует
    const specialist = await prisma.specialist.findUnique({
      where: { id },
      include: {
        user: true
      }
    })

    if (!specialist) {
      throw new AppError('Specialist not found', 404)
    }

    // Проверяем права доступа (только сам специалист или админ)
    if (specialist.userId !== userId && req.user!.role !== 'ADMIN') {
      throw new AppError('Access denied', 403)
    }

    const {
      name,
      specialty,
      description,
      fullDescription,
      price,
      location,
      format,
      tags,
      education,
      certifications,
      experience,
      phone,
      email,
      image
    } = req.body

    // Обновляем данные специалиста
    const updatedSpecialist = await prisma.specialist.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(specialty && { specialty }),
        ...(description && { description }),
        ...(fullDescription && { fullDescription }),
        ...(price !== undefined && { price }),
        ...(location && { location }),
        ...(format && { format }),
        ...(tags && { tags }),
        ...(education && { education }),
        ...(certifications && { certifications }),
        ...(experience !== undefined && { experience }),
        ...(phone && { phone }),
        ...(email && { email }),
        ...(image && { image }),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          }
        }
      }
    })

    res.json({
      message: 'Specialist profile updated successfully',
      specialist: updatedSpecialist
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/specialists/:id/availability - Получить доступные слоты специалиста
router.get('/:id/availability', async (req, res, next) => {
  try {
    const id = req.params.id as string
    const { startDate, endDate } = req.query

    const specialist = await prisma.specialist.findUnique({
      where: { id }
    })

    if (!specialist) {
      throw new AppError('Specialist not found', 404)
    }

    const where: any = {
      specialistId: id,
      isBooked: false,
    }

    if (startDate) {
      where.date = {
        gte: new Date(startDate as string)
      }
    }

    if (endDate) {
      if (where.date) {
        where.date.lte = new Date(endDate as string)
      } else {
        where.date = {
          lte: new Date(endDate as string)
        }
      }
    }

    const timeSlots = await prisma.timeSlot.findMany({
      where,
      orderBy: [
        { date: 'asc' },
        { time: 'asc' }
      ]
    })

    res.json({ timeSlots })
  } catch (error) {
    next(error)
  }
})

// POST /api/specialists/:id/availability - Установить доступность (защищенный роут)
router.post('/:id/availability', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const id = req.params.id as string
    const userId = req.user!.id

    const specialist = await prisma.specialist.findUnique({
      where: { id }
    })

    if (!specialist) {
      throw new AppError('Specialist not found', 404)
    }

    // Проверяем права доступа
    if (specialist.userId !== userId && req.user!.role !== 'ADMIN') {
      throw new AppError('Access denied', 403)
    }

    const { slots } = req.body

    if (!Array.isArray(slots) || slots.length === 0) {
      throw new AppError('Slots array is required', 400)
    }

    // Создаем или обновляем слоты
    const createdSlots = await Promise.all(
      slots.map(async (slot: any) => {
        const { date, time, isBooked = false } = slot

        if (!date || !time) {
          throw new AppError('Date and time are required for each slot', 400)
        }

        // Проверяем, существует ли уже такой слот
        const existingSlot = await prisma.timeSlot.findFirst({
          where: {
            specialistId: id,
            date: new Date(date),
            time: Array.isArray(time) ? time[0] : time
          }
        })

        if (existingSlot) {
          // Обновляем существующий
          return prisma.timeSlot.update({
            where: { id: existingSlot.id },
            data: {
              isBooked
            }
          })
        } else {
          // Создаем новый
          return prisma.timeSlot.create({
            data: {
              specialistId: id,
              date: new Date(date),
              time: Array.isArray(time) ? time[0] : time,
              isBooked
            }
          })
        }
      })
    )

    res.status(201).json({
      message: 'Availability updated successfully',
      slots: createdSlots
    })
  } catch (error) {
    next(error)
  }
})

export default router
