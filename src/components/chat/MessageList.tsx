import { useEffect, useRef } from 'react';
import { Check, CheckCheck } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Message } from '../../api/chat';

export interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  className?: string;
}

/**
 * MessageList - Scrollable chat message display
 *
 * Features:
 * - Auto-scroll to bottom on new messages
 * - Visual distinction for sent/received messages
 * - Read receipts (single/double check)
 * - Timestamp formatting
 * - Empty state
 */
export const MessageList = ({
  messages,
  currentUserId,
  className = '',
}: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const isSentByMe = (message: Message): boolean => {
    return message.senderId === currentUserId;
  };

  const formatMessageTime = (timestamp: string): string => {
    return format(parseISO(timestamp), 'HH:mm', { locale: ru });
  };

  const formatMessageDate = (timestamp: string): string => {
    return format(parseISO(timestamp), 'd MMM', { locale: ru });
  };

  const shouldShowDateDivider = (currentMsg: Message, prevMsg: Message | null): boolean => {
    if (!prevMsg) return true;

    const currentDate = new Date(currentMsg.createdAt).toDateString();
    const prevDate = new Date(prevMsg.createdAt).toDateString();

    return currentDate !== prevDate;
  };

  if (messages.length === 0) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center text-gray-500">
          <p className="text-lg mb-2">Нет сообщений</p>
          <p className="text-sm">Начните беседу, отправив первое сообщение</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`flex-1 overflow-y-auto px-4 py-4 space-y-4 ${className}`}
    >
      {messages.map((message, index) => {
        const prevMessage = index > 0 ? messages[index - 1] : null;
        const showDateDivider = shouldShowDateDivider(message, prevMessage);
        const sentByMe = isSentByMe(message);

        return (
          <div key={message.id}>
            {/* Date Divider */}
            {showDateDivider && (
              <div className="flex items-center justify-center my-4">
                <div className="px-3 py-1 bg-gray-200 rounded-full text-xs text-gray-600">
                  {formatMessageDate(message.createdAt)}
                </div>
              </div>
            )}

            {/* Message Bubble */}
            <div
              className={`flex ${sentByMe ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                  sentByMe
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                {/* Message Text */}
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.text}
                </p>

                {/* Message Footer: Time + Read Receipt */}
                <div
                  className={`flex items-center gap-1 mt-1 text-xs ${
                    sentByMe ? 'text-blue-100' : 'text-gray-500'
                  }`}
                >
                  <span>{formatMessageTime(message.createdAt)}</span>

                  {/* Read Receipt (only for sent messages) */}
                  {sentByMe && (
                    <span className="ml-1">
                      {message.isRead ? (
                        <CheckCheck className="w-3 h-3" />
                      ) : (
                        <Check className="w-3 h-3" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
};
