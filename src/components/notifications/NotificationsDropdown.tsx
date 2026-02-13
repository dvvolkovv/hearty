import { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, Trash2, ExternalLink } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useNotifications } from '../../hooks/useNotifications';
import {
  getNotifications,
  deleteNotification,
  markNotificationAsRead as apiMarkAsRead,
} from '../../api/notifications';
import toast from 'react-hot-toast';

/**
 * NotificationsDropdown - Real-time notifications dropdown
 *
 * Features:
 * - Badge with unread count
 * - Real-time updates via WebSocket
 * - Mark as read
 * - Mark all as read
 * - Delete notifications
 * - Click to navigate
 */
export const NotificationsDropdown = () => {
  const {
    notifications,
    unreadCount,
    connected,
    markAsRead,
    markAllAsRead,
    setInitialNotifications,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load initial notifications on mount
  useEffect(() => {
    const loadNotifications = async () => {
      setLoading(true);
      try {
        const result = await getNotifications({ limit: 20 });
        setInitialNotifications(result.data);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [setInitialNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      // WebSocket real-time update
      markAsRead(notificationId);

      // Also call REST API for persistence
      await apiMarkAsRead(notificationId);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      toast.error('Не удалось пометить уведомление');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      markAllAsRead();
      toast.success('Все уведомления прочитаны');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error('Не удалось пометить уведомления');
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      setInitialNotifications(notifications.filter((n) => n.id !== notificationId));
      toast.success('Уведомление удалено');
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error('Не удалось удалить уведомление');
    }
  };

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    // Mark as read
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }

    // Navigate to action URL if exists
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }

    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon with Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6" />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}

        {/* Connection Status Indicator */}
        {connected && (
          <span className="absolute bottom-1 right-1 w-2 h-2 bg-green-500 rounded-full border border-white"></span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Уведомления</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <CheckCheck className="w-4 h-4" />
                Прочитать все
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>Нет уведомлений</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Subject */}
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4
                            className={`text-sm font-medium ${
                              !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                            }`}
                          >
                            {notification.subject}
                          </h4>
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></span>
                          )}
                        </div>

                        {/* Message */}
                        <p className="text-sm text-gray-600 mb-2">{notification.message}</p>

                        {/* Time */}
                        <p className="text-xs text-gray-500">
                          {format(parseISO(notification.createdAt), 'd MMM, HH:mm', {
                            locale: ru,
                          })}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-1">
                        {!notification.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                            title="Пометить как прочитанное"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}

                        {notification.actionUrl && (
                          <button
                            onClick={() => handleNotificationClick(notification)}
                            className="p-1 text-gray-600 hover:bg-gray-200 rounded"
                            title="Перейти"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                          title="Удалить"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200 text-center">
              <a
                href="/notifications"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                onClick={() => setIsOpen(false)}
              >
                Посмотреть все уведомления
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
