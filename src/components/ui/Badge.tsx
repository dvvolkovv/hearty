import { ReactNode } from 'react';
import { clsx } from 'clsx';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple' | 'gray';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

/**
 * Badge component - For status indicators and labels
 */
export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = ''
}: BadgeProps) => {
  const variantClasses: Record<BadgeVariant, string> = {
    default: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-sky-100 text-sky-800',
    purple: 'bg-purple-100 text-purple-800',
    gray: 'bg-gray-100 text-gray-800',
  };

  const sizeClasses: Record<BadgeSize, string> = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full font-medium',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  );
};
