import { Global, Module } from '@nestjs/common';
import * as mysql from 'mysql2/promise';
import { MYSQL_CONNECTION } from './common/constants';

@Global()
@Module({
  providers: [
    {
      provide: MYSQL_CONNECTION,
      useFactory: async () => {
        try {
          const pool = mysql.createPool({
            host: process.env.DB_HOST ?? '34.44.235.59',
            user: process.env.DB_USER ?? 'root',
            password: process.env.DB_PASSWORD ?? 'Ct555_2026',
            database: process.env.DB_NAME ?? 'quan_ly_tai_san_qr',
            waitForConnections: true,
            connectionLimit: Number(process.env.DB_CONNECTION_LIMIT ?? 10),
            ssl: {
              rejectUnauthorized: false,
            },
          });

          await pool.query('SELECT 1');
          console.log('MySQL pool connected successfully');
          return pool;
        } catch (error) {
          console.error('MySQL connection error:', error);
          throw error;
        }
      },
    },
  ],
  exports: [MYSQL_CONNECTION],
})
export class DatabaseModule {}
