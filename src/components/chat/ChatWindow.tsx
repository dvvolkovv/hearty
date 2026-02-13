import { useState, useEffect } from 'react';
import { X, Loader } from 'lucide-react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { OnlineIndicator } from '../presence/OnlineIndicator';
import { useChat } from '../../hooks/useChat';
import { getChatMessages, sendMessage, ChatRoom } from '../../api/chat';
import toast from 'react-hot-toast';

export interface ChatWindowProps {
  room: ChatRoom;
  currentUserId: string;
  onClose?: () => void;
  className?: string;
}

/**
 * ChatWindow - Main chat interface component
 *
 * Features:
 * - Real-time messaging via WebSocket
 * - Load message history via REST API
 * - Typing indicators
 * - Online presence
 * - Auto-join/leave chat room
 * - Read receipts
 */
export const ChatWindow = ({
  room,
  currentUserId,
  onClose,
  className = '',
}: ChatWindowProps) => {
  const [loading, setLoading] = useState(true);
  const {
    messages,
    typingUsers,
    isJoined,
    connected,
    setTyping,
    markAsRead,
    setInitialMessages,
  } = useChat(room.id);

  // Get recipient info (specialist or client depending on user role)
  const recipient = room.specialist || room.client;
  const recipientId = recipient?.id || '';
  const recipientName = recipient?.name || 'Пользователь';
  const recipientImage = (recipient && 'image' in recipient ? recipient.image : recipient && 'avatar' in recipient ? recipient.avatar : null);

  // Load initial messages on mount
  useEffect(() => {
    const loadMessages = async () => {
      setLoading(true);
      try {
        const result = await getChatMessages(room.id, { limit: 50 });
        setInitialMessages(result.messages);
      } catch (error) {
        console.error('Failed to load messages:', error);
        toast.error('Не удалось загрузить сообщения');
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [room.id, setInitialMessages]);

  // Mark new messages as read
  useEffect(() => {
    if (messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];

    // If last message is from recipient and unread, mark as read
    if (
      lastMessage.senderId !== currentUserId &&
      !lastMessage.isRead
    ) {
      markAsRead(lastMessage.id);
    }
  }, [messages, currentUserId, markAsRead]);

  const handleSendMessage = async (text: string) => {
    try {
      // Send via REST API (will emit WebSocket event from backend)
      await sendMessage({
        recipientId,
        text,
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Не удалось отправить сообщение');
    }
  };

  const handleTyping = (isTyping: boolean) => {
    setTyping(isTyping);
  };

  const getTypingText = (): string | null => {
    if (typingUsers.length === 0) return null;

    const typingUser = typingUsers[0];
    return `${typingUser.userName} печатает...`;
  };

  return (
    <div className={`flex flex-col h-full bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          {recipientImage ? (
            <img
              src={recipientImage}
              alt={recipientName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
              {recipientName.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Name + Online Status */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {recipientName}
            </h3>
            <OnlineIndicator userId={recipientId} showLabel size="sm" />
          </div>
        </div>

        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            title="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <>
          {/* Messages */}
          <MessageList
            messages={messages}
            currentUserId={currentUserId}
            className="flex-1"
          />

          {/* Typing Indicator */}
          {getTypingText() && (
            <div className="px-4 py-2 text-sm text-gray-500 italic">
              {getTypingText()}
            </div>
          )}

          {/* Message Input */}
          <MessageInput
            onSendMessage={handleSendMessage}
            onTyping={handleTyping}
            disabled={!connected || !isJoined}
            placeholder={
              !connected
                ? 'Подключение...'
                : !isJoined
                ? 'Присоединение к чату...'
                : 'Введите сообщение...'
            }
          />
        </>
      )}

      {/* Connection Status Warning */}
      {!connected && (
        <div className="absolute bottom-0 left-0 right-0 bg-yellow-100 text-yellow-800 px-4 py-2 text-sm text-center">
          Соединение потеряно. Переподключение...
        </div>
      )}
    </div>
  );
};
