import { Socket } from 'socket.io'
import jwt from 'jsonwebtoken'
import config from '../config/env'
import { AppError } from '../middleware/errorHandler'

interface JWTPayload {
  userId: string
  email: string
  role: 'CLIENT' | 'SPECIALIST' | 'ADMIN'
  iat?: number
  exp?: number
}

/**
 * Authenticate WebSocket connection using JWT token
 *
 * Token can be provided in:
 * - socket.handshake.auth.token
 * - socket.handshake.query.token
 * - socket.handshake.headers.authorization (Bearer format)
 */
export const authenticateSocket = async (socket: Socket): Promise<JWTPayload> => {
  let token: string | undefined

  // Try to get token from different sources
  if (socket.handshake.auth?.token) {
    token = socket.handshake.auth.token as string
  } else if (socket.handshake.query?.token) {
    token = socket.handshake.query.token as string
  } else if (socket.handshake.headers?.authorization) {
    const authHeader = socket.handshake.headers.authorization
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }
  }

  if (!token) {
    throw new AppError('Authentication token required', 401)
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JWTPayload

    // Store user info on socket for easy access in handlers
    socket.data.userId = decoded.userId
    socket.data.email = decoded.email
    socket.data.role = decoded.role

    return decoded
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError('Invalid authentication token', 401)
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError('Authentication token expired', 401)
    }
    throw error
  }
}

/**
 * Middleware to authenticate socket connection
 * Disconnects socket if authentication fails
 */
export const socketAuthMiddleware = async (socket: Socket, next: (err?: Error) => void) => {
  try {
    await authenticateSocket(socket)
    next()
  } catch (error) {
    const err = error instanceof AppError
      ? new Error(error.message)
      : new Error('Authentication failed')
    next(err)
  }
}
