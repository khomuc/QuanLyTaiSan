import type {
  ApprovalItem,
  Asset,
  AssetCategory,
  AssetList,
  AuditLogList,
  AuthUser,
  DashboardOverview,
  Department,
  Employee,
  EmployeeList,
  NotificationItem,
  Permission,
  Role,
  SystemSettings,
} from './types';

export const demoUser: AuthUser = {
  maNhanVien: 'B2204960',
  hoTen: 'Nguyen Thi Huynh Nhu',
  chucVu: 'System Lead',
  email: 'nhu.system@qlts.local',
  soDienThoai: '0900000001',
  maPhongBan: 'PB06',
  tenPhongBan: 'Phong To chuc hanh chinh',
  maVaiTro: 'ADMIN',
  tenVaiTro: 'Quan tri vien',
  trangThai: 'ACTIVE',
  permissions: [
    'ASSET_VIEW',
    'STAFF_VIEW',
    'STAFF_CREATE',
    'STAFF_EDIT',
    'STAFF_DELETE',
    'ROLE_MANAGE',
    'TRANSFER_APPROVE',
    'INVENTORY_APPROVE',
    'CONFIG_SYSTEM',
    'AUDIT_VIEW',
  ],
};

export const guestUser: AuthUser = {
  maNhanVien: 'GUEST',
  hoTen: 'Khách truy cập',
  chucVu: 'Guest Viewer',
  email: 'guest@qlts.local',
  soDienThoai: null,
  maPhongBan: 'PB00',
  tenPhongBan: 'Khách',
  maVaiTro: 'GUEST',
  tenVaiTro: 'Khách',
  trangThai: 'ACTIVE',
  permissions: [
    'ASSET_VIEW',
    'INVENTORY_VIEW',
    'INVENTORY_MANAGE',
    'INVENTORY_SCAN',
  ],
};

export const departments: Department[] = [
  { maPhongBan: 'PB01', tenPhongBan: 'Ban Giam hieu' },
  { maPhongBan: 'PB05', tenPhongBan: 'Phong Quan ly dao tao' },
  { maPhongBan: 'PB06', tenPhongBan: 'Phong To chuc hanh chinh' },
];

export const assetCategories: AssetCategory[] = [
  { maLoai: 'LT001', tenLoai: 'Thiet bi van phong', moTa: null },
  { maLoai: 'LT003', tenLoai: 'Thiet bi hoc tap', moTa: null },
];

export const assets: Asset[] = [
  {
    maTaiSan: 'TS0001',
    maQR: 'QR-TS-0001',
    tenTaiSan: 'May tinh xach tay Dell Latitude 7420',
    serial: 'DL7420-001',
    model: 'Latitude 7420',
    maLoai: 'LT001',
    tenLoai: 'Thiet bi van phong',
    nguyenGia: 32000000,
    haoMonLuyKe: 8000000,
    giaTriConLai: 24000000,
    ngayNhap: '2025-01-10',
    maPhongBanHienTai: 'PB01',
    tenPhongBan: 'Ban Giam hieu',
    trangThai: 'HOAT_DONG',
    soHieuTSCD: 'TSCD-0001',
    ghiChu: 'Tai san mau cho quet QR',
  },
  {
    maTaiSan: 'TS0002',
    maQR: 'QR-TS-0002',
    tenTaiSan: 'May chieu Epson EB-X06',
    serial: 'EPX06-002',
    model: 'EB-X06',
    maLoai: 'LT003',
    tenLoai: 'Thiet bi hoc tap',
    nguyenGia: 15000000,
    haoMonLuyKe: 3000000,
    giaTriConLai: 12000000,
    ngayNhap: '2025-01-10',
    maPhongBanHienTai: 'PB02',
    tenPhongBan: 'Khoa Ly luan co so',
    trangThai: 'HOAT_DONG',
    soHieuTSCD: 'TSCD-0002',
    ghiChu: 'Tai san mau cho quet QR',
  },
];

export const assetList: AssetList = {
  data: assets,
  meta: { page: 1, limit: 20, total: assets.length, totalPages: 1 },
};

