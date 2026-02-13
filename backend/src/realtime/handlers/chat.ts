import { Server as SocketIOServer, Socket } from 'socket.io'
import prisma from '../../config/database'

interface JoinRoomData {
  roomId: string
}

interface SendMessageData {
  roomId: string
  text: string
}

interface TypingData {
  roomId: string
  isTyping: boolean
}

interface MessageReadData {
  messageId: string
  roomId: string
}

/**
 * Register chat event handlers
 */
export const registerChatHandlers = (io: SocketIOServer, socket: Socket) => {
  const userId = socket.data.userId

  /**
   * Join a chat room
   * Client must join room to receive messages
   */
  socket.on('chat:join', async (data: JoinRoomData) => {
    try {
      const { roomId } = data

      // Verify user has access to this chat room
      const room = await prisma.chatRoom.findFirst({
        where: {
          id: roomId,
          OR: [
            { clientId: userId },
            { specialist: { userId } }
          ]
        }
      })

      if (!room) {
        socket.emit('error', { message: 'Chat room not found or access denied' })
        return
      }

      // Join the room
      socket.join(`chat:${roomId}`)

      console.log(`User ${userId} joined chat room ${roomId}`)

      socket.emit('chat:joined', { roomId })
    } catch (error) {
      console.error('Error joining chat room:', error)
      socket.emit('error', { message: 'Failed to join chat room' })
    }
  })

  /**
   * Leave a chat room
   */
  socket.on('chat:leave', (data: JoinRoomData) => {
    const { roomId } = data
    socket.leave(`chat:${roomId}`)
    console.log(`User ${userId} left chat room ${roomId}`)
  })

  /**
   * Send a message
   * Note: Actual message is created via REST API
   * This event is emitted FROM the server TO other clients
   */
  socket.on('chat:message:send', async (data: SendMessageData) => {
    // This is handled by REST API endpoint POST /api/chat/messages
    // which will then emit 'message:new' event
    // This listener is kept for potential future direct WebSocket messaging
  })

  /**
   * Typing indicator
   */
  socket.on('chat:typing', async (data: TypingData) => {
    try {
      const { roomId, isTyping } = data

      // Verify user has access to this chat room
      const room = await prisma.chatRoom.findFirst({
        where: {
          id: roomId,
          OR: [
            { clientId: userId },
            { specialist: { userId } }
          ]
        },
        include: {
          client: {
            include: {
              user: { select: { firstName: true, lastName: true } }
            }
          },
          specialist: {
            include: {
              user: { select: { firstName: true, lastName: true } }
            }
          }
        }
      })

      if (!room) {
        return
      }

      // Get user name
      const userName = room.clientId === userId
        ? `${room.client.user.firstName} ${room.client.user.lastName}`
        : `${room.specialist.user.firstName} ${room.specialist.user.lastName}`

      // Broadcast to others in the room
      socket.to(`chat:${roomId}`).emit('chat:typing', {
        roomId,
        userId,
        userName,
        isTyping
      })
    } catch (error) {
      console.error('Error handling typing indicator:', error)
    }
  })

  /**
   * Mark message as read
   */
  socket.on('chat:message:read', async (data: MessageReadData) => {
    try {
      const { messageId, roomId } = data

      // Verify message exists and user has access
      const message = await prisma.message.findFirst({
        where: {
          id: messageId,
          chatRoomId: roomId,
          chatRoom: {
            OR: [
              { clientId: userId },
              { specialist: { userId } }
            ]
          }
        }
      })

      if (!message) {
        return
      }

      // Update read status if the recipient is reading
      if (message.senderId !== userId) {
        await prisma.message.update({
          where: { id: messageId },
          data: {
            isRead: true,
            readAt: new Date()
          }
        })

        // Notify sender that message was read
        socket.to(`chat:${roomId}`).emit('chat:message:read', {
          messageId,
          roomId,
          readBy: userId,
          readAt: new Date()
        })
      }
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  })
}

/**
 * Emit new message event to room
 * Called from REST API after creating a message
 */
export const emitNewMessage = (io: SocketIOServer, roomId: string, message: any) => {
  io.to(`chat:${roomId}`).emit('chat:message:new', message)
}
