import { BadgeCheck, X } from 'lucide-react';

interface ToastProps {
  message: string;
  onClose: () => void;
}

export function Toast({ message, onClose }: ToastProps) {
  return (
    <div className="toast">
      <BadgeCheck size={18} />
      <span>{message}</span>
      <button onClick={onClose} title="Dong" type="button">
        <X size={16} />
      </button>
    </div>
  );
}
