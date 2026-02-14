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

export interface ChatRoom {
  id: string;
  specialist?: {
    id: string;
    name: string;
    image: string | null;
    specialty: string;
  };
  client?: {
    id: string;
    name: string;
    avatar: string | null;
  };
  lastMessage: Message | null;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  chatRoomId: string;
  senderId: string;
  senderRole: 'CLIENT' | 'SPECIALIST' | 'ADMIN';
  text: string;
  attachments: string[];
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface SendMessagePayload {
  recipientId: string;
  text: string;
  attachments?: string[];
}

// ==================== Chat API Functions ====================

/**
 * Get all chat rooms for current user
 */
export const getChatRooms = async (): Promise<{ rooms: ChatRoom[] }> => {
  return apiRequest<{ rooms: ChatRoom[] }>('/chat/rooms');
};

/**
 * Get messages from a chat room
 */
export const getChatMessages = async (
  roomId: string,
  params?: {
    limit?: number;
    offset?: number;
  }
): Promise<{
  messages: Message[];
  total: number;
  limit: number;
  offset: number;
}> => {
  const query = new URLSearchParams();

  if (params?.limit) query.set('limit', params.limit.toString());
  if (params?.offset) query.set('offset', params.offset.toString());

  const queryString = query.toString();
  const endpoint = `/chat/rooms/${roomId}/messages${queryString ? `?${queryString}` : ''}`;

  return apiRequest(endpoint);
};

/**
 * Send a message
 */
export const sendMessage = async (
  payload: SendMessagePayload
): Promise<{
  message: string;
  data: Message;
}> => {
  return apiRequest('/chat/messages', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

/**
 * Mark message as read
 */
export const markMessageAsRead = async (
  messageId: string
): Promise<{
  message: string;
  data: Message;
}> => {
  return apiRequest(`/chat/messages/${messageId}/read`, {
    method: 'PUT',
  });
};

/**
 * Mark all messages in room as read
 */
export const markRoomMessagesAsRead = async (
  roomId: string
): Promise<{
  message: string;
  count: number;
}> => {
  return apiRequest(`/chat/rooms/${roomId}/read-all`, {
    method: 'PUT',
  });
};
