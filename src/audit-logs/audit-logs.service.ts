import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { MYSQL_CONNECTION } from '../common/constants';
import { QueryAuditLogsDto } from './dto/query-audit-logs.dto';

@Injectable()
export class AuditLogsService {
  constructor(@Inject(MYSQL_CONNECTION) private readonly db: Pool) {}

  async findAll(query: QueryAuditLogsDto) {
    const where: string[] = [];
    const params: Array<string | number> = [];

    if (query.search) {
      where.push(
        `(l.HanhDong LIKE ? OR l.DoiTuong LIKE ? OR l.DoiTuongId LIKE ? OR l.ChiTiet LIKE ?)`,
      );
      const keyword = `%${query.search}%`;
      params.push(keyword, keyword, keyword, keyword);
    }

    if (query.maNhanVien) {
      where.push('l.MaNhanVien = ?');
      params.push(query.maNhanVien);
    }

    if (query.hanhDong) {
      where.push('l.HanhDong = ?');
      params.push(query.hanhDong);
    }

    if (query.doiTuong) {
      where.push('l.DoiTuong = ?');
      params.push(query.doiTuong);
    }

    if (query.trangThai) {
      where.push('l.TrangThai = ?');
      params.push(query.trangThai);
    }

    if (query.fromDate) {
      where.push('l.ThoiGian >= ?');
      params.push(query.fromDate);
    }

    if (query.toDate) {
      where.push('l.ThoiGian <= ?');
      params.push(query.toDate);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const offset = (page - 1) * limit;

    const [rows] = await this.db.query<RowDataPacket[]>(
      `SELECT l.MaLog AS maLog, l.MaNhanVien AS maNhanVien, nv.HoTen AS hoTen,
              l.ThoiGian AS thoiGian, l.HanhDong AS hanhDong,
              l.DoiTuong AS doiTuong, l.DoiTuongId AS doiTuongId,
              l.TrangThai AS trangThai, l.ChiTiet AS chiTiet,
              l.IpAddress AS ipAddress, l.CreatedAt AS createdAt
       FROM AUDIT_LOG l
       LEFT JOIN NHAN_VIEN nv ON nv.MaNhanVien = l.MaNhanVien
       ${whereSql}
       ORDER BY l.ThoiGian DESC, l.MaLog DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );

    const [countRows] = await this.db.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total
       FROM AUDIT_LOG l
       ${whereSql}`,
      params,
    );

    const total = Number(countRows[0]?.total ?? 0);

    return {
      data: rows,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(maLog: number) {
    const [rows] = await this.db.execute<RowDataPacket[]>(
      `SELECT l.MaLog AS maLog, l.MaNhanVien AS maNhanVien, nv.HoTen AS hoTen,
              l.ThoiGian AS thoiGian, l.HanhDong AS hanhDong,
              l.DoiTuong AS doiTuong, l.DoiTuongId AS doiTuongId,
              l.TrangThai AS trangThai, l.ChiTiet AS chiTiet,
              l.IpAddress AS ipAddress, l.CreatedAt AS createdAt
       FROM AUDIT_LOG l
       LEFT JOIN NHAN_VIEN nv ON nv.MaNhanVien = l.MaNhanVien
       WHERE l.MaLog = ?
       LIMIT 1`,
      [maLog],
    );

    if (!rows[0]) {
      throw new NotFoundException('Audit log not found');
    }

    return rows[0];
  }
}