export const employees: Employee[] = [
  {
    maNhanVien: 'B2204960',
    hoTen: 'Nguyen Thi Huynh Nhu',
    chucVu: 'System Lead',
    email: 'nhu.system@qlts.local',
    soDienThoai: '0900000001',
    maPhongBan: 'PB06',
    tenPhongBan: 'Phong To chuc hanh chinh',
    maVaiTro: 'ADMIN',
    tenVaiTro: 'Quan tri vien',
    trangThai: 'ACTIVE',
  },
  {
    maNhanVien: 'NV002',
    hoTen: 'Tran Minh Quan',
    chucVu: 'Nhan vien kiem ke',
    email: 'quan@qlts.local',
    soDienThoai: '0900000002',
    maPhongBan: 'PB05',
    tenPhongBan: 'Phong Quan ly dao tao',
    maVaiTro: 'NHAN_VIEN',
    tenVaiTro: 'Nhan vien',
    trangThai: 'ACTIVE',
  },
  {
    maNhanVien: 'NV003',
    hoTen: 'Le Bao Chau',
    chucVu: 'Khach xem bao cao',
    email: 'chau@qlts.local',
    soDienThoai: null,
    maPhongBan: 'PB01',
    tenPhongBan: 'Ban Giam hieu',
    maVaiTro: 'GUEST',
    tenVaiTro: 'Khach',
    trangThai: 'INACTIVE',
  },
  {
    maNhanVien: 'GUEST',
    hoTen: 'Khách truy cập',
    chucVu: 'Guest Viewer',
    email: 'guest@qlts.local',
    soDienThoai: null,
    maPhongBan: 'PB00',
    tenPhongBan: 'Khách',
    maVaiTro: 'GUEST',
    tenVaiTro: 'Khách',
    trangThai: 'ACTIVE',
  },
];

export const permissions: Permission[] = [
  {
    maQuyen: 'STAFF_VIEW',
    tenQuyen: 'Xem nhan vien',
    moTa: 'Xem danh sach nhan vien',
    module: 'STAFF',
  },
  {
    maQuyen: 'STAFF_CREATE',
    tenQuyen: 'Tao nhan vien',
    moTa: 'Them nhan vien moi',
    module: 'STAFF',
  },
  {
    maQuyen: 'STAFF_EDIT',
    tenQuyen: 'Sua nhan vien',
    moTa: 'Cap nhat thong tin nhan vien',
    module: 'STAFF',
  },
  {
    maQuyen: 'STAFF_DELETE',
    tenQuyen: 'Khoa nhan vien',
    moTa: 'Ngung hoat dong tai khoan',
    module: 'STAFF',
  },
  {
    maQuyen: 'ROLE_MANAGE',
    tenQuyen: 'Quan ly vai tro',
    moTa: 'Gan vai tro va quyen',
    module: 'ADMIN',
  },
  {
    maQuyen: 'AUDIT_VIEW',
    tenQuyen: 'Xem log',
    moTa: 'Theo doi log he thong',
    module: 'ADMIN',
  },
  {
    maQuyen: 'CONFIG_SYSTEM',
    tenQuyen: 'Cau hinh he thong',
    moTa: 'Cap nhat cau hinh runtime',
    module: 'ADMIN',
  },
  {
    maQuyen: 'TRANSFER_APPROVE',
    tenQuyen: 'Duyet dieu chuyen',
    moTa: 'Ky duyet phieu dieu chuyen',
    module: 'TRANSFER',
  },
  {
    maQuyen: 'INVENTORY_APPROVE',
    tenQuyen: 'Duyet kiem ke',
    moTa: 'Ky duyet phieu kiem ke',
    module: 'INVENTORY',
  },
  {
    maQuyen: 'ASSET_VIEW',
    tenQuyen: 'Xem tài sản',
    moTa: 'Xem danh sách và chi tiết tài sản',
    module: 'ASSET',
  },
  {
    maQuyen: 'INVENTORY_VIEW',
    tenQuyen: 'Xem kiểm kê',
    moTa: 'Xem danh sách và chi tiết kiểm kê',
    module: 'INVENTORY',
  },
  {
    maQuyen: 'INVENTORY_CREATE',
    tenQuyen: 'Tạo kiểm kê',
    moTa: 'Tạo đợt kiểm kê mới',
    module: 'INVENTORY',
  },
  {
    maQuyen: 'INVENTORY_DELETE',
    tenQuyen: 'Xóa kiểm kê',
    moTa: 'Xóa đợt kiểm kê',
    module: 'INVENTORY',
  },
  {
    maQuyen: 'INVENTORY_SCAN',
    tenQuyen: 'Quét kiểm kê',
    moTa: 'Thực hiện quét tài sản trong đợt kiểm kê',
    module: 'INVENTORY',
  },
  {
    maQuyen: 'INVENTORY_MANAGE',
    tenQuyen: 'Quản lý kiểm kê',
    moTa: 'Toàn quyền quản lý kiểm kê',
    module: 'INVENTORY',
  },
];

