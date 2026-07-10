import { useEffect } from 'react';
import { BadgeCheck, AlertCircle, Info, X, ExternalLink } from 'lucide-react';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastData {
  message: string;
  type?: 'success' | 'error' | 'info';
  action?: ToastAction;
  duration?: number; // ms, 0 = no auto-close
}

interface ToastProps extends ToastData {
  onClose: () => void;
}

const ICONS = {
  success: <BadgeCheck size={18} />,
  error: <AlertCircle size={18} />,
  info: <Info size={18} />,
};

export function Toast({
  message,
  onClose,
  type = 'success',
  action,
  duration = 5000,
}: ToastProps) {
  useEffect(() => {
    if (!duration) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!message) return null;

  return (
    <div className={`toast toast-${type}`} style={{ maxWidth: '420px' }}>
      <span style={{ flexShrink: 0 }}>{ICONS[type]}</span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', lineHeight: '1.4' }}>{message}</span>
        {action && (
          <button
            onClick={() => { action.onClick(); onClose(); }}
            type="button"
            style={{
              marginTop: '6px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: type === 'success' ? '#a7f3d0' : '#fde68a',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
            }}
          >
            <ExternalLink size={13} />
            {action.label}
          </button>
        )}
      </div>

      {/* Progress bar */}
      {duration > 0 && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '3px',
          backgroundColor: 'rgba(255,255,255,0.35)',
          borderRadius: '0 0 8px 8px',
          animation: `toastProgress ${duration}ms linear forwards`,
          width: '100%',
        }} />
      )}

      <button
        onClick={onClose}
        title="Đóng"
        type="button"
        style={{ flexShrink: 0, alignSelf: 'flex-start' }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
