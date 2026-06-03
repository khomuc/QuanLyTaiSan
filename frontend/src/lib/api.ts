import type {
  ApprovalItem,
  Asset,
  AssetCategory,
  AssetList,
  AssetReport,
  AuditLogList,
  AuthUser,
  DashboardOverview,
  Department,
  Employee,
  EmployeeList,
  LoginResult,
  NotificationItem,
  Permission,
  Role,
  SystemSettings,
} from './types';

const API_BASE = '/api';
const TOKEN_KEY = 'qlts_access_token';

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
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

export const api = {
  login(email: string, matKhau: string) {
    return request<LoginResult>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, matKhau }),
      },
      null,
    );
  },

  me() {
    return request<AuthUser>('/auth/me');
  },

  changePassword(matKhauCu: string, matKhauMoi: string) {
    return request<{ message: string }>('/auth/password', {
      method: 'PATCH',
      body: JSON.stringify({ matKhauCu, matKhauMoi }),
    });
  },

  dashboard() {
    return request<DashboardOverview>('/dashboard/overview');
  },

  assets(filters: {
    search?: string;
    maLoai?: string;
    maPhongBan?: string;
    trangThai?: string;
  } = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    const query = params.toString() ? `?${params.toString()}` : '';
    return request<AssetList>(`/assets${query}`);
  },

  assetCategories() {
    return request<AssetCategory[]>('/assets/meta/categories');
  },

  assetReport(filters: {
    search?: string;
    maLoai?: string;
    maPhongBan?: string;
    trangThai?: string;
  } = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    const query = params.toString() ? `?${params.toString()}` : '';
    return request<AssetReport>(`/assets/report${query}`);
  },

  assetHistory(maTaiSan: string) {
    return request<
      Array<{
        maLog: number;
        maNhanVien: string | null;
        hoTen: string | null;
        thoiGian: string;
        hanhDong: string;
        trangThai: string | null;
        chiTiet: string | null;
      }>
    >(`/assets/history/${encodeURIComponent(maTaiSan)}`);
  },

  createAsset(payload: Partial<Asset> & { maTaiSan: string; tenTaiSan: string }) {
    return request<Asset>('/assets', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateAsset(maTaiSan: string, payload: Partial<Asset>) {
    return request<Asset>(`/assets/${encodeURIComponent(maTaiSan)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  deleteAsset(maTaiSan: string) {
    return request<{ message: string }>(
      `/assets/${encodeURIComponent(maTaiSan)}`,
      { method: 'DELETE' },
    );
  },

  finalizeAsset(maTaiSan: string) {
    return request<{ message: string }>(
      `/assets/${encodeURIComponent(maTaiSan)}/finalize`,
      { method: 'DELETE' },
    );
  },

  assetImportTemplate() {
    return requestBlob('/assets/import-template');
  },

  exportAssets(filters: {
    search?: string;
    maLoai?: string;
    maPhongBan?: string;
    trangThai?: string;
  } = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    const query = params.toString() ? `?${params.toString()}` : '';
    return requestBlob(`/assets/export${query}`);
  },

  importAssets(file: File) {
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

  employees(search = '') {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return request<EmployeeList>(`/employees${query}`);
  },

  departments() {
    return request<Department[]>('/employees/meta/departments');
  },

  createEmployee(payload: Partial<Employee> & { matKhau: string }) {
    return request<Employee>('/employees', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateEmployee(maNhanVien: string, payload: Partial<Employee>) {
    return request<Employee>(`/employees/${encodeURIComponent(maNhanVien)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  deleteEmployee(maNhanVien: string) {
    return request<{ message: string }>(
      `/employees/${encodeURIComponent(maNhanVien)}`,
      { method: 'DELETE' },
    );
  },

  roles() {
    return request<Role[]>('/roles');
  },

  permissions() {
    return request<Permission[]>('/roles/permissions');
  },

  createRole(payload: Partial<Role> & { maQuyen?: string[] }) {
    return request<Role>('/roles', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateRole(maVaiTro: string, payload: Partial<Role> & { maQuyen?: string[] }) {
    return request<Role>(`/roles/${encodeURIComponent(maVaiTro)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  assignPermissions(maVaiTro: string, maQuyen: string[]) {
    return request<Role>(`/roles/${encodeURIComponent(maVaiTro)}/permissions`, {
      method: 'PUT',
      body: JSON.stringify({ maQuyen }),
    });
  },

  approvals() {
    return request<ApprovalItem[]>('/approvals/pending');
  },

  signApproval(item: ApprovalItem, trangThaiKy: 'DA_KY' | 'TU_CHOI') {
    const path =
      item.loaiPhieu === 'TRANSFER'
        ? `/approvals/transfer/${encodeURIComponent(item.maPhieu)}/sign`
        : `/approvals/inventory/${encodeURIComponent(item.maPhieu)}/sign`;

    return request<{ message: string }>(path, {
      method: 'POST',
      body: JSON.stringify({
        trangThaiKy,
        lyDoTuChoi:
          trangThaiKy === 'TU_CHOI' ? 'Tu choi tu giao dien frontend' : undefined,
      }),
    });
  },

  notifications() {
    return request<NotificationItem[]>('/notifications');
  },

  settings() {
    return request<SystemSettings>('/settings');
  },

  updateSettings(payload: Partial<SystemSettings>) {
    return request<SystemSettings>('/settings', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  auditLogs(search = '') {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return request<AuditLogList>(`/audit-logs${query}`);
  },
};
