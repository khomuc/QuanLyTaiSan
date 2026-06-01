import { BadgeCheck, X } from 'lucide-react';

interface ToastProps {
  message: string;
  onClose: () => void;
  type?: 'success' | 'error' | 'info';
}

export function Toast({ message, onClose, type = 'success' }: ToastProps) {
  if (!message) return null;

  return (
    <div className={`toast toast-${type}`}>
      <BadgeCheck size={18} />
      <span>{message}</span>
      <button onClick={onClose} title="Dong" type="button">
        <X size={16} />
      </button>
    </div>
  );
}
