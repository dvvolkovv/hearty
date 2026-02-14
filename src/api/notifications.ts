const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Helper function to make authenticated API requests
 */
const apiRequest = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
};

// ==================== TypeScript Interfaces ====================

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

export interface NotificationsPaginationResponse {
  data: Notification[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// ==================== Notifications API Functions ====================

/**
 * Get notifications
 */
export const getNotifications = async (params?: {
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
}): Promise<NotificationsPaginationResponse> => {
  const query = new URLSearchParams();

  if (params?.limit) query.set('limit', params.limit.toString());
  if (params?.offset) query.set('offset', params.offset.toString());
  if (params?.unreadOnly) query.set('unreadOnly', params.unreadOnly.toString());

  const queryString = query.toString();
  const endpoint = `/notifications${queryString ? `?${queryString}` : ''}`;

  return apiRequest(endpoint);
};

/**
 * Get unread notifications count
 */
export const getUnreadCount = async (): Promise<{
  data: { count: number };
}> => {
  return apiRequest('/notifications/unread-count');
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (
  notificationId: string
): Promise<{
  message: string;
  data: Notification;
}> => {
  return apiRequest(`/notifications/${notificationId}/read`, {
    method: 'PUT',
  });
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (): Promise<{
  message: string;
  data: { count: number };
}> => {
  return apiRequest('/notifications/read-all', {
    method: 'PUT',
  });
};

/**
 * Delete notification
 */
export const deleteNotification = async (
  notificationId: string
): Promise<{
  message: string;
  data: { id: string };
}> => {
  return apiRequest(`/notifications/${notificationId}`, {
    method: 'DELETE',
  });
};

/**
 * Delete all read notifications
 */
export const deleteAllReadNotifications = async (): Promise<{
  message: string;
  data: { count: number };
}> => {
  return apiRequest('/notifications/read/all', {
    method: 'DELETE',
  });
};
