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
      ['TS0001','QR-TS-0001','Máy tính xách tay Dell Latitude 7420','DL7420-001','Latitude 7420','LT001',32000000,8000000,24000000,'2025-01-10','PB01','HOAT_DONG','TSCD-0001','Tài sản mẫu cho quét QR'],
      ['TS0002','QR-TS-0002','Máy chiếu Epson EB-X06','EPX06-002','EB-X06','LT003',15000000,3000000,12000000,'2025-01-10','PB02','HOAT_DONG','TSCD-0002','Tài sản mẫu cho quét QR'],
      ['TS0003','QR-TS-0003','Máy in HP LaserJet Pro M404dn','HPM404-003','M404dn','LT001',9000000,1500000,7500000,'2025-01-10','PB03','HOAT_DONG','TSCD-0003','Tài sản mẫu cho quét QR'],
      ['TS0004','QR-TS-0004','Điều hòa Panasonic 18000BTU','PANA18-004','CS-XU18','LT002',18000000,4000000,14000000,'2025-01-10','PB04','HOAT_DONG','TSCD-0004','Tài sản mẫu cho quét QR'],
      ['TS0005','QR-TS-0005','Bộ máy tính để bàn văn phòng','PCOFF-005','Office Desktop','LT001',20000000,5000000,15000000,'2025-01-10','PB05','HOAT_DONG','TSCD-0005','Tài sản mẫu cho quét QR'],
      ['TS0006','QR-TS-0006','Tủ hồ sơ 5 ngăn','TUI-006','Cabinet 5F','LT005',5000000,500000,4500000,'2025-01-10','PB06','HOAT_DONG','TSCD-0006','Tài sản mẫu cho quét QR'],
    ];
    for (const r of inserts) {
      await conn.query("INSERT INTO TAI_SAN (MaTaiSan, MaQR, TenTaiSan, Serial, Model, MaLoai, NguyenGia, HaoMonLuyKe, GiaTriConLai, NgayNhap, MaPhongBanHienTai, TrangThai, SoHieuTSCD, GhiChu) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", r);
    }
    console.log('Inserted sample TAI_SAN records.');
    await conn.end();
  } catch (e) {
    console.error('Error inserting TAI_SAN:', e.message || e);
    process.exit(1);
  }
})();
