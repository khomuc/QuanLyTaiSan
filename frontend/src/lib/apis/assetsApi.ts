import { getStoredToken } from '../api';
import type {
  Asset,
  AssetCategory,
  AssetHistoryItem,
  AssetList,
  AssetReport,
} from '../types';

const API_BASE = '/api';

interface AssetFilters {
  search?: string;
  maLoai?: string;
  maPhongBan?: string;
  trangThai?: string;
  page?: number;
  limit?: number;
}

function buildAssetQuery(filters: AssetFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });

  const query = params.toString();
  return query ? `?${query}` : '';
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token = getStoredToken(),
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

async function requestBlob(path: string, token = getStoredToken()) {
  const headers = new Headers();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, { headers });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `HTTP ${response.status}`);
  }

  return response.blob();
}

export const assetsApi = {
  list(filters: AssetFilters = {}) {
    return request<AssetList>(`/assets${buildAssetQuery(filters)}`);
  },

  categories() {
    return request<AssetCategory[]>('/assets/meta/categories');
  },

  lookup(code: string) {
    return request<Asset>(`/assets/lookup/${encodeURIComponent(code)}`);
  },

  report(filters: AssetFilters = {}) {
    return request<AssetReport>(`/assets/report${buildAssetQuery(filters)}`);
  },

  history(maTaiSan: string) {
    return request<AssetHistoryItem[]>(
      `/assets/history/${encodeURIComponent(maTaiSan)}`,
    );
  },

  create(payload: Partial<Asset> & { maTaiSan: string; tenTaiSan: string }) {
    return request<Asset>('/assets', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  update(maTaiSan: string, payload: Partial<Asset>) {
    return request<Asset>(`/assets/${encodeURIComponent(maTaiSan)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  liquidate(maTaiSan: string) {
    return request<{ message: string }>(
      `/assets/${encodeURIComponent(maTaiSan)}`,
      { method: 'DELETE' },
    );
  },

  finalize(maTaiSan: string) {
    return request<{ message: string }>(
      `/assets/${encodeURIComponent(maTaiSan)}/finalize`,
      { method: 'DELETE' },
    );
  },

  importTemplate() {
    return requestBlob('/assets/import-template');
  },

  exportExcel(filters: AssetFilters = {}) {
    return requestBlob(`/assets/export${buildAssetQuery(filters)}`);
  },

  importExcel(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return request<{
      message: string;
      success: number;
      failed: number;
      errors: Array<{ row: number; message: string }>;
    }>('/assets/import', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  },
};
