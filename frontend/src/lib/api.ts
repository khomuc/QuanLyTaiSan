import type {
  ApprovalItem,
  AssetCategory,
  AssetList,
  AuditLogList,
  AuthUser,
  DashboardOverview,
  Department,
  Employee,
  EmployeeList,
  LoginResult,
  NotificationItem,
  Permission,
  ProfileUpdatePayload,
  Role,
  SystemSettings,
} from './types';

const API_BASE = '/api';
const TOKEN_KEY = 'qlts_access_token';
const REFRESH_TOKEN_KEY = 'qlts_refresh_token';

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getStoredRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setStoredRefreshToken(token: string) {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function clearStoredRefreshToken() {
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

// ── Refresh token rotation state ────────────────────────────────────────────
let isRefreshing = false;
let refreshQueue: Array<(newAccessToken: string) => void> = [];

async function doRefresh(): Promise<string> {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) throw new Error('No refresh token');

  const response = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) throw new Error('Refresh failed');

  const data = (await response.json()) as {
    accessToken: string;
    refreshToken: string;
  };

  setStoredToken(data.accessToken);
  setStoredRefreshToken(data.refreshToken);
  return data.accessToken;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token = getStoredToken(),
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  // ── Auto-refresh on 401 ────────────────────────────────────────────────────
  if (
    response.status === 401 &&
    path !== '/auth/login' &&
    path !== '/auth/refresh' &&
    token !== 'demo-token'
  ) {
    if (isRefreshing) {
      // Queue this request until the ongoing refresh finishes
      return new Promise<T>((resolve, reject) => {
        refreshQueue.push((newToken) => {
          request<T>(path, options, newToken).then(resolve).catch(reject);
        });
      });
    }

    isRefreshing = true;
    try {
      const newAccessToken = await doRefresh();
      refreshQueue.forEach((cb) => cb(newAccessToken));
      refreshQueue = [];
      return request<T>(path, options, newAccessToken);
    } catch {
      // Refresh failed — clear everything and force re-login
      clearStoredToken();
      clearStoredRefreshToken();
      window.location.href = '/';
      throw new Error('Session expired. Please log in again.');
    } finally {
      isRefreshing = false;
    }
  }
  // ──────────────────────────────────────────────────────────────────────────

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
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

  refresh(refreshToken: string) {
    return request<{ accessToken: string; refreshToken: string; tokenType: string }>(
      '/auth/refresh',
      {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      },
      null,
    );
  },

  logout(refreshToken: string) {
    return request<{ message: string }>('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },

  me() {
    return request<AuthUser>('/auth/me');
  },

  updateProfile(payload: ProfileUpdatePayload) {
    return request<AuthUser>('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  profileDepartments() {
    return request<Department[]>('/auth/departments');
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

  overrideEmployeePermissions(maNhanVien: string, maQuyen: string[]) {
    return request<{ message: string }>(
      `/employees/${encodeURIComponent(maNhanVien)}/permissions`,
      {
        method: 'PUT',
        body: JSON.stringify({ maQuyen }),
      },
    );
  },

  getEmployeePermissions(maNhanVien: string) {
    return request<{ maNhanVien: string; permissions: string[]; hasOverride: boolean }>(
      `/employees/${encodeURIComponent(maNhanVien)}/permissions`,
    );
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

  listTransferSlips() {
    return request<any[]>('/transfer/slips');
  },

  getTransferSlip(soPhieu: string) {
    return request<any>(`/transfer/slips/${encodeURIComponent(soPhieu)}`);
  },

  transferHistory() {
    return request<any>('/transfer/reports/history');
  },

  reportsAssets() {
    return request<any>('/reports/assets');
  },

  reportsTransfers(filters?: { tuNgay?: string; denNgay?: string; maPhongBan?: string }) {
    const params = new URLSearchParams();
    if (filters?.tuNgay) params.append('tuNgay', filters.tuNgay);
    if (filters?.denNgay) params.append('denNgay', filters.denNgay);
    if (filters?.maPhongBan) params.append('maPhongBan', filters.maPhongBan);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<any>(`/reports/transfers${query}`);
  },

  reportsInventory() {
    return request<any>('/reports/inventory');
  },

  createTransferSlip(payload: any) {
    return request<any>('/transfer/slips', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  confirmReceiptTransferSlip(soPhieu: string, payload: any) {
    return request<any>(`/transfer/slips/${encodeURIComponent(soPhieu)}/confirm-receipt`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
