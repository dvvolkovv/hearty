import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

/**
 * Modal component - Dialog/overlay for forms and confirmations
 */
export const Modal = ({
  isOpen,
  onClose,
  children,
  size = 'md',
  className = ''
}: ModalProps) => {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={clsx(
            'relative bg-white rounded-lg shadow-xl w-full',
            sizeClasses[size],
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export interface ModalHeaderProps {
  children: ReactNode;
  onClose: () => void;
  className?: string;
}

export const ModalHeader = ({ children, onClose, className = '' }: ModalHeaderProps) => (
  <div className={clsx('flex items-center justify-between p-6 border-b border-gray-200', className)}>
    <h3 className="text-xl font-semibold text-gray-900">
      {children}
    </h3>
    <button
      onClick={onClose}
      className="text-gray-400 hover:text-gray-600 transition-colors"
    >
      <X className="w-6 h-6" />
    </button>
  </div>
);

export interface ModalBodyProps {
  children: ReactNode;
  className?: string;
}

export const ModalBody = ({ children, className = '' }: ModalBodyProps) => (
  <div className={clsx('p-6', className)}>
    {children}
  </div>
);

export interface ModalFooterProps {
  children: ReactNode;
  className?: string;
}

export const ModalFooter = ({ children, className = '' }: ModalFooterProps) => (
  <div className={clsx('flex items-center justify-end gap-3 p-6 border-t border-gray-200', className)}>
    {children}
  </div>
);
