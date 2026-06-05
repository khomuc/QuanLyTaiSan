export interface AuthUser {
  maNhanVien: string;
  email: string;
  hoTen: string;
  chucVu?: string | null;
  soDienThoai?: string | null;
  maPhongBan?: string;
  tenPhongBan?: string | null;
  maVaiTro: string;
  tenVaiTro?: string | null;
  trangThai?: 'ACTIVE' | 'INACTIVE';
  permissions: string[];
}
