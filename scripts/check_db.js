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
    const [pb] = await conn.query('SELECT MaPhongBan FROM PHONG_BAN LIMIT 10');
    const [vt] = await conn.query('SELECT MaVaiTro FROM VAI_TRO LIMIT 10');
    const [nv] = await conn.query('SELECT MaNhanVien FROM NHAN_VIEN LIMIT 10');
    console.log('PHONG_BAN:', pb);
    console.log('VAI_TRO:', vt);
    console.log('NHAN_VIEN:', nv);
    await conn.end();
  } catch (e) {
    console.error('Error querying DB:', e.message || e);
    process.exit(1);
  }
})();
