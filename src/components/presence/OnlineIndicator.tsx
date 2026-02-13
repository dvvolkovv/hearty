import { usePresence, PresenceStatus } from '../../hooks/usePresence';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export interface OnlineIndicatorProps {
  userId: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * OnlineIndicator - Shows user online/offline/away status
 *
 * Features:
 * - Real-time presence updates
 * - Color-coded status (green/gray/yellow)
 * - Optional label
 * - Last seen timestamp
 */
export const OnlineIndicator = ({
  userId,
  showLabel = false,
  size = 'md',
  className = '',
}: OnlineIndicatorProps) => {
  const { userStatus } = usePresence(userId);

  const getStatusColor = (status: PresenceStatus): string => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusLabel = (status: PresenceStatus): string => {
    switch (status) {
      case 'online':
        return 'Онлайн';
      case 'away':
        return 'Отошёл';
      case 'offline':
        return 'Оффлайн';
      default:
        return 'Неизвестно';
    }
  };

  const getSizeClass = (s: string): string => {
    switch (s) {
      case 'sm':
        return 'w-2 h-2';
      case 'md':
        return 'w-3 h-3';
      case 'lg':
        return 'w-4 h-4';
      default:
        return 'w-3 h-3';
    }
  };

  const getLastSeenText = (): string | null => {
    if (!userStatus.lastSeen || userStatus.status === 'online') {
      return null;
    }

    return `Был в сети ${format(userStatus.lastSeen, 'd MMM, HH:mm', { locale: ru })}`;
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Status Dot */}
      <span
        className={`${getSizeClass(size)} ${getStatusColor(
          userStatus.status
        )} rounded-full flex-shrink-0 ${
          userStatus.status === 'online' ? 'animate-pulse' : ''
        }`}
        title={getStatusLabel(userStatus.status)}
      ></span>

      {/* Label */}
      {showLabel && (
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-gray-700">
            {getStatusLabel(userStatus.status)}
          </span>
          {getLastSeenText() && (
            <span className="text-xs text-gray-500">{getLastSeenText()}</span>
          )}
        </div>
      )}
    </div>
  );
};
