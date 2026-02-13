import { Server as SocketIOServer, Socket } from 'socket.io'

interface UserPresence {
  userId: string
  status: 'online' | 'offline' | 'away'
  lastSeen: Date
  socketId: string
}

// In-memory store for user presence
// In production, consider using Redis for scalability
const userPresence = new Map<string, UserPresence>()

/**
 * Register presence event handlers
 */
export const registerPresenceHandlers = (io: SocketIOServer, socket: Socket) => {
  const userId = socket.data.userId

  // Set user as online on connection
  setUserPresence(userId, {
    userId,
    status: 'online',
    lastSeen: new Date(),
    socketId: socket.id
  })

  // Broadcast online status
  socket.broadcast.emit('user:online', {
    userId,
    status: 'online',
    timestamp: new Date()
  })

  /**
   * Update presence status
   */
  socket.on('presence:update', (data: { status: 'online' | 'away' }) => {
    const { status } = data

    setUserPresence(userId, {
      userId,
      status,
      lastSeen: new Date(),
      socketId: socket.id
    })

    // Broadcast status change
    socket.broadcast.emit('user:status', {
      userId,
      status,
      timestamp: new Date()
    })
  })

  /**
   * Get online users
   */
  socket.on('presence:get-online', () => {
    const onlineUsers = Array.from(userPresence.values())
      .filter(p => p.status === 'online')
      .map(p => ({
        userId: p.userId,
        status: p.status,
        lastSeen: p.lastSeen
      }))

    socket.emit('presence:online-users', { users: onlineUsers })
  })

  /**
   * Get specific user presence
   */
  socket.on('presence:get-user', (data: { userId: string }) => {
    const { userId: targetUserId } = data
    const presence = userPresence.get(targetUserId)

    socket.emit('presence:user-status', {
      userId: targetUserId,
      status: presence?.status || 'offline',
      lastSeen: presence?.lastSeen || null
    })
  })

  /**
   * Join chat room presence
   * Track who is currently viewing a specific chat
   */
  socket.on('presence:join-chat', (data: { roomId: string }) => {
    const { roomId } = data
    socket.join(`presence:chat:${roomId}`)

    // Notify others in the room
    socket.to(`presence:chat:${roomId}`).emit('presence:user-joined-chat', {
      roomId,
      userId,
      timestamp: new Date()
    })
  })

  /**
   * Leave chat room presence
   */
  socket.on('presence:leave-chat', (data: { roomId: string }) => {
    const { roomId } = data
    socket.leave(`presence:chat:${roomId}`)

    // Notify others in the room
    socket.to(`presence:chat:${roomId}`).emit('presence:user-left-chat', {
      roomId,
      userId,
      timestamp: new Date()
    })
  })

  /**
   * Handle disconnection
   */
  socket.on('disconnect', () => {
    // Set user as offline
    setUserPresence(userId, {
      userId,
      status: 'offline',
      lastSeen: new Date(),
      socketId: socket.id
    })

    // Broadcast offline status
    socket.broadcast.emit('user:offline', {
      userId,
      status: 'offline',
      timestamp: new Date()
    })

    // Clean up presence after some time (optional)
    // setTimeout(() => {
    //   userPresence.delete(userId)
    // }, 1000 * 60 * 60) // 1 hour
  })
}

/**
 * Set user presence
 */
const setUserPresence = (userId: string, presence: UserPresence) => {
  userPresence.set(userId, presence)
}

/**
 * Get user presence
 */
export const getUserPresence = (userId: string): UserPresence | undefined => {
  return userPresence.get(userId)
}

/**
 * Get all online users
 */
export const getOnlineUsers = (): UserPresence[] => {
  return Array.from(userPresence.values())
    .filter(p => p.status === 'online')
}

/**
 * Check if user is online
 */
export const isUserOnline = (userId: string): boolean => {
  const presence = userPresence.get(userId)
  return presence?.status === 'online'
}
