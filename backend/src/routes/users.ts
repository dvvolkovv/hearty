import { Router } from 'express'
import bcrypt from 'bcrypt'
import prisma from '../config/database'
import { authenticate, AuthRequest } from '../middleware/auth'
import { AppError } from '../middleware/errorHandler'

const router = Router()

// Все routes требуют авторизации
router.use(authenticate)

// PATCH /api/users/:id - Обновить профиль пользователя
router.patch('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user!.id

    // Пользователь может обновлять только свой профиль
    if (id !== userId) {
      throw new AppError('Access denied', 403)
    }

    const { firstName, lastName, phone } = req.body

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(phone !== undefined && { phone }),
      },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        specialist: true,
        client: true
      }
    })

    res.json({ user: updatedUser })
  } catch (error) {
    next(error)
  }
})

// PATCH /api/users/:id/password - Изменить пароль
router.patch('/:id/password', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user!.id

    if (id !== userId) {
      throw new AppError('Access denied', 403)
    }

    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      throw new AppError('Current password and new password are required', 400)
    }

    if (newPassword.length < 6) {
      throw new AppError('Password must be at least 6 characters', 400)
    }

    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
      throw new AppError('User not found', 404)
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!isValid) {
      throw new AppError('Current password is incorrect', 400)
    }

    const passwordHash = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id },
      data: { passwordHash }
    })

    res.json({ message: 'Password updated successfully' })
  } catch (error) {
    next(error)
  }
})

// POST /api/users/:id/avatar - Загрузить аватар
router.post('/:id/avatar', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user!.id

    if (id !== userId) {
      throw new AppError('Access denied', 403)
    }

    // TODO: Implement file upload with multer
    // For now, accept base64 or URL
    const { avatarUrl } = req.body

    if (!avatarUrl) {
      throw new AppError('Avatar URL is required', 400)
    }

    await prisma.user.update({
      where: { id },
      data: { avatar: avatarUrl }
    })

    res.json({ avatarUrl })
  } catch (error) {
    next(error)
  }
})

export default router
