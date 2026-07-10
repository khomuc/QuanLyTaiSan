import type { LucideIcon } from 'lucide-react';

export function KpiTile({
  icon: Icon,
  label,
  onClick,
  value,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  value: number | string;
  tone: 'green' | 'amber' | 'red';
}) {
  const content = (
    <>
      <div className="kpi-icon">
        <Icon size={22} />
      </div>
      <span>{label}</span>
      <strong>{value}</strong>
    </>
  );

  if (onClick) {
    return (
      <button
        className={`kpi-tile ${tone} clickable`}
        onClick={onClick}
        title={`Mo ${label}`}
        type="button"
      >
        {content}
      </button>
    );
  }

  return <section className={`kpi-tile ${tone}`}>{content}</section>;
}

const STATUS_MAP: Record<string, string> = {
  cho_ky: 'Chờ duyệt',
  da_ky: 'Đã duyệt',
  tu_choi: 'Từ chối',
  hoat_dong: 'Hoạt động',
  bao_tri: 'Bảo trì',
  hong: 'Hỏng',
  queued: 'Đang xử lý',
  active: 'Hoạt động',
  inactive: 'Vô hiệu hóa',
  da_duyet: 'Đã phê duyệt',
  dang_luan_chuyen: 'Đang luân chuyển',
  dang_su_dung: 'Đang sử dụng'
};

export function StatusPill({ value }: { value?: string }) {
  if (!value) return <span className="status-pill unknown">...</span>;
  const normalized = value.toLowerCase();
  const displayText = STATUS_MAP[normalized] || value;
  return <span className={`status-pill ${normalized}`}>{displayText}</span>;
}

export function Toggle({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="toggle-row">
      <span>{label}</span>
      <button
        aria-pressed={checked}
        className={checked ? 'toggle on' : 'toggle'}
        onClick={() => onChange(!checked)}
        type="button"
      >
        <span />
      </button>
    </label>
  );
}

export function EmptyState({ text }: { text: string }) {
  return <div className="empty-state">{text}</div>;
}
