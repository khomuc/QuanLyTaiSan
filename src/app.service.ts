import { Inject, Injectable } from '@nestjs/common';
import type { Pool } from 'mysql2/promise';
import { MYSQL_CONNECTION } from './common/constants';

@Injectable()
export class AppService {
  constructor(@Inject(MYSQL_CONNECTION) private readonly dbConnection: Pool) {}

  getHealth() {
    return {
      status: 'ok',
      service: 'quan-ly-tai-san-api',
      timestamp: new Date().toISOString(),
    };
  }

  async getDanhSachTaiSan() {
    const [rows] = await this.dbConnection.query('SELECT * FROM TAI_SAN');
    return rows;
  }

  async themTaiSan(maQr: string, tenTaiSan: string) {
    const query = 'INSERT INTO TAI_SAN (MaQR, TenTaiSan) VALUES (?, ?)';
    const [result] = await this.dbConnection.execute(query, [maQr, tenTaiSan]);

    return result;
  }
}
