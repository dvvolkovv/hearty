import { useEffect, useState, useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';
import toast from 'react-hot-toast';

export interface Notification {
  id: string;
  subject: string;
  message: string;
  actionUrl: string | null;
  data: any;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

/**
 * useNotifications - Hook for real-time notifications
 *
 * Features:
 * - Subscribe to notifications
 * - Listen for new notifications
 * - Mark as read
 * - Mark all as read
 * - Unread count tracking
 * - Toast notifications
 */
export const useNotifications = () => {
  const { socket, connected } = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [subscribed, setSubscribed] = useState(false);

  // Subscribe to notifications
  useEffect(() => {
    if (!socket || !connected) {
      return;
    }

    console.log('🔔 Subscribing to notifications...');
    socket.emit('notifications:subscribe');

    // Listen for subscription confirmation
    const handleSubscribed = (data: { userId: string }) => {
      console.log('✅ Subscribed to notifications:', data.userId);
      setSubscribed(true);

      // Get initial unread count
      socket.emit('notifications:get-unread-count');
    };

    socket.on('notifications:subscribed', handleSubscribed);

    // Unsubscribe on unmount
    return () => {
      console.log('🔔 Unsubscribing from notifications...');
      socket.emit('notifications:unsubscribe');
      socket.off('notifications:subscribed', handleSubscribed);
      setSubscribed(false);
    };
  }, [socket, connected]);

  // Listen for new notifications
  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleNewNotification = (notification: Notification) => {
      console.log('🔔 New notification received:', notification);

      // Add to list
      setNotifications((prev) => [notification, ...prev]);

      // Increment unread count
      setUnreadCount((prev) => prev + 1);

      // Show toast
      toast.success(notification.subject, {
        duration: 4000,
        icon: '🔔'
      });
    };

    socket.on('notification:new', handleNewNotification);

    return () => {
      socket.off('notification:new', handleNewNotification);
    };
  }, [socket]);

  // Listen for notification updates
  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleNotificationUpdate = (notification: Notification) => {
      console.log('🔔 Notification updated:', notification);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? notification : n))
      );
    };

    socket.on('notification:updated', handleNotificationUpdate);

    return () => {
      socket.off('notification:updated', handleNotificationUpdate);
    };
  }, [socket]);

  // Listen for read confirmation
  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleNotificationRead = (data: { notificationId: string }) => {
      console.log('🔔 Notification marked as read:', data.notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === data.notificationId
            ? { ...n, isRead: true, readAt: new Date().toISOString() }
            : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    };

    socket.on('notifications:read', handleNotificationRead);

    return () => {
      socket.off('notifications:read', handleNotificationRead);
    };
  }, [socket]);

  // Listen for all read confirmation
  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleAllRead = () => {
      console.log('🔔 All notifications marked as read');
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          isRead: true,
          readAt: new Date().toISOString()
        }))
      );
      setUnreadCount(0);
    };

    socket.on('notifications:all-read', handleAllRead);

    return () => {
      socket.off('notifications:all-read', handleAllRead);
    };
  }, [socket]);

  // Listen for unread count updates
  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleUnreadCount = (data: { count: number }) => {
      console.log('🔔 Unread count:', data.count);
      setUnreadCount(data.count);
    };

    socket.on('notifications:unread-count', handleUnreadCount);

    return () => {
      socket.off('notifications:unread-count', handleUnreadCount);
    };
  }, [socket]);

  // Mark notification as read
  const markAsRead = useCallback(
    (notificationId: string) => {
      if (!socket || !subscribed) {
        return;
      }

      socket.emit('notifications:mark-read', { notificationId });
    },
    [socket, subscribed]
  );

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    if (!socket || !subscribed) {
      return;
    }

    socket.emit('notifications:mark-all-read');
  }, [socket, subscribed]);

  // Refresh unread count
  const refreshUnreadCount = useCallback(() => {
    if (!socket || !subscribed) {
      return;
    }

    socket.emit('notifications:get-unread-count');
  }, [socket, subscribed]);

  // Set initial notifications (from REST API)
  const setInitialNotifications = useCallback((notifs: Notification[]) => {
    setNotifications(notifs);
  }, []);

  return {
    notifications,
    unreadCount,
    subscribed,
    connected,
    markAsRead,
    markAllAsRead,
    refreshUnreadCount,
    setInitialNotifications
  };
};
