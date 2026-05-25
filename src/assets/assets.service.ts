import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { MYSQL_CONNECTION } from '../common/constants';
import { QueryAssetsDto } from './dto/query-assets.dto';

interface AssetRow extends RowDataPacket {
  maTaiSan: string;
  maQR: string | null;
  tenTaiSan: string;
  serial: string | null;
  model: string | null;
  maLoai: string;
  tenLoai: string | null;
  nguyenGia: string;
  haoMonLuyKe: string;
  giaTriConLai: string;
  ngayNhap: Date | string;
  maPhongBanHienTai: string;
  tenPhongBan: string | null;
  trangThai: string;
  soHieuTSCD: string | null;
  ghiChu: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

@Injectable()
export class AssetsService {
  constructor(@Inject(MYSQL_CONNECTION) private readonly db: Pool) {}

  async findAll(query: QueryAssetsDto) {
    const where: string[] = [];
    const params: Array<string | number> = [];

    if (query.search) {
      where.push(
        `(ts.MaTaiSan LIKE ? OR ts.MaQR LIKE ? OR ts.TenTaiSan LIKE ? OR ts.Serial LIKE ? OR ts.SoHieuTSCD LIKE ?)`,
      );
      const keyword = `%${query.search}%`;
      params.push(keyword, keyword, keyword, keyword, keyword);
    }

    if (query.maLoai) {
      where.push('ts.MaLoai = ?');
      params.push(query.maLoai);
    }

    if (query.maPhongBan) {
      where.push('ts.MaPhongBanHienTai = ?');
      params.push(query.maPhongBan);
    }

    if (query.trangThai) {
      where.push('ts.TrangThai = ?');
      params.push(query.trangThai);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const offset = (page - 1) * limit;

    const [rows] = await this.db.query<AssetRow[]>(
      `SELECT ts.MaTaiSan AS maTaiSan, ts.MaQR AS maQR, ts.TenTaiSan AS tenTaiSan,
              ts.Serial AS serial, ts.Model AS model, ts.MaLoai AS maLoai,
              lts.TenLoai AS tenLoai, ts.NguyenGia AS nguyenGia,
              ts.HaoMonLuyKe AS haoMonLuyKe, ts.GiaTriConLai AS giaTriConLai,
              ts.NgayNhap AS ngayNhap, ts.MaPhongBanHienTai AS maPhongBanHienTai,
              pb.TenPhongBan AS tenPhongBan, ts.TrangThai AS trangThai,
              ts.SoHieuTSCD AS soHieuTSCD, ts.GhiChu AS ghiChu,
              ts.CreatedAt AS createdAt, ts.UpdatedAt AS updatedAt
       FROM TAI_SAN ts
       LEFT JOIN LOAI_TAI_SAN lts ON lts.MaLoai = ts.MaLoai
       LEFT JOIN PHONG_BAN pb ON pb.MaPhongBan = ts.MaPhongBanHienTai
       ${whereSql}
       ORDER BY ts.CreatedAt DESC, ts.MaTaiSan DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );

    const [countRows] = await this.db.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total
       FROM TAI_SAN ts
       ${whereSql}`,
      params,
    );

    const total = Number(countRows[0]?.total ?? 0);

    return {
      data: rows.map((row) => this.mapAsset(row)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(maTaiSan: string) {
    const [rows] = await this.db.execute<AssetRow[]>(
      `SELECT ts.MaTaiSan AS maTaiSan, ts.MaQR AS maQR, ts.TenTaiSan AS tenTaiSan,
              ts.Serial AS serial, ts.Model AS model, ts.MaLoai AS maLoai,
              lts.TenLoai AS tenLoai, ts.NguyenGia AS nguyenGia,
              ts.HaoMonLuyKe AS haoMonLuyKe, ts.GiaTriConLai AS giaTriConLai,
              ts.NgayNhap AS ngayNhap, ts.MaPhongBanHienTai AS maPhongBanHienTai,
              pb.TenPhongBan AS tenPhongBan, ts.TrangThai AS trangThai,
              ts.SoHieuTSCD AS soHieuTSCD, ts.GhiChu AS ghiChu,
              ts.CreatedAt AS createdAt, ts.UpdatedAt AS updatedAt
       FROM TAI_SAN ts
       LEFT JOIN LOAI_TAI_SAN lts ON lts.MaLoai = ts.MaLoai
       LEFT JOIN PHONG_BAN pb ON pb.MaPhongBan = ts.MaPhongBanHienTai
       WHERE ts.MaTaiSan = ?
       LIMIT 1`,
      [maTaiSan],
    );

    if (!rows[0]) {
      throw new NotFoundException('Asset not found');
    }

    return this.mapAsset(rows[0]);
  }

  async listCategories() {
    const [rows] = await this.db.execute<RowDataPacket[]>(
      `SELECT MaLoai AS maLoai, TenLoai AS tenLoai, MoTa AS moTa
       FROM LOAI_TAI_SAN
       ORDER BY TenLoai`,
    );

    return rows;
  }

  private mapAsset(row: AssetRow) {
    return {
      ...row,
      nguyenGia: Number(row.nguyenGia ?? 0),
      haoMonLuyKe: Number(row.haoMonLuyKe ?? 0),
      giaTriConLai: Number(row.giaTriConLai ?? 0),
    };
  }
}
