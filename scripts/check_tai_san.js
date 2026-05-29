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
    const [rows] = await conn.query("SELECT MaTaiSan, MaQR, TenTaiSan FROM TAI_SAN WHERE MaQR IN ('QR-TS-0001','QR-TS-0002','QR-TS-0003')");
    console.log('TAI_SAN rows:', rows);
    await conn.end();
  } catch (e) {
    console.error('Error querying TAI_SAN:', e.message || e);
    process.exit(1);
  }
})();
