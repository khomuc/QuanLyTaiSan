import { Injectable, Inject } from '@nestjs/common';
import { Connection } from 'mysql2/promise'; // Import kiểu dữ liệu để code gợi ý tốt hơn

@Injectable()
export class AppService {
  constructor(
    // Gọi kết nối MySQL mà chúng ta đã khởi tạo ở DatabaseModule
    @Inject('MYSQL_CONNECTION') 
    private readonly dbConnection: Connection,
  ) {}

  // Ví dụ lấy danh sách tài sản bằng Raw SQL
  async getDanhSachTaiSan() {
    const [rows] = await this.dbConnection.query(`
      SELECT ts.MaTaiSan, ts.MaQR, ts.TenTaiSan, ts.Serial, ts.Model, ts.NguyenGia,
             ts.GiaTriConLai, ts.NgayNhap, ts.TrangThai,
             pb.TenPhongBan AS TenPhongBanHienTai,
             lt.TenLoai AS TenLoaiTaiSan
      FROM TAI_SAN ts
      LEFT JOIN PHONG_BAN pb ON pb.MaPhongBan = ts.MaPhongBanHienTai
      LEFT JOIN LOAI_TAI_SAN lt ON lt.MaLoai = ts.MaLoai
      ORDER BY ts.CreatedAt DESC
    `);

    return rows;
  }

  // Ví dụ thêm tài sản mới
  async themTaiSan(maTaiSan: string, maQr: string, tenTaiSan: string) {
    const query = `
      INSERT INTO TAI_SAN (MaTaiSan, MaQR, TenTaiSan, MaLoai, NguyenGia, HaoMonLuyKe, GiaTriConLai, NgayNhap, MaPhongBanHienTai, TrangThai)
      VALUES (?, ?, ?, 'LT001', 0, 0, 0, CURDATE(), 'PB01', 'HOAT_DONG')
    `;
    const [result] = await this.dbConnection.execute(query, [maTaiSan, maQr, tenTaiSan]);

    return result;
  }
}