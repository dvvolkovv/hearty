import dotenv from 'dotenv'

dotenv.config()

// Валидация обязательных переменных окружения
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET']

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`)
  }
}

export const config = {
  // Database
  databaseUrl: process.env.DATABASE_URL as string,

  // JWT
  jwtSecret: process.env.JWT_SECRET as string,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // SMTP
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
  },
  fromEmail: process.env.FROM_EMAIL || 'noreply@hearty.pro',

  // App
  appUrl: process.env.APP_URL || 'http://localhost:5173',
  port: parseInt(process.env.PORT || '3001'),
  nodeEnv: process.env.NODE_ENV || 'development',

  // Payment
  yookassa: {
    shopId: process.env.YOOKASSA_SHOP_ID || '',
    secretKey: process.env.YOOKASSA_SECRET_KEY || '',
  },

  // AI
  openAiApiKey: process.env.OPENAI_API_KEY || '',
}

export default config
