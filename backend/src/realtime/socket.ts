import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer, Socket } from 'socket.io'
import config from '../config/env'
import { socketAuthMiddleware } from './auth'
import { registerChatHandlers } from './handlers/chat'
import { registerNotificationHandlers } from './handlers/notifications'
import { registerPresenceHandlers } from './handlers/presence'

let io: SocketIOServer | null = null

/**
 * Initialize Socket.IO server and attach to HTTP server
 */
export const initializeSocketIO = (httpServer: HTTPServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: config.appUrl,
      credentials: true,
      methods: ['GET', 'POST']
    },
    // Connection settings
    pingTimeout: 60000,
    pingInterval: 25000,
    // Transport settings
    transports: ['websocket', 'polling'],
    // Allow upgrades from polling to websocket
    allowUpgrades: true
  })

  // Global authentication middleware
  io.use(socketAuthMiddleware)

  // Handle connection
  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId
    const role = socket.data.role

    console.log(`✅ User connected: ${userId} (${role}) - Socket: ${socket.id}`)

    // Join user-specific room for private notifications
    socket.join(`user:${userId}`)

    // Register event handlers
    registerChatHandlers(io, socket)
    registerNotificationHandlers(io, socket)
    registerPresenceHandlers(io, socket)

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`❌ User disconnected: ${userId} - Reason: ${reason}`)
    })

    // Handle errors
    socket.on('error', (error) => {
      console.error(`🔴 Socket error for user ${userId}:`, error)
    })
  })

  console.log('🔌 Socket.IO server initialized')
  return io
}

/**
 * Get Socket.IO server instance
 */
export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initializeSocketIO first.')
  }
  return io
}

/**
 * Emit event to specific user(s)
 */
export const emitToUser = (userId: string, event: string, data: any) => {
  if (!io) {
    console.warn('Socket.IO not initialized, skipping emit')
    return
  }
  io.to(`user:${userId}`).emit(event, data)
}

/**
 * Emit event to specific room
 */
export const emitToRoom = (roomId: string, event: string, data: any) => {
  if (!io) {
    console.warn('Socket.IO not initialized, skipping emit')
    return
  }
  io.to(roomId).emit(event, data)
}

/**
 * Emit event to all connected clients
 */
export const emitToAll = (event: string, data: any) => {
  if (!io) {
    console.warn('Socket.IO not initialized, skipping emit')
    return
  }
  io.emit(event, data)
}

export default io
