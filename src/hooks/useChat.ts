import { useEffect, useState, useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { Message } from '../api/chat';

export interface TypingIndicator {
  roomId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

/**
 * useChat - Hook for real-time chat functionality
 *
 * Features:
 * - Auto join/leave chat room
 * - Listen for new messages
 * - Send typing indicators
 * - Mark messages as read
 * - Real-time updates
 */
export const useChat = (roomId: string | null) => {
  const { socket, connected } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [isJoined, setIsJoined] = useState(false);

  // Join chat room
  useEffect(() => {
    if (!socket || !connected || !roomId) {
      return;
    }

    console.log(`📨 Joining chat room: ${roomId}`);
    socket.emit('chat:join', { roomId });

    // Listen for join confirmation
    const handleJoined = (data: { roomId: string }) => {
      if (data.roomId === roomId) {
        console.log(`✅ Joined chat room: ${roomId}`);
        setIsJoined(true);
      }
    };

    socket.on('chat:joined', handleJoined);

    // Leave room on unmount
    return () => {
      console.log(`📨 Leaving chat room: ${roomId}`);
      socket.emit('chat:leave', { roomId });
      socket.off('chat:joined', handleJoined);
      setIsJoined(false);
    };
  }, [socket, connected, roomId]);

  // Listen for new messages
  useEffect(() => {
    if (!socket || !roomId) {
      return;
    }

    const handleNewMessage = (message: Message) => {
      if (message.chatRoomId === roomId) {
        console.log('📨 New message received:', message);
        setMessages((prev) => [...prev, message]);
      }
    };

    socket.on('chat:message:new', handleNewMessage);

    return () => {
      socket.off('chat:message:new', handleNewMessage);
    };
  }, [socket, roomId]);

  // Listen for typing indicators
  useEffect(() => {
    if (!socket || !roomId) {
      return;
    }

    const handleTyping = (data: TypingIndicator) => {
      if (data.roomId === roomId) {
        setTypingUsers((prev) => {
          // Remove existing entry for this user
          const filtered = prev.filter((t) => t.userId !== data.userId);

          // If typing, add new entry
          if (data.isTyping) {
            return [...filtered, data];
          }

          // If not typing, just return filtered list
          return filtered;
        });
      }
    };

    socket.on('chat:typing', handleTyping);

    return () => {
      socket.off('chat:typing', handleTyping);
    };
  }, [socket, roomId]);

  // Listen for read receipts
  useEffect(() => {
    if (!socket || !roomId) {
      return;
    }

    const handleMessageRead = (data: {
      messageId: string;
      roomId: string;
      readBy: string;
      readAt: Date;
    }) => {
      if (data.roomId === roomId) {
        console.log(`📨 Message ${data.messageId} marked as read by ${data.readBy}`);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === data.messageId
              ? { ...msg, isRead: true, readAt: data.readAt.toString() }
              : msg
          )
        );
      }
    };

    socket.on('chat:message:read', handleMessageRead);

    return () => {
      socket.off('chat:message:read', handleMessageRead);
    };
  }, [socket, roomId]);

  // Send typing indicator
  const setTyping = useCallback(
    (isTyping: boolean) => {
      if (!socket || !roomId || !isJoined) {
        return;
      }

      socket.emit('chat:typing', { roomId, isTyping });
    },
    [socket, roomId, isJoined]
  );

  // Mark message as read
  const markAsRead = useCallback(
    (messageId: string) => {
      if (!socket || !roomId || !isJoined) {
        return;
      }

      socket.emit('chat:message:read', { messageId, roomId });
    },
    [socket, roomId, isJoined]
  );

  // Load initial messages (helper function, actual loading done via REST API)
  const setInitialMessages = useCallback((msgs: Message[]) => {
    setMessages(msgs);
  }, []);

  return {
    messages,
    typingUsers,
    isJoined,
    connected,
    setTyping,
    markAsRead,
    setInitialMessages
  };
};
