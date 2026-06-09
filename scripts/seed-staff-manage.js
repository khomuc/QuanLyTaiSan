require('dotenv').config();
const mysql = require('mysql2/promise');

async function main() {
  let connection;

  try {
    console.log('=================================');
    console.log('Connecting to database...');
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`Database: ${process.env.DB_NAME}`);
    console.log(`User: ${process.env.DB_USER}`);
    console.log('=================================');

    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      charset: 'utf8mb4',
      ssl: {
        rejectUnauthorized: false,
      },
    });

    await connection.query('SELECT 1');

    console.log('Connected successfully.');

    await connection.beginTransaction();

    const [permissionResult] = await connection.execute(
      `
      INSERT IGNORE INTO QUYEN
      (MaQuyen, TenQuyen, MoTa, Module)
      VALUES (?, ?, ?, ?)
      `,
      [
        'STAFF_MANAGE',
        'Quản lý quyền NV',
        'Ghi đè quyền hạn từng nhân viên',
        'STAFF',
      ],
    );

    console.log('QUYEN result:', permissionResult);

    const [rolePermissionResult] = await connection.execute(
      `
      INSERT IGNORE INTO VAI_TRO_QUYEN
      (MaVaiTro, MaQuyen)
      VALUES (?, ?)
      `,
      ['ADMIN', 'STAFF_MANAGE'],
    );

    console.log('VAI_TRO_QUYEN result:', rolePermissionResult);

    await connection.commit();

    console.log('=================================');
    console.log('STAFF_MANAGE permission seeded.');
    console.log('ADMIN role mapped successfully.');
    console.log('=================================');

    const [permissions] = await connection.execute(
      `
      SELECT *
      FROM QUYEN
      WHERE MaQuyen = ?
      `,
      ['STAFF_MANAGE'],
    );

    console.log('\nPermission verification:');
    console.table(permissions);

    const [rolePermissions] = await connection.execute(
      `
      SELECT *
      FROM VAI_TRO_QUYEN
      WHERE MaVaiTro = ?
        AND MaQuyen = ?
      `,
      ['ADMIN', 'STAFF_MANAGE'],
    );

    console.log('\nRole permission verification:');
    console.table(rolePermissions);

    console.log('\nSeed completed successfully.');
  } catch (error) {
    console.error('\nSeed failed:');
    console.error(error);

    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('Rollback failed:', rollbackError);
      }
    }

    process.exitCode = 1;
  } finally {
    if (connection) {
      try {
        await connection.end();
        console.log('\nConnection closed.');
      } catch (closeError) {
        console.error('Error closing connection:', closeError);
      }
    }
  }
}

main();