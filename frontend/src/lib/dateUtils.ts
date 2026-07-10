/**
 * dateUtils.ts — Tiện ích định dạng ngày giờ chuẩn Tiếng Việt (UTC+7)
 */

/**
 * Hiển thị ngày theo định dạng DD/MM/YYYY.
 * Trả về '—' nếu không có dữ liệu.
 */
export function formatDate(raw?: string | Date | null): string {
  if (!raw) return '—';
  const d = new Date(raw as string);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh',
  });
}

/**
 * Hiển thị ngày giờ theo định dạng DD/MM/YYYY HH:MM.
 * Trả về '—' nếu không có dữ liệu.
 */
export function formatDateTime(raw?: string | Date | null): string {
  if (!raw) return '—';
  const d = new Date(raw as string);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh',
  });
}

/**
 * Trả về ngày hiện tại theo UTC+7 dưới dạng YYYY-MM-DD (dùng cho input type="date").
 */
export function todayVietnam(): string {
  const now = new Date(Date.now() + 7 * 60 * 60 * 1000);
  return now.toISOString().slice(0, 10);
}

/**
 * Trả về chuỗi tương đối ("Hôm nay", "Hôm qua", "3 ngày trước", ...).
 */
export function relativeDate(raw?: string | Date | null): string {
  if (!raw) return '—';
  const d = new Date(raw as string);
  if (isNaN(d.getTime())) return '—';
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays === 0) return 'Hôm nay';
  if (diffDays === 1) return 'Hôm qua';
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return formatDate(d);
}
