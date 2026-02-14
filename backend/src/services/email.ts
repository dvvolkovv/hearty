const nodemailer = require('nodemailer')
import config from '../config/env'

const createTransporter = () => {
  if (config.smtp.user && config.smtp.password) {
    console.log('Email service: using SMTP transporter')
    return nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.password,
      },
    })
  }

  console.log('Email service: SMTP not configured, using mock transporter')
  return {
    sendMail: async (options: any) => {
      console.log('Mock email sent:', { to: options.to, subject: options.subject })
      return Promise.resolve()
    }
  }
}

const transporter = createTransporter()

export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationUrl = `${config.appUrl}/verify-email/${token}`

  try {
    await transporter.sendMail({
      from: config.fromEmail,
      to: email,
      subject: 'Подтвердите ваш email - Hearty',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Добро пожаловать в Hearty!</h2>
          <p>Для завершения регистрации, пожалуйста, подтвердите ваш email:</p>
          <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background: #0891B2; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Подтвердить email
          </a>
          <p>Или скопируйте эту ссылку в браузер:</p>
          <p style="color: #666; font-size: 14px;">${verificationUrl}</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">
            Если вы не регистрировались на Hearty, просто проигнорируйте это письмо.
          </p>
        </div>
      `,
    })
    console.log(`Verification email sent to ${email}`)
  } catch (error) {
    console.error('Failed to send verification email:', error)
    // Не бросаем ошибку, чтобы не блокировать регистрацию
  }
}

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetUrl = `${config.appUrl}/reset-password/${token}`

  try {
    await transporter.sendMail({
      from: config.fromEmail,
      to: email,
      subject: 'Сброс пароля - Hearty',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Сброс пароля</h2>
          <p>Вы запросили сброс пароля. Нажмите на кнопку ниже для создания нового пароля:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #0891B2; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Сбросить пароль
          </a>
          <p>Или скопируйте эту ссылку в браузер:</p>
          <p style="color: #666; font-size: 14px;">${resetUrl}</p>
          <p style="color: #E53E3E; margin-top: 20px;">Ссылка действительна в течение 1 часа.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">
            Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.
          </p>
        </div>
      `,
    })
    console.log(`Password reset email sent to ${email}`)
  } catch (error) {
    console.error('Failed to send password reset email:', error)
  }
}

export const sendBookingConfirmation = async (
  email: string,
  data: {
    clientName: string
    specialistName: string
    date: string
    time: string
    price: number
  }
) => {
  try {
    await transporter.sendMail({
      from: config.fromEmail,
      to: email,
      subject: 'Бронирование подтверждено - Hearty',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Ваше бронирование подтверждено!</h2>
          <div style="background: #F7FAFC; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Специалист:</strong> ${data.specialistName}</p>
            <p><strong>Дата:</strong> ${data.date}</p>
            <p><strong>Время:</strong> ${data.time}</p>
            <p><strong>Стоимость:</strong> ${data.price / 100} ₽</p>
          </div>
          <p>Ссылка на сессию будет отправлена за 15 минут до начала.</p>
          <a href="${config.appUrl}/dashboard" style="display: inline-block; padding: 12px 24px; background: #0891B2; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Перейти в личный кабинет
          </a>
        </div>
      `,
    })
    console.log(`Booking confirmation sent to ${email}`)
  } catch (error) {
    console.error('Failed to send booking confirmation:', error)
  }
}
