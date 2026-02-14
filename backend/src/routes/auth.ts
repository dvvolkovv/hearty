import { Router } from 'express'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import prisma from '../config/database'
import { authenticate, generateToken, AuthRequest } from '../middleware/auth'
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email'
import { AppError } from '../middleware/errorHandler'
import config from '../config/env'

const router = Router()

// Регистрация
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, role, firstName, lastName } = req.body

    // Валидация
    if (!email || !password || !role) {
      throw new AppError('Missing required fields', 400)
    }

    if (!['CLIENT', 'SPECIALIST'].includes(role)) {
      throw new AppError('Invalid role', 400)
    }

    if (password.length < 6) {
      throw new AppError('Password must be at least 6 characters', 400)
    }

    // Проверка существования email
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      throw new AppError('Email already registered', 400)
    }

    // Хешируем пароль
    const passwordHash = await bcrypt.hash(password, 10)

    // Если SMTP настроен — требуем верификацию, иначе — автоактивация
    const smtpConfigured = !!(config.smtp.user && config.smtp.password)
    const verificationToken = smtpConfigured ? crypto.randomBytes(32).toString('hex') : null

    // Создаем пользователя с профилем
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: role as any,
        firstName,
        lastName,
        verificationToken,
        // Автоактивация если SMTP не настроен
        ...(!smtpConfigured && {
          emailVerified: true,
          status: 'ACTIVE',
        }),
        // Создаем связанный профиль
        ...(role === 'SPECIALIST' && {
          specialist: {
            create: {
              name: `${firstName || ''} ${lastName || ''}`.trim() || 'Новый специалист',
              specialty: '',
              description: '',
              price: 0,
              format: [],
              tags: [],
              education: [],
              certifications: [],
            }
          }
        }),
        ...(role === 'CLIENT' && {
          client: {
            create: {}
          }
        })
      },
      include: {
        specialist: true,
        client: true
      }
    })

    // Отправляем email верификации (только если SMTP настроен)
    if (smtpConfigured && verificationToken) {
      await sendVerificationEmail(email, verificationToken)
    }

    res.status(201).json({
      message: smtpConfigured
        ? 'Registration successful. Please check your email for verification.'
        : 'Registration successful. You can now log in.',
      userId: user.id
    })
  } catch (error) {
    next(error)
  }
})

// Верификация email
router.get('/verify-email/:token', async (req, res, next) => {
  try {
    const { token } = req.params

    const user = await prisma.user.findFirst({
      where: { verificationToken: token }
    })

    if (!user) {
      throw new AppError('Invalid verification token', 400)
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        status: 'ACTIVE',
        verificationToken: null
      }
    })

    res.json({ message: 'Email verified successfully' })
  } catch (error) {
    next(error)
  }
})

// Вход
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      throw new AppError('Email and password required', 400)
    }

    // Находим пользователя
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        specialist: true,
        client: true
      }
    })

    if (!user) {
      throw new AppError('Invalid credentials', 401)
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401)
    }

    // Проверяем статус
    if (user.status !== 'ACTIVE') {
      if (user.status === 'PENDING') {
        throw new AppError('Please verify your email first', 403)
      }
      throw new AppError('Account suspended', 403)
    }

    // Обновляем lastLoginAt
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    // Генерируем токен
    const token = generateToken(user.id, user.email, user.role)

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        specialist: user.specialist,
        client: user.client
      }
    })
  } catch (error) {
    next(error)
  }
})

// Забыли пароль
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body

    const user = await prisma.user.findUnique({ where: { email } })

    // Не раскрываем существование email
    if (!user) {
      return res.json({ message: 'If email exists, reset link will be sent' })
    }

    // Генерируем токен сброса
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetExpires = new Date(Date.now() + 3600000) // 1 час

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires
      }
    })

    await sendPasswordResetEmail(email, resetToken)

    res.json({ message: 'If email exists, reset link will be sent' })
  } catch (error) {
    next(error)
  }
})

// Сброс пароля
router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, newPassword } = req.body

    if (!token || !newPassword) {
      throw new AppError('Token and new password required', 400)
    }

    if (newPassword.length < 6) {
      throw new AppError('Password must be at least 6 characters', 400)
    }

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gt: new Date() }
      }
    })

    if (!user) {
      throw new AppError('Invalid or expired reset token', 400)
    }

    const passwordHash = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null
      }
    })

    res.json({ message: 'Password reset successful' })
  } catch (error) {
    next(error)
  }
})

// Получить текущего пользователя (защищенный роут)
router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        emailVerified: true,
        status: true,
        createdAt: true,
        specialist: true,
        client: true
      }
    })

    res.json({ user })
  } catch (error) {
    next(error)
  }
})

export default router
