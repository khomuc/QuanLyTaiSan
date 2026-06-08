import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';

import type {
  Pool,
  PoolConnection,
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2/promise';

import { MYSQL_CONNECTION } from '../common/constants';

type DbExecutor = Pool | PoolConnection;

@Injectable()
export class InventoryService {
  constructor(
    @Inject(MYSQL_CONNECTION)
    private readonly db: Pool,
  ) { }

  // =====================
  // HELPERS
  // =====================

  private async rows<T extends RowDataPacket = RowDataPacket>(
    sql: string,
    params: any[] = [],
    executor: DbExecutor = this.db,
  ): Promise<T[]> {
    const [rows] = await executor.execute<T[]>(sql, params);
    return rows;
  }

  private async row<T extends RowDataPacket = RowDataPacket>(
    sql: string,
    params: any[] = [],
    executor: DbExecutor = this.db,
  ): Promise<T | null> {
    const rows = await this.rows<T>(sql, params, executor);
    return rows[0] || null;
  }

  private async execute(
    sql: string,
    params: any[] = [],
    executor: DbExecutor = this.db,
  ): Promise<ResultSetHeader> {
    const [result] = await executor.execute<ResultSetHeader>(sql, params);
    return result;
  }

  private validateRequired(value: any, message: string) {
    if (value === undefined || value === null || String(value).trim() === '') {
      throw new BadRequestException(message);
    }
  }

  private async ensureInventoryExists(
    maKiemKe: string,
    executor: DbExecutor = this.db,
  ) {
    this.validateRequired(maKiemKe, 'Thiếu mã kiểm kê');

    const inventory = await this.row(
      `
      SELECT *
      FROM PHIEU_KIEM_KE
      WHERE MaKiemKe = ?
      `,
      [maKiemKe],
      executor,
    );

    if (!inventory) {
      throw new NotFoundException('Không tìm thấy phiếu kiểm kê');
    }

    return inventory;
  }

  private async ensureAssetExists(
    maTaiSan: string,
    executor: DbExecutor = this.db,
  ) {
    this.validateRequired(maTaiSan, 'Thiếu mã tài sản');

    const asset = await this.row(
      `
      SELECT *
      FROM TAI_SAN
      WHERE MaTaiSan = ?
      `,
      [maTaiSan],
      executor,
    );

    if (!asset) {
      throw new NotFoundException('Không tìm thấy tài sản');
    }

    return asset;
  }

  private async ensureInventoryNotCompleted(
    maKiemKe: string,
    executor: DbExecutor = this.db,
  ) {
    const inventory = await this.ensureInventoryExists(maKiemKe, executor);

    if (inventory.TrangThai === 'COMPLETED') {
      throw new ConflictException(
        'Phiếu kiểm kê đã hoàn thành, không thể chỉnh sửa',
      );
    }

    return inventory;
  }

  // =====================
  // PHIEU KIEM KE
  // =====================

  async createInventory(
    ngayKiemKe: string,
    namKiemKe: number,
    nguoiLap: string,
    ghiChu?: string,
  ) {
    this.validateRequired(ngayKiemKe, 'Vui lòng nhập ngày kiểm kê');
    this.validateRequired(namKiemKe, 'Vui lòng nhập năm kiểm kê');
    this.validateRequired(nguoiLap, 'Vui lòng nhập người lập');

    const connection = await this.db.getConnection();

    try {
      await connection.beginTransaction();

      const nextRow = await this.row(
        `
        SELECT COALESCE(MAX(MaKiemKe), 0) + 1 AS nextId
        FROM PHIEU_KIEM_KE
        `,
        [],
        connection,
      );

      const maKiemKe = Number(nextRow?.nextId || 1);

      await this.execute(
        `
        INSERT INTO PHIEU_KIEM_KE
        (
          MaKiemKe,
          NgayKiemKe,
          NamKiemKe,
          GhiChu,
          NguoiLap,
          TrangThai
        )
        VALUES (?, ?, ?, ?, ?, 'DRAFT')
        `,
        [
          maKiemKe,
          ngayKiemKe,
          Number(namKiemKe),
          ghiChu || null,
          nguoiLap,
        ],
        connection,
      );

      await connection.commit();

      return {
        success: true,
        message: 'Tạo phiếu kiểm kê thành công',
        maKiemKe,
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async deleteInventory(maKiemKe: string) {
    const connection = await this.db.getConnection();

    try {
      await connection.beginTransaction();

      await this.ensureInventoryNotCompleted(maKiemKe, connection);

      await this.execute(
        `
        DELETE
        FROM CHI_TIET_PHIEU_KIEM_KE
        WHERE MaKiemKe = ?
        `,
        [maKiemKe],
        connection,
      );

      await this.execute(
        `
        DELETE
        FROM PHIEU_KIEM_KE_NHAN_VIEN
        WHERE MaKiemKe = ?
        `,
        [maKiemKe],
        connection,
      );

      const result = await this.execute(
        `
        DELETE
        FROM PHIEU_KIEM_KE
        WHERE MaKiemKe = ?
        `,
        [maKiemKe],
        connection,
      );

      if (!result.affectedRows) {
        throw new NotFoundException('Không tìm thấy phiếu kiểm kê');
      }

      await connection.commit();

      return {
        success: true,
        message: 'Xóa phiếu kiểm kê thành công',
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async getInventories() {
    return this.rows(
      `
      SELECT
        pkk.*,

        (
          SELECT COUNT(*)
          FROM TAI_SAN
        ) AS TongTaiSan,

        (
          SELECT COUNT(DISTINCT ct.MaTaiSan)
          FROM CHI_TIET_PHIEU_KIEM_KE ct
          WHERE ct.MaKiemKe = pkk.MaKiemKe
        ) AS DaKiemKe,

        CASE
          WHEN (
            SELECT COUNT(*)
            FROM TAI_SAN
          ) = 0 THEN 0
          ELSE ROUND(
            (
              (
                SELECT COUNT(DISTINCT ct.MaTaiSan)
                FROM CHI_TIET_PHIEU_KIEM_KE ct
                WHERE ct.MaKiemKe = pkk.MaKiemKe
              ) / (
                SELECT COUNT(*)
                FROM TAI_SAN
              )
            ) * 100,
            2
          )
        END AS TienDo

      FROM PHIEU_KIEM_KE pkk
      ORDER BY pkk.NgayKiemKe DESC, pkk.MaKiemKe DESC
      `,
    );
  }

  async getInventory(maKiemKe: string) {
    const inventory = await this.row(
      `
      SELECT
        pkk.*,

        (
          SELECT COUNT(*)
          FROM TAI_SAN
        ) AS TongTaiSan,

        (
          SELECT COUNT(DISTINCT ct.MaTaiSan)
          FROM CHI_TIET_PHIEU_KIEM_KE ct
          WHERE ct.MaKiemKe = pkk.MaKiemKe
        ) AS DaKiemKe

      FROM PHIEU_KIEM_KE pkk
      WHERE pkk.MaKiemKe = ?
      `,
      [maKiemKe],
    );

    if (!inventory) {
      throw new NotFoundException('Không tìm thấy phiếu kiểm kê');
    }

    const tongTaiSan = Number(inventory.TongTaiSan || 0);
    const daKiemKe = Number(inventory.DaKiemKe || 0);

    return {
      ...inventory,
      TienDo:
        tongTaiSan === 0
          ? 0
          : Number(((daKiemKe / tongTaiSan) * 100).toFixed(2)),
    };
  }

  async completeInventory(maKiemKe: string) {
    await this.ensureInventoryExists(maKiemKe);

    const progress = await this.getProgress(maKiemKe);

    if (progress.checkedAssets < progress.totalAssets) {
      throw new BadRequestException(
        'Chưa thể hoàn thành vì vẫn còn tài sản chưa kiểm kê',
      );
    }

    await this.execute(
      `
      UPDATE PHIEU_KIEM_KE
      SET TrangThai = 'COMPLETED'
      WHERE MaKiemKe = ?
      `,
      [maKiemKe],
    );

    return {
      success: true,
      message: 'Hoàn thành phiếu kiểm kê thành công',
    };
  }

  // =====================
  // THANH VIEN KIEM KE
  // =====================

  async assignMember(
    maKiemKe: string,
    maNhanVien: string,
    tenVaiTro: string,
  ) {
    await this.ensureInventoryNotCompleted(maKiemKe);

    this.validateRequired(maNhanVien, 'Thiếu mã nhân viên');
    this.validateRequired(tenVaiTro, 'Thiếu vai trò kiểm kê');

    const employee = await this.row(
      `
      SELECT MaNhanVien
      FROM NHAN_VIEN
      WHERE MaNhanVien = ?
      `,
      [maNhanVien],
    );

    if (!employee) {
      throw new NotFoundException('Không tìm thấy nhân viên');
    }

    await this.execute(
      `
      INSERT INTO PHIEU_KIEM_KE_NHAN_VIEN
      (
        MaKiemKe,
        MaNhanVien,
        TenVaiTro,
        ThoiGianKy
      )
      VALUES (?, ?, ?, NULL)
      ON DUPLICATE KEY UPDATE
        TenVaiTro = VALUES(TenVaiTro)
      `,
      [maKiemKe, maNhanVien, tenVaiTro],
    );

    return {
      success: true,
      message: 'Thêm thành viên kiểm kê thành công',
    };
  }

  async getMembers(maKiemKe: string) {
    await this.ensureInventoryExists(maKiemKe);

    return this.rows(
      `
      SELECT
        nv.MaNhanVien,
        nv.HoTen,
        nv.ChucVu,
        nv.Email,
        pknv.TenVaiTro,
        pknv.ThoiGianKy
      FROM PHIEU_KIEM_KE_NHAN_VIEN pknv
      INNER JOIN NHAN_VIEN nv
        ON nv.MaNhanVien = pknv.MaNhanVien
      WHERE pknv.MaKiemKe = ?
      ORDER BY nv.HoTen
      `,
      [maKiemKe],
    );
  }

  async removeMember(maKiemKe: string, maNhanVien: string) {
    await this.ensureInventoryNotCompleted(maKiemKe);

    this.validateRequired(maNhanVien, 'Thiếu mã nhân viên');

    const result = await this.execute(
      `
      DELETE
      FROM PHIEU_KIEM_KE_NHAN_VIEN
      WHERE MaKiemKe = ?
      AND MaNhanVien = ?
      `,
      [maKiemKe, maNhanVien],
    );

    if (!result.affectedRows) {
      throw new NotFoundException('Không tìm thấy thành viên trong phiếu');
    }

    return {
      success: true,
      message: 'Xóa thành viên kiểm kê thành công',
    };
  }

  // =====================
  // QUET QR
  // =====================

  async scanAsset(maTaiSan: string) {
    this.validateRequired(maTaiSan, 'Thiếu mã tài sản');

    const asset = await this.row(
      `
      SELECT
        ts.MaTaiSan,
        ts.TenTaiSan,
        ts.NguyenGia,
        ts.TrangThai,
        ts.MaPhongBanHienTai,
        ts.MaLoai,

        pb.TenPhongBan,
        lts.TenLoai
      FROM TAI_SAN ts
      LEFT JOIN PHONG_BAN pb
        ON pb.MaPhongBan = ts.MaPhongBanHienTai
      LEFT JOIN LOAI_TAI_SAN lts
        ON lts.MaLoai = ts.MaLoai
      WHERE ts.MaTaiSan = ?
      `,
      [maTaiSan],
    );

    if (!asset) {
      throw new NotFoundException('Không tìm thấy tài sản');
    }

    return asset;
  }

  async scanAssetInInventory(maKiemKe: string, maTaiSan: string) {
    await this.ensureInventoryExists(maKiemKe);

    const asset = await this.scanAsset(maTaiSan);

    const scanDetail = await this.row(
      `
      SELECT
        ct.ThoiGianQuet,
        ct.TinhTrangThucTe,
        ct.ViTriHienTai,
        ct.GhiChu
      FROM CHI_TIET_PHIEU_KIEM_KE ct
      WHERE ct.MaKiemKe = ?
      AND ct.MaTaiSan = ?
      `,
      [maKiemKe, maTaiSan],
    );

    return {
      ...asset,
      DaQuet: scanDetail ? 1 : 0,
      ThoiGianQuet: scanDetail?.ThoiGianQuet || null,
      TinhTrangThucTe: scanDetail?.TinhTrangThucTe || null,
      ViTriHienTai: scanDetail?.ViTriHienTai || asset.TenPhongBan || null,
      GhiChu: scanDetail?.GhiChu || null,
    };
  }

  async updateAsset(
    maKiemKe: string,
    maTaiSan: string,
    haoMonLuyKe: string,
    viTriHienTai: string,
    ghiChu?: string,
  ) {
    await this.ensureInventoryNotCompleted(maKiemKe);
    await this.ensureAssetExists(maTaiSan);

    this.validateRequired(viTriHienTai, 'Vui lòng nhập vị trí hiện tại');

    await this.execute(
      `
      INSERT INTO CHI_TIET_PHIEU_KIEM_KE
      (
        MaKiemKe,
        MaTaiSan,
        TinhTrangThucTe,
        ThoiGianQuet,
        ViTriHienTai,
        GhiChu
      )
      VALUES (?, ?, NOW(), ?, ?)
      ON DUPLICATE KEY UPDATE
        ThoiGianQuet = NOW(),
        ViTriHienTai = VALUES(ViTriHienTai),
        GhiChu = VALUES(GhiChu)
      `,
      [
        maKiemKe,
        maTaiSan,
        haoMonLuyKe,
        viTriHienTai,
        ghiChu || null,
      ],
    );

    return {
      success: true,
      message: 'Cập nhật kiểm kê tài sản thành công',
      maKiemKe,
      maTaiSan,
    };
  }

  async undoScan(maKiemKe: string, maTaiSan: string) {
    await this.ensureInventoryNotCompleted(maKiemKe);
    await this.ensureAssetExists(maTaiSan);

    const result = await this.execute(
      `
      DELETE
      FROM CHI_TIET_PHIEU_KIEM_KE
      WHERE MaKiemKe = ?
      AND MaTaiSan = ?
      `,
      [maKiemKe, maTaiSan],
    );

    if (!result.affectedRows) {
      throw new NotFoundException('Tài sản này chưa được quét trong phiếu');
    }

    return {
      success: true,
      message: 'Hoàn tác quét tài sản thành công',
    };
  }

  // =====================
  // TIEN DO KIEM KE
  // =====================

  async getProgress(maKiemKe: string) {
    await this.ensureInventoryExists(maKiemKe);

    const totalRow = await this.row(
      `
      SELECT COUNT(*) AS totalAssets
      FROM TAI_SAN
      `,
    );

    const checkedRow = await this.row(
      `
      SELECT COUNT(DISTINCT MaTaiSan) AS checkedAssets
      FROM CHI_TIET_PHIEU_KIEM_KE
      WHERE MaKiemKe = ?
      `,
      [maKiemKe],
    );

    const totalAssets = Number(totalRow?.totalAssets || 0);
    const checkedAssets = Number(checkedRow?.checkedAssets || 0);

    return {
      totalAssets,
      checkedAssets,
      remainingAssets: Math.max(totalAssets - checkedAssets, 0),
      percent:
        totalAssets === 0
          ? 0
          : Number(((checkedAssets / totalAssets) * 100).toFixed(2)),
    };
  }

  // =====================
  // BAO CAO
  // =====================

  async getMissingAssets(maKiemKe: string) {
    await this.ensureInventoryExists(maKiemKe);

    return this.rows(
      `
      SELECT
        ts.MaTaiSan,
        ts.TenTaiSan,
        ts.NguyenGia,
        ts.TrangThai,

        pb.MaPhongBan,
        pb.TenPhongBan,

        lts.TenLoai
      FROM TAI_SAN ts
      LEFT JOIN CHI_TIET_PHIEU_KIEM_KE ct
        ON ct.MaTaiSan = ts.MaTaiSan
        AND ct.MaKiemKe = ?
      LEFT JOIN PHONG_BAN pb
        ON pb.MaPhongBan = ts.MaPhongBanHienTai
      LEFT JOIN LOAI_TAI_SAN lts
        ON lts.MaLoai = ts.MaLoai
      WHERE ct.MaTaiSan IS NULL
      ORDER BY ts.TenTaiSan
      `,
      [maKiemKe],
    );
  }

  async getWrongLocation(maKiemKe: string) {
    await this.ensureInventoryExists(maKiemKe);

    return this.rows(
      `
      SELECT
        ts.MaTaiSan,
        ts.TenTaiSan,

        pb.TenPhongBan AS ViTriHeThong,
        ct.ViTriHienTai,
        ct.ThoiGianQuet,
        ct.TinhTrangThucTe
      FROM CHI_TIET_PHIEU_KIEM_KE ct
      INNER JOIN TAI_SAN ts
        ON ts.MaTaiSan = ct.MaTaiSan
      LEFT JOIN PHONG_BAN pb
        ON pb.MaPhongBan = ts.MaPhongBanHienTai
      WHERE ct.MaKiemKe = ?
      AND TRIM(COALESCE(ct.ViTriHienTai, '')) <>
          TRIM(COALESCE(pb.TenPhongBan, ''))
      ORDER BY ct.ThoiGianQuet DESC
      `,
      [maKiemKe],
    );
  }

  async getSummary(maKiemKe: string) {
    await this.ensureInventoryExists(maKiemKe);

    const [progress, missing, wrongLocation] = await Promise.all([
      this.getProgress(maKiemKe),
      this.getMissingAssets(maKiemKe),
      this.getWrongLocation(maKiemKe),
    ]);

    return {
      tongTaiSan: progress.totalAssets,
      daKiemKe: progress.checkedAssets,
      chuaKiemKe: missing.length,
      saiViTri: wrongLocation.length,
      tienDo: progress.percent,
    };
  }

  async getAssets(maKiemKe: string) {
    await this.ensureInventoryExists(maKiemKe);

    return this.rows(
      `
      SELECT
        ts.MaTaiSan,
        ts.TenTaiSan,
        ts.NguyenGia,
        ts.TrangThai,
        ts.HaoMonLuyKe,
        ts.GiaTriConLai,
        ts.SoHieuTSCD,
        ts.MaQR,

        pb.MaPhongBan,
        pb.TenPhongBan,

        lts.TenLoai,

        ct.ThoiGianQuet,
        ct.TinhTrangThucTe,
        ct.ViTriHienTai,
        ct.GhiChu,

        CASE
          WHEN ct.MaTaiSan IS NULL THEN 0
          ELSE 1
        END AS DaQuet
      FROM TAI_SAN ts
      LEFT JOIN CHI_TIET_PHIEU_KIEM_KE ct
        ON ct.MaTaiSan = ts.MaTaiSan
        AND ct.MaKiemKe = ?
      LEFT JOIN PHONG_BAN pb
        ON pb.MaPhongBan = ts.MaPhongBanHienTai
      LEFT JOIN LOAI_TAI_SAN lts
        ON lts.MaLoai = ts.MaLoai
      ORDER BY
        DaQuet DESC,
        ts.TenTaiSan
      `,
      [maKiemKe],
    );
  }

  async getScannedAssets(maKiemKe: string) {
    await this.ensureInventoryExists(maKiemKe);

    return this.rows(
      `
      SELECT
        ts.MaTaiSan,
        ts.TenTaiSan,
        ts.NguyenGia,
        ts.TrangThai,

        pb.TenPhongBan AS ViTriHeThong,
        lts.TenLoai,

        ct.ThoiGianQuet,
        ct.TinhTrangThucTe,
        ct.ViTriHienTai,
        ct.GhiChu
      FROM CHI_TIET_PHIEU_KIEM_KE ct
      INNER JOIN TAI_SAN ts
        ON ts.MaTaiSan = ct.MaTaiSan
      LEFT JOIN PHONG_BAN pb
        ON pb.MaPhongBan = ts.MaPhongBanHienTai
      LEFT JOIN LOAI_TAI_SAN lts
        ON lts.MaLoai = ts.MaLoai
      WHERE ct.MaKiemKe = ?
      ORDER BY ct.ThoiGianQuet DESC
      `,
      [maKiemKe],
    );
  }

  private extractAssetCodeFromQrText(qrText: string) {
    const raw = String(qrText || '').trim();

    if (!raw) {
      throw new BadRequestException('QR không hợp lệ');
    }

    try {
      const url = new URL(raw);

      const queryCode =
        url.searchParams.get('maTaiSan') ||
        url.searchParams.get('MaTaiSan') ||
        url.searchParams.get('assetCode') ||
        url.searchParams.get('code');

      if (queryCode) {
        return queryCode.trim();
      }

      const parts = url.pathname.split('/').filter(Boolean);
      return decodeURIComponent(parts[parts.length - 1] || raw);
    } catch {
      return raw;
    }
  }

  async getDepartments() {
    const [rows] = await this.db.query<RowDataPacket[]>(
      `
    SELECT
      MaPhongBan,
      TenPhongBan
    FROM PHONG_BAN
    ORDER BY TenPhongBan
    `,
    );

    return rows;
  }

  async scanQrUrlInInventory(
    maKiemKe: string,
    qrText: string,
  ) {
    await this.ensureInventoryExists(maKiemKe);

    const assetCode = this.extractAssetCodeFromQrText(qrText);

    const [rows] = await this.db.query<RowDataPacket[]>(
      `
    SELECT
      ts.MaTaiSan,
      ts.MaQR,
      ts.TenTaiSan,
      ts.NguyenGia,
      ts.HaoMonLuyKe,
      ts.GiaTriConLai,
      ts.SoHieuTSCD,
      ts.TrangThai,
      ts.MaPhongBanHienTai,
      ts.MaLoai,

      pb.TenPhongBan,
      lts.TenLoai,

      ct.ThoiGianQuet,
      ct.TinhTrangThucTe,
      ct.ViTriHienTai,
      ct.GhiChu,

      CASE
        WHEN ct.MaTaiSan IS NULL THEN 0
        ELSE 1
      END AS DaQuet

    FROM TAI_SAN ts

    LEFT JOIN PHONG_BAN pb
      ON pb.MaPhongBan = ts.MaPhongBanHienTai

    LEFT JOIN LOAI_TAI_SAN lts
      ON lts.MaLoai = ts.MaLoai

    LEFT JOIN CHI_TIET_PHIEU_KIEM_KE ct
      ON ct.MaTaiSan = ts.MaTaiSan
      AND ct.MaKiemKe = ?

    WHERE
      ts.MaTaiSan = ?
      OR ts.MaQR = ?
      OR ts.MaQR LIKE ?
    LIMIT 1
    `,
      [
        maKiemKe,
        assetCode,
        qrText,
        `%${assetCode}%`,
      ],
    );

    if (!rows.length) {
      throw new NotFoundException('Không tìm thấy tài sản từ mã QR');
    }

    return rows[0];
  }

  async getReport(maKiemKe: string) {
    const inventory = await this.getInventory(maKiemKe);

    const [
      summary,
      allAssets,
      scannedAssets,
      missingAssets,
      wrongLocationAssets,
      members,
    ] = await Promise.all([
      this.getSummary(maKiemKe),
      this.getAssets(maKiemKe),
      this.getScannedAssets(maKiemKe),
      this.getMissingAssets(maKiemKe),
      this.getWrongLocation(maKiemKe),
      this.getMembers(maKiemKe).catch(() => []),
    ]);

    return {
      inventory,
      summary,
      members,
      assets: {
        all: allAssets,
        scanned: scannedAssets,
        missing: missingAssets,
        wrongLocation: wrongLocationAssets,
      },
      generatedAt: new Date(),
    };
  }
}
