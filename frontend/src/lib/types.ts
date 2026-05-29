export type ViewKey =
  | 'dashboard'
  | 'assets'
  | 'employees'
  | 'roles'
  | 'approvals'
  | 'notifications'
  | 'settings'
  | 'audit'
  | 'profile';

export interface AuthUser {
  maNhanVien: string;
  hoTen: string;
  email: string;
  maVaiTro: string;
  permissions: string[];
}

export interface LoginResult {
  accessToken: string;
  tokenType: string;
  user: AuthUser;
}

export interface Employee {
  maNhanVien: string;
  hoTen: string;
  chucVu: string | null;
  email: string;
  soDienThoai: string | null;
  maPhongBan: string;
  tenPhongBan: string | null;
  maVaiTro: string;
  tenVaiTro: string | null;
  trangThai: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
  updatedAt?: string;
}

export interface EmployeeList {
  data: Employee[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Department {
  maPhongBan: string;
  tenPhongBan: string;
}

export interface Asset {
  maTaiSan: string;
  maQR: string | null;
  tenTaiSan: string;
  serial: string | null;
  model: string | null;
  maLoai: string;
  tenLoai: string | null;
  nguyenGia: number;
  haoMonLuyKe: number;
  giaTriConLai: number;
  ngayNhap: string;
  maPhongBanHienTai: string;
  tenPhongBan: string | null;
  trangThai: 'HOAT_DONG' | 'BAO_TRI' | 'HONG';
  soHieuTSCD: string | null;
  ghiChu: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AssetList {
  data: Asset[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AssetCategory {
  maLoai: string;
  tenLoai: string;
  moTa: string | null;
}

export interface Role {
  maVaiTro: string;
  tenVaiTro: string;
  moTa: string | null;
  permissions: string[];
}

export interface Permission {
  maQuyen: string;
  tenQuyen: string;
  moTa: string | null;
  module: string | null;
}

export interface DashboardOverview {
  employees: {
    total: number;
    byStatus: Array<{ name: string; total: number }>;
  };
  assets: {
    total: number;
    byStatus: Array<{ name: string; total: number }>;
  };
  approvals: {
    pendingTransfers: number;
    pendingInventories: number;
    totalPending: number;
  };
  recentLogs: AuditLog[];
}

export interface ApprovalItem {
  loaiPhieu: 'TRANSFER' | 'INVENTORY';
  maPhieu: string;
  ngay: string | null;
  trangThaiPhieu: string;
  nguoiLap: string;
  vongKy: number;
  tenVaiTro: string | null;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  type: 'TRANSFER' | 'INVENTORY';
  documentId: string;
  documentDate: string | null;
  status: string;
  createdAt: string;
  message: string;
}

export interface SystemSettings {
  appName: string;
  jwtExpiresIn: string;
  emailNotificationsEnabled: boolean;
  inAppNotificationsEnabled: boolean;
  database?: {
    host: string;
    name: string;
  };
  security?: {
    jwtExpiresIn: string;
  };
  modules?: string[];
}

export interface AuditLog {
  maLog: number;
  maNhanVien: string | null;
  hoTen: string | null;
  thoiGian: string;
  hanhDong: string;
  doiTuong: string | null;
  doiTuongId: string | null;
  trangThai: string | null;
  chiTiet?: string | null;
  ipAddress?: string | null;
}

export interface AuditLogList {
  data: AuditLog[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
