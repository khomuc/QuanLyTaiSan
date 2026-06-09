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
  headers.set('Content-Type', 'application/json');

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

  overrideEmployeePermissions(maNhanVien: string, maQuyen: string[]) {
    return request<{ message: string; count: number }>(
      `/employees/${encodeURIComponent(maNhanVien)}/permissions`,
      {
        method: 'PUT',
        body: JSON.stringify({ maQuyen }),
      },
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
