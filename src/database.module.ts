import { Global, Module } from '@nestjs/common';
import * as mysql from 'mysql2/promise';
import { MYSQL_CONNECTION } from './common/constants';

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required. Configure it in .env before start.`);
  }
  return value;
}

@Global()
@Module({
  providers: [
    {
      provide: MYSQL_CONNECTION,
      useFactory: async () => {
        try {
          const pool = mysql.createPool({
            host: getRequiredEnv('DB_HOST'),
            user: getRequiredEnv('DB_USER'),
            password: getRequiredEnv('DB_PASSWORD'),
            database: getRequiredEnv('DB_NAME'),
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
