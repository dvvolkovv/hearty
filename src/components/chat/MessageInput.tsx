import { useState, useRef, KeyboardEvent, ChangeEvent } from 'react';
import { Send } from 'lucide-react';

export interface MessageInputProps {
  onSendMessage: (text: string) => void;
  onTyping?: (isTyping: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

/**
 * MessageInput - Text input for sending chat messages
 *
 * Features:
 * - Send on Enter (Shift+Enter for new line)
 * - Send button
 * - Typing indicator integration
 * - Auto-resize textarea
 * - Disabled state
 */
export const MessageInput = ({
  onSendMessage,
  onTyping,
  disabled = false,
  placeholder = 'Введите сообщение...',
  className = '',
}: MessageInputProps) => {
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }

    // Typing indicator
    if (onTyping && newText.length > 0) {
      if (!isTyping) {
        setIsTyping(true);
        onTyping(true);
      }

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        onTyping(false);
      }, 2000);
    }
  };

  const handleSend = () => {
    const trimmedText = text.trim();

    if (trimmedText.length === 0) return;

    onSendMessage(trimmedText);
    setText('');

    // Stop typing indicator
    if (isTyping && onTyping) {
      setIsTyping(false);
      onTyping(false);
    }

    // Clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`flex items-end gap-2 p-4 border-t border-gray-200 bg-white ${className}`}>
      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        rows={1}
        className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed max-h-32 overflow-y-auto"
      />

      {/* Send Button */}
      <button
        onClick={handleSend}
        disabled={disabled || text.trim().length === 0}
        className="flex items-center justify-center w-10 h-10 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex-shrink-0"
        title="Отправить"
      >
        <Send className="w-5 h-5" />
      </button>
    </div>
  );
};
