import { useEffect } from 'react';
import {
  BadgeCheck,
  AlertCircle,
  Info,
  X,
} from 'lucide-react';

interface ToastProps {
  message: string;
  onClose: () => void;
  type?: 'success' | 'error' | 'info';
  duration?: number;
}

const toastIcons = {
  success: BadgeCheck,
  error: AlertCircle,
  info: Info,
};

export function Toast({
  message,
  onClose,
  type = 'success',
  duration = 3000,
}: ToastProps) {
  useEffect(() => {
    if (!message || duration <= 0) return;

    const timer = window.setTimeout(() => {
      onClose();
    }, duration);

    return () => {
      window.clearTimeout(timer);
    };
  }, [message, duration, onClose]);

  if (!message) return null;

  const Icon = toastIcons[type];

  return (
    <div
      className={`toast toast--${type}`}
      role="alert"
      aria-live="polite"
    >
      <div className="toast__icon">
        <Icon size={18} />
      </div>

      <span className="toast__message">{message}</span>

      <button
        className="toast__close"
        onClick={onClose}
        title="Đóng"
        aria-label="Đóng thông báo"
        type="button"
      >
        <X size={16} />
      </button>
    </div>
  );
}
