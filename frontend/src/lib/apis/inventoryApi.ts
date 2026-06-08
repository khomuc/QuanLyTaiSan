const API_BASE_URL = 'http://localhost:3000/api';

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new Error(
      data?.message || data?.error || 'Có lỗi xảy ra khi gọi API',
    );
  }

  return data as T;
}

export const inventoryApi = {
  getAll() {
    return request<any[]>('/inventory');
  },

  create(data: {
    ngayKiemKe: string;
    namKiemKe: number;
    nguoiLap: string;
    ghiChu?: string;
  }) {
    return request<any>('/inventory', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  remove(maKiemKe: string) {
    return request<any>(`/inventory/${maKiemKe}`, {
      method: 'DELETE',
    });
  },

  getOne(maKiemKe: string) {
    return request<any>(`/inventory/${maKiemKe}`);
  },

  getAssets(maKiemKe: string) {
    return request<any[]>(`/inventory/${maKiemKe}/assets`);
  },

  scanAsset(maTaiSan: string) {
    return request<any>(`/inventory/scan/${maTaiSan}`);
  },

  scanUpdate(data: {
    maKiemKe: string;
    maTaiSan: string;
    tinhTrangThucTe: string;
    viTriHienTai: string;
  }) {
    return request<any>('/inventory/scan', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getProgress(maKiemKe: string) {
    return request<any>(`/inventory/${maKiemKe}/progress`);
  },

  getMissingAssets(maKiemKe: string) {
    return request<any[]>(`/inventory/${maKiemKe}/missing`);
  },

  getSummary(maKiemKe: string) {
    return request<any>(`/inventory/${maKiemKe}/summary`);
  },

  getScannedAssets(maKiemKe: string) {
    return request<any[]>(`/inventory/${maKiemKe}/scanned-assets`);
  },

  scanAssetInInventory(
    maKiemKe: string,
    maTaiSan: string,
  ) {
    return request<any>(
      `/inventory/${maKiemKe}/scan/${maTaiSan}`,
    );
  },

  getDepartments() {
    return request<any[]>('/inventory/lookups/departments');
  },

  scanQrUrlInInventory(
    maKiemKe: string,
    qrText: string,
  ) {
    return request<any>(`/inventory/${maKiemKe}/scan-url`, {
      method: 'POST',
      body: JSON.stringify({ qrText }),
    });
  },

  updateScannedAsset(data: {
    maKiemKe: string;
    maTaiSan: string;
    haoMonLuyKe: string;
    viTriHienTai: string;
    ghiChu?: string;
  }) {
    return request<any>('/inventory/scan', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getReport(maKiemKe: string) {
    return request<any>(`/inventory/${maKiemKe}/report`);
  },

  completeInventory(maKiemKe: string) {
    return request<any>(`/inventory/${maKiemKe}/complete`, {
      method: 'POST',
    });
  },
};
