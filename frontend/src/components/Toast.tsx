import { BadgeCheck, X } from 'lucide-react';

export function Toast({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  if (!message) return null;

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
