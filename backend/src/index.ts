import express from 'express'
import { createServer } from 'http'
import cors from 'cors'
import config from './config/env'
import prisma from './config/database'
import { errorHandler, notFoundHandler } from './middleware/errorHandler'
import { initializeSocketIO } from './realtime/socket'
import authRoutes from './routes/auth'
import specialistsRoutes from './routes/specialists'
import bookingsRoutes from './routes/bookings'
import reviewsRoutes from './routes/reviews'
import sessionsRoutes from './routes/sessions'
import paymentsRoutes from './routes/payments'
import withdrawalsRoutes from './routes/withdrawals'
import adminRoutes from './routes/admin'
import chatRoutes from './routes/chat'
import uploadRoutes from './routes/upload'
import notificationsRoutes from './routes/notifications'
import searchRoutes from './routes/search'
import analyticsRoutes from './routes/analytics'

const app = express()
const PORT = config.port

// Make Prisma available to routes
app.locals.prisma = prisma

// Middleware
app.use(cors({
  origin: config.appUrl,
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/specialists', specialistsRoutes)
app.use('/api/bookings', bookingsRoutes)
app.use('/api/reviews', reviewsRoutes)
app.use('/api/sessions', sessionsRoutes)
app.use('/api/payments', paymentsRoutes)
app.use('/api/withdrawals', withdrawalsRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/notifications', notificationsRoutes)
app.use('/api/search', searchRoutes)
app.use('/api/analytics', analyticsRoutes)

// 404 handler
app.use(notFoundHandler)

// Error handler (должен быть последним)
app.use(errorHandler)

// Создаем HTTP сервер
const httpServer = createServer(app)

// Инициализируем Socket.IO
const io = initializeSocketIO(httpServer)

// Make Socket.IO available to routes
app.locals.io = io

// Запуск сервера (только если не в тестовом окружении)
if (config.nodeEnv !== 'test') {
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
    console.log(`📝 Environment: ${config.nodeEnv}`)
    console.log(`🌐 App URL: ${config.appUrl}`)
    console.log(`💾 Database: Connected`)
    console.log(`🔌 WebSocket: Ready`)
  })
}

export default app
export { io, httpServer }
