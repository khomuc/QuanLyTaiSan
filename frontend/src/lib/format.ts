import type { Asset } from './types';

export function formatDate(value: string | null) {
  if (!value) return '';
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    currency: 'VND',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(value);
}

export function toDepreciationPercent(asset: Asset) {
  if (!asset.nguyenGia) return 0;
  return Number(((asset.haoMonLuyKe / asset.nguyenGia) * 100).toFixed(2));
}

export function formatCurrencyShort(value: number) {
  if (value >= 1_000_000_000) {
    return `${Math.round(value / 1_000_000_000)} ty`;
  }
  if (value >= 1_000_000) {
    return `${Math.round(value / 1_000_000)} tr`;
  }
  return formatCurrency(value);
}
