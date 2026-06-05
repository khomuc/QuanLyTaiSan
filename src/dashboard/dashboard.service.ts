import { Inject, Injectable } from '@nestjs/common';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { MYSQL_CONNECTION } from '../common/constants';

interface CountRow extends RowDataPacket {
  total: number | string;
}

interface GroupCountRow extends RowDataPacket {
  name: string | null;
  total: number | string;
}

interface RecentAuditLogRow extends RowDataPacket {
  maLog: number;
  maNhanVien: string | null;
  hoTen: string | null;
  hanhDong: string | null;
  doiTuong: string | null;
  doiTuongId: string | null;
  trangThai: string | null;
  thoiGian: Date | string | null;
}

@Injectable()
export class DashboardService {
  constructor(@Inject(MYSQL_CONNECTION) private readonly db: Pool) {}

  async getOverview() {
    const [
      totalEmployees,
      employeesByStatus,
      totalAssets,
      assetsByStatus,
      pendingTransfers,
      pendingInventories,
      recentLogs,
    ] = await Promise.all([
      this.scalar('SELECT COUNT(*) AS total FROM NHAN_VIEN'),
      this.groupCount('NHAN_VIEN', 'TrangThai'),
      this.scalar('SELECT COUNT(*) AS total FROM TAI_SAN'),
      this.groupCount('TAI_SAN', 'TrangThai'),
      this.scalar(
        `SELECT COUNT(*) AS total
         FROM PHIEU_DIEU_CHUYEN_NHAN_VIEN
         WHERE TrangThaiKy = 'CHO_KY'`,
      ),
      this.scalar(
        `SELECT COUNT(*) AS total
         FROM PHIEU_KIEM_KE_NHAN_VIEN
         WHERE TrangThaiKy = 'CHO_KY'`,
      ),
      this.recentAuditLogs(),
    ]);

    return {
      employees: {
        total: totalEmployees,
        byStatus: employeesByStatus,
      },
      assets: {
        total: totalAssets,
        byStatus: assetsByStatus,
      },
      approvals: {
        pendingTransfers,
        pendingInventories,
        totalPending: pendingTransfers + pendingInventories,
      },
      recentLogs,
    };
  }

  private async scalar(sql: string): Promise<number> {
    const [rows] = await this.db.query<CountRow[]>(sql);
    return Number(rows[0]?.total ?? 0);
  }

  private async groupCount(tableName: string, columnName: string) {
    const [rows] = await this.db.query<GroupCountRow[]>(
      `SELECT ${columnName} AS name, COUNT(*) AS total
       FROM ${tableName}
       GROUP BY ${columnName}
       ORDER BY ${columnName}`,
    );

    return rows.map((row) => ({
      name: row.name,
      total: Number(row.total ?? 0),
    }));
  }

  private async recentAuditLogs() {
    const [rows] = await this.db.query<RecentAuditLogRow[]>(
      `SELECT l.MaLog AS maLog, l.MaNhanVien AS maNhanVien, nv.HoTen AS hoTen,
              l.HanhDong AS hanhDong, l.DoiTuong AS doiTuong,
              l.DoiTuongId AS doiTuongId, l.TrangThai AS trangThai,
              l.ThoiGian AS thoiGian
       FROM AUDIT_LOG l
       LEFT JOIN NHAN_VIEN nv ON nv.MaNhanVien = l.MaNhanVien
       ORDER BY l.ThoiGian DESC, l.MaLog DESC
       LIMIT 10`,
    );

    return rows;
  }
}
