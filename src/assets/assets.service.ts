import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import ExcelJS from 'exceljs';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { MYSQL_CONNECTION } from '../common/constants';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import { CreateAssetDto } from './dto/create-asset.dto';
import { QueryAssetsDto } from './dto/query-assets.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';

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

const ASSET_EXCEL_COLUMNS = [
  { header: 'MaTaiSan', key: 'maTaiSan', width: 18 },
  { header: 'MaQR', key: 'maQR', width: 18 },
  { header: 'TenTaiSan', key: 'tenTaiSan', width: 32 },
  { header: 'Serial', key: 'serial', width: 18 },
  { header: 'Model', key: 'model', width: 18 },
  { header: 'MaLoai', key: 'maLoai', width: 14 },
  { header: 'NguyenGia', key: 'nguyenGia', width: 16 },
  { header: 'HaoMonLuyKe(%)', key: 'haoMonLuyKe', width: 16 },
  { header: 'GiaTriConLai', key: 'giaTriConLai', width: 16 },
  { header: 'NgayNhap', key: 'ngayNhap', width: 14 },
  { header: 'MaPhongBanHienTai', key: 'maPhongBanHienTai', width: 22 },
  { header: 'TrangThai', key: 'trangThai', width: 14 },
  { header: 'SoHieuTSCD', key: 'soHieuTSCD', width: 18 },
  { header: 'GhiChu', key: 'ghiChu', width: 30 },
];

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

  async lookupByCode(code: string) {
    const keyword = code.trim();
    const assetCode = keyword.toUpperCase().startsWith('QR-')
      ? keyword.slice(3)
      : keyword;

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
          OR ts.MaQR = ?
          OR ts.SoHieuTSCD = ?
          OR ts.MaTaiSan = ?
       LIMIT 1`,
      [keyword, keyword, keyword, assetCode],
    );

    if (!rows[0]) {
      throw new NotFoundException('Asset not found for scanned QR');
    }

    return this.mapAsset(rows[0]);
  }

  async history(maTaiSan: string) {
    const [rows] = await this.db.execute<RowDataPacket[]>(
      `SELECT l.MaLog AS maLog, l.MaNhanVien AS maNhanVien, nv.HoTen AS hoTen,
              l.ThoiGian AS thoiGian, l.HanhDong AS hanhDong,
              l.TrangThai AS trangThai, l.ChiTiet AS chiTiet
       FROM AUDIT_LOG l
       LEFT JOIN NHAN_VIEN nv ON nv.MaNhanVien = l.MaNhanVien
       WHERE l.DoiTuong = 'TAI_SAN'
         AND (l.DoiTuongId = ? OR l.ChiTiet LIKE ?)
       ORDER BY l.ThoiGian DESC, l.MaLog DESC
       LIMIT 20`,
      [maTaiSan, `%${maTaiSan}%`],
    );

    return rows;
  }

  async create(dto: CreateAssetDto, user: AuthUser) {
    const maQR = this.nullIfBlank(dto.maQR) ?? this.buildAssetQrCode(dto.maTaiSan);

    await this.ensureUniqueAssetFields({ ...dto, maQR });

    const haoMonLuyKe = dto.haoMonLuyKe ?? 0;
    const giaTriConLai = dto.giaTriConLai ?? dto.nguyenGia - haoMonLuyKe;

    await this.db.execute(
      `INSERT INTO TAI_SAN
       (MaTaiSan, MaQR, TenTaiSan, Serial, Model, MaLoai, NguyenGia, HaoMonLuyKe,
        GiaTriConLai, NgayNhap, MaPhongBanHienTai, TrangThai, SoHieuTSCD, GhiChu)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        dto.maTaiSan,
        maQR,
        dto.tenTaiSan,
        this.nullIfBlank(dto.serial),
        this.nullIfBlank(dto.model),
        dto.maLoai,
        dto.nguyenGia,
        haoMonLuyKe,
        giaTriConLai,
        dto.ngayNhap,
        dto.maPhongBanHienTai,
        dto.trangThai,
        this.nullIfBlank(dto.soHieuTSCD),
        this.nullIfBlank(dto.ghiChu),
      ],
    );

    await this.writeAudit(
      user.maNhanVien,
      'ASSET_CREATE',
      dto.maTaiSan,
      `Tao tai san ${dto.maTaiSan}`,
    );
    return this.findOne(dto.maTaiSan);
  }

  async update(maTaiSan: string, dto: UpdateAssetDto, user: AuthUser) {
    await this.findOne(maTaiSan);
    await this.ensureUniqueAssetFields(dto, maTaiSan);

    const assignments: string[] = [];
    const params: Array<string | number | null> = [];

    this.assignNullable(assignments, params, 'MaQR', dto.maQR);
    this.assignNullable(assignments, params, 'TenTaiSan', dto.tenTaiSan);
    this.assignNullable(assignments, params, 'Serial', dto.serial);
    this.assignNullable(assignments, params, 'Model', dto.model);
    this.assignNullable(assignments, params, 'MaLoai', dto.maLoai);
    this.assignNumber(assignments, params, 'NguyenGia', dto.nguyenGia);
    this.assignNumber(assignments, params, 'HaoMonLuyKe', dto.haoMonLuyKe);
    this.assignNumber(assignments, params, 'GiaTriConLai', dto.giaTriConLai);
    this.assignNullable(assignments, params, 'NgayNhap', dto.ngayNhap);
    this.assignNullable(
      assignments,
      params,
      'MaPhongBanHienTai',
      dto.maPhongBanHienTai,
    );
    this.assignNullable(assignments, params, 'TrangThai', dto.trangThai);
    this.assignNullable(assignments, params, 'SoHieuTSCD', dto.soHieuTSCD);
    this.assignNullable(assignments, params, 'GhiChu', dto.ghiChu);

    if (!assignments.length) {
      throw new BadRequestException('No fields to update');
    }

    await this.db.execute(
      `UPDATE TAI_SAN SET ${assignments.join(', ')} WHERE MaTaiSan = ?`,
      [...params, maTaiSan],
    );

    await this.writeAudit(
      user.maNhanVien,
      'ASSET_EDIT',
      maTaiSan,
      `Cap nhat tai san ${maTaiSan}`,
    );
    return this.findOne(maTaiSan);
  }

  async remove(maTaiSan: string, user: AuthUser) {
    const [result] = await this.db.execute<ResultSetHeader>(
      `UPDATE TAI_SAN
       SET TrangThai = 'THANH_LY'
       WHERE MaTaiSan = ?`,
      [maTaiSan],
    );

    if (!result.affectedRows) {
      throw new NotFoundException('Asset not found');
    }

    await this.writeAudit(
      user.maNhanVien,
      'ASSET_DELETE',
      maTaiSan,
      `Dua tai san ${maTaiSan} vao muc thanh ly`,
    );
    return { message: 'Asset marked as liquidated successfully' };
  }

  async finalizeRemove(maTaiSan: string, user: AuthUser) {
    const connection = await this.db.getConnection();

    try {
      await connection.beginTransaction();

      const [assetRows] = await connection.execute<RowDataPacket[]>(
        'SELECT MaTaiSan FROM TAI_SAN WHERE MaTaiSan = ? AND TrangThai = ? LIMIT 1',
        [maTaiSan, 'THANH_LY'],
      );

      if (!assetRows[0]) {
        throw new NotFoundException('Liquidated asset not found');
      }

      const [result] = await connection.execute<ResultSetHeader>(
        `UPDATE TAI_SAN
         SET TrangThai = 'THANH_LY'
         WHERE MaTaiSan = ?`,
        [maTaiSan],
      );

      if (!result.affectedRows) {
        throw new NotFoundException('Asset not found');
      }

      await this.writeAuditWithConnection(
        connection,
        user.maNhanVien,
        'ASSET_LIQUIDATION_COMPLETED',
        maTaiSan,
        `Hoan tat thanh ly tai san ${maTaiSan}`,
      );
      await connection.commit();

      return { message: 'Asset liquidation completed successfully' };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async listCategories() {
    const [rows] = await this.db.execute<RowDataPacket[]>(
      `SELECT MaLoai AS maLoai, TenLoai AS tenLoai, MoTa AS moTa
       FROM LOAI_TAI_SAN
       ORDER BY TenLoai`,
    );

    return rows;
  }

  async buildImportTemplate() {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('TaiSan');
    sheet.columns = ASSET_EXCEL_COLUMNS;
    sheet.addRow({
      maTaiSan: 'TS001',
      maQR: 'QR-TS001',
      tenTaiSan: 'May tinh Dell OptiPlex',
      serial: 'SN001',
      model: 'OptiPlex 7010',
      maLoai: 'MAY_TINH',
      nguyenGia: 15000000,
      haoMonLuyKe: 10,
      giaTriConLai: 14000000,
      ngayNhap: '2026-05-27',
      maPhongBanHienTai: 'PB01',
      trangThai: 'HOAT_DONG',
      soHieuTSCD: 'TSCD-001',
      ghiChu: 'Dong mau, thay bang du lieu thuc te',
    });
    this.styleExcelSheet(sheet);

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }

  async exportToExcel(query: QueryAssetsDto) {
    const result = await this.findAll({ ...query, page: 1, limit: 10000 });
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('TaiSan');
    sheet.columns = ASSET_EXCEL_COLUMNS;

    result.data.forEach((asset) => {
      sheet.addRow({
        maTaiSan: asset.maTaiSan,
        maQR: asset.maQR,
        tenTaiSan: asset.tenTaiSan,
        serial: asset.serial,
        model: asset.model,
        maLoai: asset.maLoai,
        nguyenGia: asset.nguyenGia,
        haoMonLuyKe: this.toDepreciationPercent(asset),
        giaTriConLai: asset.giaTriConLai,
        ngayNhap: String(asset.ngayNhap).slice(0, 10),
        maPhongBanHienTai: asset.maPhongBanHienTai,
        trangThai: asset.trangThai,
        soHieuTSCD: asset.soHieuTSCD,
        ghiChu: asset.ghiChu,
      });
    });
    this.styleExcelSheet(sheet);

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }

  async importFromExcel(
    file: { buffer: Buffer; originalname: string } | undefined,
    user: AuthUser,
  ) {
    if (!file?.buffer) {
      throw new BadRequestException('Excel file is required');
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer as unknown as ArrayBuffer);
    const sheet = workbook.getWorksheet('TaiSan') ?? workbook.worksheets[0];

    if (!sheet) {
      throw new BadRequestException('Excel file does not contain any sheet');
    }

    const errors: Array<{ row: number; message: string }> = [];
    let success = 0;

    for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber += 1) {
      const row = sheet.getRow(rowNumber);
      const maTaiSan = this.cellText(row.getCell(1));
      const tenTaiSan = this.cellText(row.getCell(3));

      if (!maTaiSan && !tenTaiSan) {
        continue;
      }

      try {
        const nguyenGia = this.cellNumber(row.getCell(7));
        const haoMonPercent = this.cellNumber(row.getCell(8)) ?? 0;

        if (!maTaiSan || !tenTaiSan) {
          throw new BadRequestException('MaTaiSan and TenTaiSan are required');
        }

        if (nguyenGia === undefined) {
          throw new BadRequestException('NguyenGia is required');
        }

        await this.create(
          {
            maTaiSan,
            maQR: this.cellText(row.getCell(2)) || undefined,
            tenTaiSan,
            serial: this.cellText(row.getCell(4)) || undefined,
            model: this.cellText(row.getCell(5)) || undefined,
            maLoai: this.cellText(row.getCell(6)),
            nguyenGia,
            haoMonLuyKe: Math.round((nguyenGia * haoMonPercent) / 100),
            giaTriConLai: Math.max(
              0,
              nguyenGia - Math.round((nguyenGia * haoMonPercent) / 100),
            ),
            ngayNhap: this.cellDate(row.getCell(10)),
            maPhongBanHienTai: this.cellText(row.getCell(11)),
            trangThai: this.cellText(row.getCell(12)) as CreateAssetDto['trangThai'],
            soHieuTSCD: this.cellText(row.getCell(13)) || undefined,
            ghiChu: this.cellText(row.getCell(14)) || undefined,
          },
          user,
        );
        success += 1;
      } catch (error) {
        errors.push({
          row: rowNumber,
          message: error instanceof Error ? error.message : 'Import failed',
        });
      }
    }

    return {
      message: 'Import completed',
      success,
      failed: errors.length,
      errors,
    };
  }

  async report(query: QueryAssetsDto) {
    const where: string[] = [];
    const params: Array<string | number> = [];

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

    if (query.search) {
      where.push(
        `(ts.MaTaiSan LIKE ? OR ts.MaQR LIKE ? OR ts.TenTaiSan LIKE ? OR ts.Serial LIKE ? OR ts.SoHieuTSCD LIKE ?)`,
      );
      const keyword = `%${query.search}%`;
      params.push(keyword, keyword, keyword, keyword, keyword);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [summaryRows, categoryRows, departmentRows, statusRows] =
      await Promise.all([
        this.db.query<RowDataPacket[]>(
          `SELECT COUNT(*) AS totalAssets,
                  COALESCE(SUM(ts.NguyenGia), 0) AS totalOriginalValue,
                  COALESCE(SUM(ts.HaoMonLuyKe), 0) AS totalDepreciationValue,
                  COALESCE(SUM(ts.GiaTriConLai), 0) AS totalRemainingValue,
                  SUM(CASE WHEN ts.TrangThai = 'THANH_LY' THEN 1 ELSE 0 END) AS liquidatedAssets,
                  SUM(CASE WHEN ts.TrangThai <> 'THANH_LY' THEN 1 ELSE 0 END) AS activeAssets
           FROM TAI_SAN ts
           ${whereSql}`,
          params,
        ),
        this.db.query<RowDataPacket[]>(
          `SELECT ts.MaLoai AS maLoai, COALESCE(lts.TenLoai, ts.MaLoai) AS name,
                  COUNT(*) AS total,
                  COALESCE(SUM(ts.NguyenGia), 0) AS originalValue,
                  COALESCE(SUM(ts.GiaTriConLai), 0) AS remainingValue
           FROM TAI_SAN ts
           LEFT JOIN LOAI_TAI_SAN lts ON lts.MaLoai = ts.MaLoai
           ${whereSql}
           GROUP BY ts.MaLoai, lts.TenLoai
           ORDER BY total DESC, name`,
          params,
        ),
        this.db.query<RowDataPacket[]>(
          `SELECT ts.MaPhongBanHienTai AS maPhongBan,
                  COALESCE(pb.TenPhongBan, ts.MaPhongBanHienTai) AS name,
                  COUNT(*) AS total,
                  COALESCE(SUM(ts.NguyenGia), 0) AS originalValue,
                  COALESCE(SUM(ts.GiaTriConLai), 0) AS remainingValue
           FROM TAI_SAN ts
           LEFT JOIN PHONG_BAN pb ON pb.MaPhongBan = ts.MaPhongBanHienTai
           ${whereSql}
           GROUP BY ts.MaPhongBanHienTai, pb.TenPhongBan
           ORDER BY total DESC, name`,
          params,
        ),
        this.db.query<RowDataPacket[]>(
          `SELECT ts.TrangThai AS name,
                  COUNT(*) AS total,
                  COALESCE(SUM(ts.NguyenGia), 0) AS originalValue,
                  COALESCE(SUM(ts.GiaTriConLai), 0) AS remainingValue
           FROM TAI_SAN ts
           ${whereSql}
           GROUP BY ts.TrangThai
           ORDER BY total DESC, name`,
          params,
        ),
      ]);

    const summary = summaryRows[0][0] ?? {};

    return {
      summary: {
        totalAssets: Number(summary.totalAssets ?? 0),
        activeAssets: Number(summary.activeAssets ?? 0),
        liquidatedAssets: Number(summary.liquidatedAssets ?? 0),
        totalOriginalValue: Number(summary.totalOriginalValue ?? 0),
        totalDepreciationValue: Number(summary.totalDepreciationValue ?? 0),
        totalRemainingValue: Number(summary.totalRemainingValue ?? 0),
      },
      byCategory: this.mapReportRows(categoryRows[0]),
      byDepartment: this.mapReportRows(departmentRows[0]),
      byStatus: this.mapReportRows(statusRows[0]),
    };
  }

  private mapAsset(row: AssetRow) {
    return {
      ...row,
      nguyenGia: Number(row.nguyenGia ?? 0),
      haoMonLuyKe: Number(row.haoMonLuyKe ?? 0),
      giaTriConLai: Number(row.giaTriConLai ?? 0),
    };
  }

  private toDepreciationPercent(asset: { nguyenGia: number; haoMonLuyKe: number }) {
    if (!asset.nguyenGia) return 0;
    return Number(((asset.haoMonLuyKe / asset.nguyenGia) * 100).toFixed(2));
  }

  private mapReportRows(rows: RowDataPacket[]) {
    return rows.map((row) => ({
      id: String(row.maLoai ?? row.maPhongBan ?? row.name ?? ''),
      name: String(row.name ?? ''),
      total: Number(row.total ?? 0),
      originalValue: Number(row.originalValue ?? 0),
      remainingValue: Number(row.remainingValue ?? 0),
    }));
  }

  private async ensureUniqueAssetFields(
    dto: Partial<CreateAssetDto>,
    ignoreMaTaiSan?: string,
  ) {
    const checks: Array<[string, string | undefined]> = [
      ['MaTaiSan', dto.maTaiSan],
      ['MaQR', dto.maQR],
      ['Serial', dto.serial],
      ['SoHieuTSCD', dto.soHieuTSCD],
    ];

    for (const [column, value] of checks) {
      if (!value) continue;

      const params: string[] = [value];
      const ignoreSql = ignoreMaTaiSan ? ' AND MaTaiSan <> ?' : '';
      if (ignoreMaTaiSan) params.push(ignoreMaTaiSan);

      const [rows] = await this.db.execute<RowDataPacket[]>(
        `SELECT MaTaiSan FROM TAI_SAN WHERE ${column} = ?${ignoreSql} LIMIT 1`,
        params,
      );

      if (rows[0]) {
        throw new ConflictException(`${column} already exists`);
      }
    }
  }

  private buildAssetQrCode(maTaiSan: string) {
    return `QR-${maTaiSan.trim()}`;
  }

  private assignNullable(
    assignments: string[],
    params: Array<string | number | null>,
    column: string,
    value: string | undefined,
  ) {
    if (value === undefined) return;
    assignments.push(`${column} = ?`);
    params.push(this.nullIfBlank(value));
  }

  private assignNumber(
    assignments: string[],
    params: Array<string | number | null>,
    column: string,
    value: number | undefined,
  ) {
    if (value === undefined) return;
    assignments.push(`${column} = ?`);
    params.push(value);
  }

  private nullIfBlank(value: string | undefined) {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  }

  private styleExcelSheet(sheet: ExcelJS.Worksheet) {
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    sheet.views = [{ state: 'frozen', ySplit: 1 }];
  }

  private cellText(cell: ExcelJS.Cell) {
    const value = cell.value;
    if (value === null || value === undefined) return '';
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    if (typeof value === 'object' && 'text' in value) {
      return String(value.text).trim();
    }
    if (typeof value === 'object' && 'result' in value) {
      return String(value.result ?? '').trim();
    }
    return String(value).trim();
  }

  private cellNumber(cell: ExcelJS.Cell) {
    const text = this.cellText(cell);
    if (!text) return undefined;
    const value = Number(text);
    if (Number.isNaN(value)) {
      throw new BadRequestException(`Invalid number: ${text}`);
    }
    return value;
  }

  private cellDate(cell: ExcelJS.Cell) {
    const value = cell.value;
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    const text = this.cellText(cell);
    if (!text) {
      throw new BadRequestException('NgayNhap is required');
    }
    return text;
  }

  private async writeAudit(
    maNhanVien: string,
    hanhDong: string,
    targetId: string,
    chiTiet?: string,
  ) {
    await this.writeAuditWithConnection(
      this.db,
      maNhanVien,
      hanhDong,
      targetId,
      chiTiet,
    );
  }

  private async writeAuditWithConnection(
    connection: Pick<Pool, 'execute'>,
    maNhanVien: string,
    hanhDong: string,
    targetId: string,
    chiTiet?: string,
  ) {
    await connection.execute(
      `INSERT INTO AUDIT_LOG
       (MaNhanVien, HanhDong, DoiTuong, DoiTuongId, TrangThai, ChiTiet)
       VALUES (?, ?, 'TAI_SAN', ?, 'SUCCESS', ?)`,
      [maNhanVien, hanhDong, targetId, chiTiet ?? `${hanhDong}:${targetId}`],
    );
  }
}