export const roles: Role[] = [
  {
    maVaiTro: 'ADMIN',
    tenVaiTro: 'Quan tri vien',
    moTa: 'Quan ly toan bo he thong',
    permissions: permissions.map((permission) => permission.maQuyen),
  },
  {
    maVaiTro: 'NHAN_VIEN',
    tenVaiTro: 'Nhan vien',
    moTa: 'Thuc hien nghiep vu tai san',
    permissions: ['STAFF_VIEW'],
  },
  {
    maVaiTro: 'GUEST',
    tenVaiTro: 'Khách',
    moTa: 'Chỉ xem thông tin cơ bản',
    permissions: ['ASSET_VIEW', 'INVENTORY_VIEW'],
  },
];

export const dashboard: DashboardOverview = {
  employees: {
    total: employees.length,
    byStatus: [
      { name: 'ACTIVE', total: 2 },
      { name: 'INACTIVE', total: 1 },
    ],
  },
  assets: {
    total: 128,
    byStatus: [
      { name: 'HOAT_DONG', total: 111 },
      { name: 'BAO_TRI', total: 12 },
      { name: 'HONG', total: 5 },
    ],
  },
  approvals: {
    pendingTransfers: 3,
    pendingInventories: 2,
    totalPending: 5,
  },
  recentLogs: [
    {
      maLog: 101,
      maNhanVien: 'B2204960',
      hoTen: 'Nguyen Thi Huynh Nhu',
      thoiGian: new Date().toISOString(),
      hanhDong: 'LOGIN',
      doiTuong: 'NHAN_VIEN',
      doiTuongId: 'B2204960',
      trangThai: 'SUCCESS',
    },
  ],
};

export const employeeList: EmployeeList = {
  data: employees,
  meta: { page: 1, limit: 20, total: employees.length, totalPages: 1 },
};

export const approvals: ApprovalItem[] = [
  {
    loaiPhieu: 'TRANSFER',
    maPhieu: 'DC-2026-001',
    ngay: '2026-05-17',
    trangThaiPhieu: 'CHO_KY',
    nguoiLap: 'Tran Minh Quan',
    vongKy: 1,
    tenVaiTro: 'System Lead',
    createdAt: new Date().toISOString(),
  },
  {
    loaiPhieu: 'INVENTORY',
    maPhieu: 'KK-2026-002',
    ngay: '2026-05-18',
    trangThaiPhieu: 'DANG_KIEM_KE',
    nguoiLap: 'Le Bao Chau',
    vongKy: 1,
    tenVaiTro: 'System Lead',
    createdAt: new Date().toISOString(),
  },
];

export const notifications: NotificationItem[] = approvals.map((approval) => ({
  id: `${approval.loaiPhieu}:${approval.maPhieu}`,
  type: approval.loaiPhieu,
  documentId: approval.maPhieu,
  documentDate: approval.ngay,
  status: 'CHO_KY',
  createdAt: approval.createdAt,
  message: `${approval.maPhieu} dang cho ky duyet`,
}));

export const settings: SystemSettings = {
  appName: 'Quan Ly Tai San QR',
  jwtExpiresIn: '8h',
  emailNotificationsEnabled: true,
  inAppNotificationsEnabled: true,
  database: {
    host: '34.44.235.59',
    name: 'quan_ly_tai_san_qr',
  },
  modules: ['AUTH', 'STAFF', 'ROLE', 'APPROVAL', 'NOTIFICATION', 'AUDIT'],
};

export const auditLogs: AuditLogList = {
  data: [
    {
      maLog: 101,
      maNhanVien: 'B2204960',
      hoTen: 'Nguyen Thi Huynh Nhu',
      thoiGian: new Date().toISOString(),
      hanhDong: 'STAFF_EDIT',
      doiTuong: 'NHAN_VIEN',
      doiTuongId: 'NV002',
      trangThai: 'SUCCESS',
      chiTiet: 'Cap nhat thong tin nhan vien',
    },
    {
      maLog: 100,
      maNhanVien: 'B2204960',
      hoTen: 'Nguyen Thi Huynh Nhu',
      thoiGian: new Date(Date.now() - 3600_000).toISOString(),
      hanhDong: 'ROLE_ASSIGN_PERMISSIONS',
      doiTuong: 'VAI_TRO',
      doiTuongId: 'ADMIN',
      trangThai: 'SUCCESS',
      chiTiet: 'Gan quyen cho vai tro',
    },
  ],
  meta: { page: 1, limit: 20, total: 2, totalPages: 1 },
};
