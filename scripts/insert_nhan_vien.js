const mysql = require('mysql2/promise');
(async () => {
  try {
    const conn = await mysql.createConnection({
      host: '34.44.235.59',
      user: 'root',
      password: 'Ct555_2026',
      database: 'quan_ly_tai_san_qr',
      ssl: { rejectUnauthorized: false },
    });
    const inserts = [
      [ 'NV0001', 'Hiệu trưởng', 'Hiệu trưởng', 'hieutruong@ctu.edu.vn', '0900000001', 'PB01', 'ADMIN', '123456' ],
      [ 'NV0002', 'Nguyễn Văn Lĩnh', 'Phó Hiệu trưởng', 'nguyenvanlinh@ctu.edu.vn', '0900000002', 'PB01', 'ADMIN', '123456' ],
      [ 'NV0003', 'Trần Thanh Sang', 'Phó Hiệu trưởng', 'tranthanhsang@ctu.edu.vn', '0900000003', 'PB01', 'ADMIN', '123456' ],
      [ 'NV0004', 'Bùi Hải Dương', 'Phó Hiệu trưởng', 'buihaiduong@ctu.edu.vn', '0900000004', 'PB01', 'ADMIN', '123456' ],
      [ 'NV0005', 'Huỳnh Thanh Hiếu', 'Phó Hiệu trưởng', 'huynhthanhhieu@ctu.edu.vn', '0900000005', 'PB01', 'ADMIN', '123456' ],
    ];
    for (const row of inserts) {
      await conn.query("INSERT INTO NHAN_VIEN (MaNhanVien, HoTen, ChucVu, Email, SoDienThoai, MaPhongBan, MaVaiTro, MatKhau) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", row);
    }
    console.log('Inserted sample NHAN_VIEN records.');
    await conn.end();
  } catch (e) {
    console.error('Error inserting NHAN_VIEN:', e.message || e);
    process.exit(1);
  }
})();
