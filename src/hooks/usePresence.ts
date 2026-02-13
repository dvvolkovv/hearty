import { useEffect, useState, useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';

export type PresenceStatus = 'online' | 'offline' | 'away';

export interface UserPresence {
  userId: string;
  status: PresenceStatus;
  lastSeen: Date | null;
}

/**
 * usePresence - Hook for user presence/online status
 *
 * Features:
 * - Track specific user online status
 * - Track all online users
 * - Update own status (online/away)
 * - Chat room presence tracking
 */
export const usePresence = (targetUserId?: string) => {
  const { socket, connected } = useSocket();
  const [userStatus, setUserStatus] = useState<UserPresence>({
    userId: targetUserId || '',
    status: 'offline',
    lastSeen: null
  });
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);

  // Listen for user online/offline events
  useEffect(() => {
    if (!socket || !connected) {
      return;
    }

    const handleUserOnline = (data: { userId: string; status: string; timestamp: Date }) => {
      console.log(`👤 User ${data.userId} is now online`);

      // Update specific user status if watching
      if (targetUserId && data.userId === targetUserId) {
        setUserStatus({
          userId: data.userId,
          status: 'online',
          lastSeen: null
        });
      }

      // Update online users list
      setOnlineUsers((prev) => {
        const filtered = prev.filter((u) => u.userId !== data.userId);
        return [
          ...filtered,
          {
            userId: data.userId,
            status: 'online' as PresenceStatus,
            lastSeen: null
          }
        ];
      });
    };

    const handleUserOffline = (data: { userId: string; status: string; timestamp: Date }) => {
      console.log(`👤 User ${data.userId} is now offline`);

      // Update specific user status if watching
      if (targetUserId && data.userId === targetUserId) {
        setUserStatus({
          userId: data.userId,
          status: 'offline',
          lastSeen: new Date(data.timestamp)
        });
      }

      // Update online users list
      setOnlineUsers((prev) =>
        prev.map((u) =>
          u.userId === data.userId
            ? { ...u, status: 'offline' as PresenceStatus, lastSeen: new Date(data.timestamp) }
            : u
        )
      );
    };

    const handleUserStatus = (data: { userId: string; status: string; timestamp: Date }) => {
      console.log(`👤 User ${data.userId} status changed to ${data.status}`);

      // Update specific user status if watching
      if (targetUserId && data.userId === targetUserId) {
        setUserStatus((prev) => ({
          ...prev,
          status: data.status as PresenceStatus
        }));
      }

      // Update online users list
      setOnlineUsers((prev) =>
        prev.map((u) =>
          u.userId === data.userId
            ? { ...u, status: data.status as PresenceStatus }
            : u
        )
      );
    };

    socket.on('user:online', handleUserOnline);
    socket.on('user:offline', handleUserOffline);
    socket.on('user:status', handleUserStatus);

    return () => {
      socket.off('user:online', handleUserOnline);
      socket.off('user:offline', handleUserOffline);
      socket.off('user:status', handleUserStatus);
    };
  }, [socket, connected, targetUserId]);

  // Get specific user presence if targetUserId is provided
  useEffect(() => {
    if (!socket || !connected || !targetUserId) {
      return;
    }

    console.log(`👤 Getting presence for user: ${targetUserId}`);
    socket.emit('presence:get-user', { userId: targetUserId });

    const handleUserPresence = (data: {
      userId: string;
      status: string;
      lastSeen: Date | null;
    }) => {
      if (data.userId === targetUserId) {
        console.log(`👤 User ${targetUserId} presence:`, data.status);
        setUserStatus({
          userId: data.userId,
          status: data.status as PresenceStatus,
          lastSeen: data.lastSeen ? new Date(data.lastSeen) : null
        });
      }
    };

    socket.on('presence:user-status', handleUserPresence);

    return () => {
      socket.off('presence:user-status', handleUserPresence);
    };
  }, [socket, connected, targetUserId]);

  // Update own presence status
  const updateStatus = useCallback(
    (status: 'online' | 'away') => {
      if (!socket || !connected) {
        return;
      }

      console.log(`👤 Updating own status to: ${status}`);
      socket.emit('presence:update', { status });
    },
    [socket, connected]
  );

  // Get all online users
  const getOnlineUsers = useCallback(() => {
    if (!socket || !connected) {
      return;
    }

    console.log('👤 Getting online users...');
    socket.emit('presence:get-online');

    const handleOnlineUsers = (data: { users: UserPresence[] }) => {
      console.log(`👤 Online users count: ${data.users.length}`);
      setOnlineUsers(data.users);
    };

    socket.once('presence:online-users', handleOnlineUsers);
  }, [socket, connected]);

  // Join chat room presence (track who is viewing the chat)
  const joinChatPresence = useCallback(
    (roomId: string) => {
      if (!socket || !connected) {
        return;
      }

      console.log(`👤 Joining chat presence for room: ${roomId}`);
      socket.emit('presence:join-chat', { roomId });
    },
    [socket, connected]
  );

  // Leave chat room presence
  const leaveChatPresence = useCallback(
    (roomId: string) => {
      if (!socket || !connected) {
        return;
      }

      console.log(`👤 Leaving chat presence for room: ${roomId}`);
      socket.emit('presence:leave-chat', { roomId });
    },
    [socket, connected]
  );

  return {
    userStatus, // Specific user status (if targetUserId provided)
    onlineUsers, // All online users
    connected,
    updateStatus,
    getOnlineUsers,
    joinChatPresence,
    leaveChatPresence
  };
};
