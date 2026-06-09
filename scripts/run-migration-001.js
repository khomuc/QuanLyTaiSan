require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function main() {
  let connection;

  try {
    console.log('=================================');
    console.log('Running migration 001...');
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
      '001_add_refresh_token_table.sql',
    );

    const sql = fs.readFileSync(migrationPath, 'utf8');

    await connection.query(sql);

    console.log(
      '✓ Migration 001_add_refresh_token_table.sql completed.',
    );

    const [tables] = await connection.query(`
      SHOW TABLES LIKE 'REFRESH_TOKEN'
    `);

    console.log('\nVerification:');
    console.table(tables);

    const [columns] = await connection.query(`
      SHOW COLUMNS FROM REFRESH_TOKEN
    `);

    console.log('\nREFRESH_TOKEN structure:');
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