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
    const [rows] = await conn.query('SELECT * FROM NHAN_VIEN LIMIT 50');
    console.log('NHAN_VIEN rows:', rows);
    await conn.end();
  } catch (e) {
    console.error('Error querying NHAN_VIEN:', e.message || e);
    process.exit(1);
  }
})();
