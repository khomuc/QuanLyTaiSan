require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function main() {
  let connection;

  try {
    console.log('=================================');
    console.log('Running migration 002...');
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`Database: ${process.env.DB_NAME}`);
    console.log('=================================');

    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: {
        rejectUnauthorized: false,
      },
      multipleStatements: true,
    });

    const migrationPath = path.join(
      __dirname,
      '..',
      'migrations',
      '002_add_nhan_vien_quyen.sql',
    );

    const sql = fs.readFileSync(migrationPath, 'utf8');

    await connection.query(sql);

    console.log(
      '✓ Migration 002_add_nhan_vien_quyen.sql completed.',
    );

    const [tables] = await connection.query(`
      SHOW TABLES LIKE 'NHAN_VIEN_QUYEN'
    `);

    console.log('\nVerification:');
    console.table(tables);

    const [columns] = await connection.query(`
      SHOW COLUMNS FROM NHAN_VIEN_QUYEN
    `);

    console.log('\nNHAN_VIEN_QUYEN structure:');
    console.table(columns);
  } catch (error) {
    console.error('\nMigration failed:');
    console.error(error);
    process.exitCode = 1;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nConnection closed.');
    }
  }
}

main();