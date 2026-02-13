import express from 'express'
import cors from 'cors'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import config from './config/env'
import { errorHandler, notFoundHandler } from './middleware/errorHandler'
import authRoutes from './routes/auth'
import specialistsRoutes from './routes/specialists'

const app = express()
const PORT = config.port

// Storage configuration для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './public/images'
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

export const upload = multer({ storage })

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

// 404 handler
app.use(notFoundHandler)

// Error handler (должен быть последним)
app.use(errorHandler)

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📝 Environment: ${config.nodeEnv}`)
  console.log(`🌐 App URL: ${config.appUrl}`)
  console.log(`💾 Database: Connected`)
})

export default app
