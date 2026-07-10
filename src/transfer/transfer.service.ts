import { BadRequestException, Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { Pool, PoolConnection } from 'mysql2/promise';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { ApprovalTransferDto } from './dto/approval-transfer.dto';
import { CreateTransferSlipDto } from './dto/create-transfer-slip.dto';
import { UpdateTransferSlipDto } from './dto/update-transfer-slip.dto';
import { ConfirmReceiptDto } from './dto/confirm-receipt.dto';

type TransferSlipStatus = 'CHO_KY' | 'DA_DUYET' | 'HOAN_THANH' | 'TU_CHOI';
type SignatureStatus = 'CHO_KY' | 'DA_KY' | 'TU_CHOI';

interface AssetRow extends RowDataPacket {
  MaTaiSan: string;
  MaQR: string | null;
  TenTaiSan: string;
  MaPhongBanHienTai: string;
}

interface AssetListRow extends RowDataPacket {
  MaTaiSan: string;
  MaQR: string | null;
  TenTaiSan: string;
  MaPhongBanHienTai: string;
  TenPhongBan: string | null;
}

interface DepartmentRow extends RowDataPacket {
  MaPhongBan: string;
  TenPhongBan: string;
}

interface EmployeeRow extends RowDataPacket {
  MaNhanVien: string;
  HoTen: string;
  ChucVu: string | null;
  TenVaiTro: string | null;
  MaPhongBan: string;
  TenPhongBan: string | null;
}

interface SlipRow extends RowDataPacket {
  SoPhieu: string;
  NgayDieuChuyen: string;
  TrangThaiDuyet: TransferSlipStatus;
  GhiChu: string | null;
  NgayLap: string;
  NguoiLap: string;
  NguoiLapTen: string | null;
}

interface SlipItemRow extends RowDataPacket {
  SoPhieu: string;
  MaTaiSan: string;
  MaQR: string | null;
  TenTaiSan: string;
  TuPhongBan: string;
  TuPhongBanTen: string | null;
  DenPhongBan: string;
  DenPhongBanTen: string | null;
  LyDo: string | null;
  TrangThaiNhan: string;
  GhiChuNhan: string | null;
  CreatedAt: string;
}

interface ApprovalRow extends RowDataPacket {
  SoPhieu: string;
  MaNhanVien: string;
  HoTen: string | null;
  VongKy: number;
  TenVaiTro: string | null;
  ThoiGianKy: string | null;
  TrangThaiKy: SignatureStatus;
  LyDoTuChoi: string | null;
}

@Injectable()
export class TransferService {
  constructor(
    @Inject('MYSQL_CONNECTION')
    private readonly dbConnection: Pool,
  ) {}

  async createSlip(dto: CreateTransferSlipDto) {
    if (!dto?.nguoiLap) {
      throw new BadRequestException('Nguoi lap khong duoc de trong');
    }

    if (!Array.isArray(dto.danhSachTaiSan) || dto.danhSachTaiSan.length === 0) {
      throw new BadRequestException('Phai co it nhat mot tai san de dieu chuyen');
    }

    const connection = await this.dbConnection.getConnection();
    await connection.beginTransaction();

    try {
      const soPhieu = await this.generateSlipNumber(connection);
      // Use UTC+7 (Vietnam timezone) to avoid date rollback after 17:00 local time
      const nowUtc7 = new Date(Date.now() + 7 * 60 * 60 * 1000);
      const ngayDieuChuyen = dto.ngayDieuChuyen ?? nowUtc7.toISOString().slice(0, 10);

      await connection.execute(
        `INSERT INTO PHIEU_DIEU_CHUYEN (SoPhieu, NgayDieuChuyen, TrangThaiDuyet, GhiChu, NguoiLap)
         VALUES (?, ?, 'CHO_KY', ?, ?)`,
        [soPhieu, ngayDieuChuyen, dto.ghiChu ?? null, dto.nguoiLap],
      );

      for (const item of dto.danhSachTaiSan) {
        const asset = await this.resolveAsset(item.maTaiSan, item.maQR, connection);
        const destination = item.denPhongBan?.trim();

        if (!destination) {
          throw new BadRequestException('Phong ban den khong duoc de trong');
        }

        const [departmentRows] = await connection.query<RowDataPacket[]>(
          'SELECT MaPhongBan FROM PHONG_BAN WHERE MaPhongBan = ? LIMIT 1',
          [destination],
        );

        if (departmentRows.length === 0) {
          throw new BadRequestException(`Khong tim thay phong ban den: ${destination}`);
        }

        if (asset.MaPhongBanHienTai === destination) {
          throw new BadRequestException(`Tai san ${asset.MaTaiSan} da nam tai phong ban nay`);
        }

        await connection.execute(
          `INSERT INTO CHI_TIET_PHIEU_DIEU_CHUYEN (SoPhieu, MaTaiSan, TuPhongBan, DenPhongBan, LyDo)
           VALUES (?, ?, ?, ?, ?)`,
          [soPhieu, asset.MaTaiSan, asset.MaPhongBanHienTai, destination, item.lyDo ?? dto.ghiChu ?? null],
        );
      }

      if (Array.isArray(dto.danhSachKyDuyet) && dto.danhSachKyDuyet.length > 0) {
        for (const approver of dto.danhSachKyDuyet) {
          const [employeeRows] = await connection.query<RowDataPacket[]>(
            'SELECT MaNhanVien FROM NHAN_VIEN WHERE MaNhanVien = ? LIMIT 1',
            [approver.maNhanVien],
          );

          if (employeeRows.length === 0) {
            throw new BadRequestException(`Khong tim thay nhan vien ky duyet: ${approver.maNhanVien}`);
          }

          await connection.execute(
            `INSERT INTO PHIEU_DIEU_CHUYEN_NHAN_VIEN (SoPhieu, MaNhanVien, VongKy, TenVaiTro, TrangThaiKy)
             VALUES (?, ?, ?, ?, 'CHO_KY')`,
            [
              soPhieu,
              approver.maNhanVien,
              approver.vongKy ?? 1,
              approver.tenVaiTro ?? null,
            ],
          );
        }
      }

      await connection.commit();
      return this.getSlipDetail(soPhieu);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async listAssets(search?: string, maPhongBanHienTai?: string) {
    const params: Array<string> = [];
    const conditions: string[] = [];

    if (search?.trim()) {
      const keyword = `%${search.trim()}%`;
      conditions.push('(ts.MaTaiSan LIKE ? OR ts.MaQR LIKE ? OR ts.TenTaiSan LIKE ? OR pb.TenPhongBan LIKE ?)');
      params.push(keyword, keyword, keyword, keyword);
    }

    if (maPhongBanHienTai?.trim()) {
      conditions.push('ts.MaPhongBanHienTai = ?');
      params.push(maPhongBanHienTai.trim());
    }

    const [rows] = await this.dbConnection.query<AssetListRow[]>(
      `SELECT ts.MaTaiSan, ts.MaQR, ts.TenTaiSan, ts.MaPhongBanHienTai, pb.TenPhongBan
       FROM TAI_SAN ts
       LEFT JOIN PHONG_BAN pb ON pb.MaPhongBan = ts.MaPhongBanHienTai
       ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''}
       ORDER BY ts.TenTaiSan ASC
       LIMIT 20`,
      params,
    );

    return rows;
  }

  async listDepartments(search?: string) {
    const params: Array<string> = [];
    const conditions: string[] = [];

    if (search?.trim()) {
      const keyword = `%${search.trim()}%`;
      conditions.push('(MaPhongBan LIKE ? OR TenPhongBan LIKE ?)');
      params.push(keyword, keyword);
    }

    const [rows] = await this.dbConnection.query<DepartmentRow[]>(
      `SELECT MaPhongBan, TenPhongBan
       FROM PHONG_BAN
       ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''}
       ORDER BY MaPhongBan ASC
       LIMIT 20`,
      params,
    );

    return rows;
  }

  async listEmployees(search?: string) {
    const params: Array<string> = [];
    const conditions: string[] = [];

    if (search?.trim()) {
      const keyword = `%${search.trim()}%`;
      conditions.push('(nv.MaNhanVien LIKE ? OR nv.HoTen LIKE ? OR nv.ChucVu LIKE ? OR vt.TenVaiTro LIKE ? OR pb.TenPhongBan LIKE ?)');
      params.push(keyword, keyword, keyword, keyword, keyword);
    }

    const [rows] = await this.dbConnection.query<EmployeeRow[]>(
      `SELECT nv.MaNhanVien, nv.HoTen, nv.ChucVu, vt.TenVaiTro, nv.MaPhongBan, pb.TenPhongBan
       FROM NHAN_VIEN nv
       LEFT JOIN VAI_TRO vt ON vt.MaVaiTro = nv.MaVaiTro
       LEFT JOIN PHONG_BAN pb ON pb.MaPhongBan = nv.MaPhongBan
       ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''}
       ORDER BY nv.MaNhanVien ASC
       LIMIT 20`,
      params,
    );

    return rows;
  }

  async listSlips(filters: { trangThai?: string; tuNgay?: string; denNgay?: string; maPhongBan?: string }) {
    const conditions: string[] = [];
    const params: Array<string> = [];

    if (filters.trangThai) {
      conditions.push('p.TrangThaiDuyet = ?');
      params.push(filters.trangThai);
    }

    if (filters.tuNgay) {
      conditions.push('p.NgayDieuChuyen >= ?');
      params.push(filters.tuNgay);
    }

    if (filters.denNgay) {
      conditions.push('p.NgayDieuChuyen <= ?');
      params.push(filters.denNgay);
    }

    if (filters.maPhongBan) {
      conditions.push('(ct.TuPhongBan = ? OR ct.DenPhongBan = ?)');
      params.push(filters.maPhongBan, filters.maPhongBan);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [rows] = await this.dbConnection.query<SlipRow[]>(
      `SELECT p.SoPhieu, p.NgayDieuChuyen, p.TrangThaiDuyet, p.GhiChu, p.NgayLap, p.NguoiLap,
              nv.HoTen AS NguoiLapTen,
              COUNT(DISTINCT ct.MaTaiSan) AS TongTaiSan
       FROM PHIEU_DIEU_CHUYEN p
       LEFT JOIN NHAN_VIEN nv ON nv.MaNhanVien = p.NguoiLap
       LEFT JOIN CHI_TIET_PHIEU_DIEU_CHUYEN ct ON ct.SoPhieu = p.SoPhieu
       ${whereClause}
       GROUP BY p.SoPhieu, p.NgayDieuChuyen, p.TrangThaiDuyet, p.GhiChu, p.NgayLap, p.NguoiLap, nv.HoTen
       ORDER BY p.NgayLap DESC, p.SoPhieu DESC`,
      params,
    );

    return rows;
  }

  async getSlipDetail(soPhieu: string) {
    const slip = await this.findSlip(soPhieu);
    const [items] = await this.dbConnection.query<SlipItemRow[]>(
      `SELECT ct.SoPhieu, ct.MaTaiSan, ts.MaQR, COALESCE(ts.TenTaiSan, CONCAT('Tài sản ', ct.MaTaiSan)) AS TenTaiSan, ct.TuPhongBan, pbTu.TenPhongBan AS TuPhongBanTen,
              ct.DenPhongBan, pbDen.TenPhongBan AS DenPhongBanTen, ct.LyDo, ct.TrangThaiNhan, ct.GhiChuNhan, ct.CreatedAt
       FROM CHI_TIET_PHIEU_DIEU_CHUYEN ct
       LEFT JOIN TAI_SAN ts ON ts.MaTaiSan = ct.MaTaiSan
       LEFT JOIN PHONG_BAN pbTu ON pbTu.MaPhongBan = ct.TuPhongBan
       LEFT JOIN PHONG_BAN pbDen ON pbDen.MaPhongBan = ct.DenPhongBan
       WHERE ct.SoPhieu = ?
       ORDER BY ct.CreatedAt ASC, ct.MaTaiSan ASC`,
      [soPhieu],
    );

    const [approvals] = await this.dbConnection.query<ApprovalRow[]>(
      `SELECT nv.SoPhieu, nv.MaNhanVien, nv.VongKy, nv.TenVaiTro, nv.ThoiGianKy, nv.TrangThaiKy, nv.LyDoTuChoi,
              nvien.HoTen
       FROM PHIEU_DIEU_CHUYEN_NHAN_VIEN nv
       LEFT JOIN NHAN_VIEN nvien ON nvien.MaNhanVien = nv.MaNhanVien
       WHERE nv.SoPhieu = ?
       ORDER BY nv.VongKy ASC, nv.ThoiGianKy ASC, nv.MaNhanVien ASC`,
      [soPhieu],
    );

    return {
      ...slip,
      items,
      approvals,
    };
  }

  async updateSlip(soPhieu: string, dto: UpdateTransferSlipDto) {
    const slip = await this.findSlip(soPhieu);

    if (slip.TrangThaiDuyet !== 'CHO_KY') {
      throw new BadRequestException('Chi co the sua phieu dang cho ky');
    }

    const connection = await this.dbConnection.getConnection();
    await connection.beginTransaction();

    try {
      const ngayDieuChuyen = dto.ngayDieuChuyen ?? slip.NgayDieuChuyen;

      await connection.execute(
        `UPDATE PHIEU_DIEU_CHUYEN
         SET NgayDieuChuyen = ?, GhiChu = ?
         WHERE SoPhieu = ?`,
        [ngayDieuChuyen, dto.ghiChu ?? slip.GhiChu, soPhieu],
      );

      if (Array.isArray(dto.danhSachTaiSan)) {
        await connection.execute('DELETE FROM CHI_TIET_PHIEU_DIEU_CHUYEN WHERE SoPhieu = ?', [soPhieu]);

        for (const item of dto.danhSachTaiSan) {
          const asset = await this.resolveAsset(item.maTaiSan, item.maQR, connection);
          const destination = item.denPhongBan?.trim();

          if (!destination) {
            throw new BadRequestException('Phong ban den khong duoc de trong');
          }

          await connection.execute(
            `INSERT INTO CHI_TIET_PHIEU_DIEU_CHUYEN (SoPhieu, MaTaiSan, TuPhongBan, DenPhongBan, LyDo)
             VALUES (?, ?, ?, ?, ?)`,
            [soPhieu, asset.MaTaiSan, asset.MaPhongBanHienTai, destination, item.lyDo ?? dto.ghiChu ?? null],
          );
        }
      }

      if (Array.isArray(dto.danhSachKyDuyet)) {
        await connection.execute('DELETE FROM PHIEU_DIEU_CHUYEN_NHAN_VIEN WHERE SoPhieu = ?', [soPhieu]);

        for (const approver of dto.danhSachKyDuyet) {
          await connection.execute(
            `INSERT INTO PHIEU_DIEU_CHUYEN_NHAN_VIEN (SoPhieu, MaNhanVien, VongKy, TenVaiTro, TrangThaiKy)
             VALUES (?, ?, ?, ?, 'CHO_KY')`,
            [soPhieu, approver.maNhanVien, approver.vongKy ?? 1, approver.tenVaiTro ?? null],
          );
        }
      }

      await connection.commit();
      return this.getSlipDetail(soPhieu);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async deleteSlip(soPhieu: string) {
    const slip = await this.findSlip(soPhieu);

    if (slip.TrangThaiDuyet !== 'CHO_KY') {
      throw new BadRequestException('Chi co the xoa phieu dang cho ky');
    }

    const [result] = await this.dbConnection.execute<ResultSetHeader>(
      'DELETE FROM PHIEU_DIEU_CHUYEN WHERE SoPhieu = ?',
      [soPhieu],
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException('Khong tim thay phieu dieu chuyen');
    }

    return { message: 'Da xoa phieu dieu chuyen', soPhieu };
  }

  async approveSlip(soPhieu: string, dto: ApprovalTransferDto) {
    if (!dto?.maNhanVien) {
      throw new BadRequestException('Ma nhan vien ky duyet khong duoc de trong');
    }

    if (!dto.hanhDong) {
      throw new BadRequestException('Hanh dong ky duyet khong duoc de trong');
    }

    const slip = await this.findSlip(soPhieu);

    if (slip.TrangThaiDuyet !== 'CHO_KY') {
      throw new BadRequestException('Phieu nay da duoc xu ly');
    }

    const vongKy = dto.vongKy ?? 1;

    const connection = await this.dbConnection.getConnection();
    await connection.beginTransaction();

    try {
      const [signatureRows] = await connection.query<RowDataPacket[]>(
        `SELECT SoPhieu, MaNhanVien, VongKy
         FROM PHIEU_DIEU_CHUYEN_NHAN_VIEN
         WHERE SoPhieu = ? AND MaNhanVien = ? AND VongKy = ?
         LIMIT 1`,
        [soPhieu, dto.maNhanVien, vongKy],
      );

      if (signatureRows.length === 0) {
        await connection.execute(
          `INSERT INTO PHIEU_DIEU_CHUYEN_NHAN_VIEN (SoPhieu, MaNhanVien, VongKy, TenVaiTro, ThoiGianKy, TrangThaiKy, LyDoTuChoi)
           VALUES (?, ?, ?, ?, NOW(), ?, ?)`,
          [
            soPhieu,
            dto.maNhanVien,
            vongKy,
            dto.tenVaiTro ?? null,
            dto.hanhDong,
            dto.hanhDong === 'TU_CHOI' ? dto.lyDoTuChoi ?? null : null,
          ],
        );
      } else {
        await connection.execute(
          `UPDATE PHIEU_DIEU_CHUYEN_NHAN_VIEN
           SET TenVaiTro = ?, ThoiGianKy = NOW(), TrangThaiKy = ?, LyDoTuChoi = ?
           WHERE SoPhieu = ? AND MaNhanVien = ? AND VongKy = ?`,
          [
            dto.tenVaiTro ?? null,
            dto.hanhDong,
            dto.hanhDong === 'TU_CHOI' ? dto.lyDoTuChoi ?? null : null,
            soPhieu,
            dto.maNhanVien,
            vongKy,
          ],
        );
      }

      if (dto.hanhDong === 'TU_CHOI') {
        await connection.execute(
          `UPDATE PHIEU_DIEU_CHUYEN SET TrangThaiDuyet = 'TU_CHOI' WHERE SoPhieu = ?`,
          [soPhieu],
        );
        await connection.commit();
        return this.getSlipDetail(soPhieu);
      }

      const [pendingRows] = await connection.query<RowDataPacket[]>(
        `SELECT COUNT(*) AS TongPending
         FROM PHIEU_DIEU_CHUYEN_NHAN_VIEN
         WHERE SoPhieu = ? AND TrangThaiKy = 'CHO_KY'`,
        [soPhieu],
      );

      const totalPending = Number(pendingRows[0]?.TongPending ?? 0);

      if (totalPending === 0) {
        await this.finalizeTransfer(soPhieu, connection);
      }

      await connection.commit();
      return this.getSlipDetail(soPhieu);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async historyReport(filters: { tuNgay?: string; denNgay?: string; maPhongBan?: string }) {
    const conditions: string[] = ["p.TrangThaiDuyet = 'DA_DUYET'"];
    const params: Array<string> = [];

    if (filters.tuNgay) {
      conditions.push('p.NgayDieuChuyen >= ?');
      params.push(filters.tuNgay);
    }

    if (filters.denNgay) {
      conditions.push('p.NgayDieuChuyen <= ?');
      params.push(filters.denNgay);
    }

    if (filters.maPhongBan) {
      conditions.push('(ct.TuPhongBan = ? OR ct.DenPhongBan = ?)');
      params.push(filters.maPhongBan, filters.maPhongBan);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const [historyRows] = await this.dbConnection.query<RowDataPacket[]>(
      `SELECT p.SoPhieu, p.NgayDieuChuyen, ct.MaTaiSan, ts.TenTaiSan,
              ct.TuPhongBan, pbTu.TenPhongBan AS TuPhongBanTen,
              ct.DenPhongBan, pbDen.TenPhongBan AS DenPhongBanTen,
              ct.LyDo, p.NguoiLap, nv.HoTen AS NguoiLapTen
       FROM PHIEU_DIEU_CHUYEN p
       INNER JOIN CHI_TIET_PHIEU_DIEU_CHUYEN ct ON ct.SoPhieu = p.SoPhieu
       INNER JOIN TAI_SAN ts ON ts.MaTaiSan = ct.MaTaiSan
       LEFT JOIN PHONG_BAN pbTu ON pbTu.MaPhongBan = ct.TuPhongBan
       LEFT JOIN PHONG_BAN pbDen ON pbDen.MaPhongBan = ct.DenPhongBan
       LEFT JOIN NHAN_VIEN nv ON nv.MaNhanVien = p.NguoiLap
       ${whereClause}
       ORDER BY p.NgayDieuChuyen DESC, p.SoPhieu DESC, ct.MaTaiSan ASC`,
      params,
    );

    const [summaryRows] = await this.dbConnection.query<RowDataPacket[]>(
      `SELECT ct.TuPhongBan, pbTu.TenPhongBan AS TuPhongBanTen,
              ct.DenPhongBan, pbDen.TenPhongBan AS DenPhongBanTen,
              COUNT(*) AS SoLuongTaiSan
       FROM PHIEU_DIEU_CHUYEN p
       INNER JOIN CHI_TIET_PHIEU_DIEU_CHUYEN ct ON ct.SoPhieu = p.SoPhieu
       LEFT JOIN PHONG_BAN pbTu ON pbTu.MaPhongBan = ct.TuPhongBan
       LEFT JOIN PHONG_BAN pbDen ON pbDen.MaPhongBan = ct.DenPhongBan
       ${whereClause}
       GROUP BY ct.TuPhongBan, pbTu.TenPhongBan, ct.DenPhongBan, pbDen.TenPhongBan
       ORDER BY SoLuongTaiSan DESC, ct.TuPhongBan ASC, ct.DenPhongBan ASC`,
      params,
    );

    return {
      summary: summaryRows,
      items: historyRows,
    };
  }

  private async findSlip(soPhieu: string) {
    const [rows] = await this.dbConnection.query<SlipRow[]>(
      `SELECT p.SoPhieu, p.NgayDieuChuyen, p.TrangThaiDuyet, p.GhiChu, p.NgayLap, p.NguoiLap,
              nv.HoTen AS NguoiLapTen
       FROM PHIEU_DIEU_CHUYEN p
       LEFT JOIN NHAN_VIEN nv ON nv.MaNhanVien = p.NguoiLap
       WHERE p.SoPhieu = ?
       LIMIT 1`,
      [soPhieu],
    );

    if (rows.length === 0) {
      throw new NotFoundException('Khong tim thay phieu dieu chuyen');
    }

    return rows[0];
  }

  private async resolveAsset(maTaiSan?: string, maQR?: string, connection?: PoolConnection) {
    if (!maTaiSan && !maQR) {
      throw new BadRequestException('Can co ma tai san hoac ma QR');
    }

    const conn = connection ?? this.dbConnection;
    const [rows] = await conn.query<AssetRow[]>(
      `SELECT MaTaiSan, MaQR, TenTaiSan, MaPhongBanHienTai
       FROM TAI_SAN
       WHERE ${maTaiSan ? 'MaTaiSan = ?' : 'MaQR = ?'}
       LIMIT 1`,
      [maTaiSan ?? maQR],
    );

    if (rows.length === 0) {
      throw new NotFoundException('Khong tim thay tai san');
    }

    return rows[0];
  }

  private async finalizeTransfer(soPhieu: string, connection?: PoolConnection) {
    const conn = connection ?? this.dbConnection;
    const [items] = await conn.query<RowDataPacket[]>(
      `SELECT MaTaiSan, DenPhongBan
       FROM CHI_TIET_PHIEU_DIEU_CHUYEN
       WHERE SoPhieu = ?`,
      [soPhieu],
    );

    for (const item of items) {
      await conn.execute(
        `UPDATE TAI_SAN SET TrangThai = 'DANG_LUAN_CHUYEN' WHERE MaTaiSan = ?`,
        [item.MaTaiSan],
      );
    }

    await conn.execute(
      `UPDATE PHIEU_DIEU_CHUYEN SET TrangThaiDuyet = 'DA_DUYET' WHERE SoPhieu = ?`,
      [soPhieu],
    );
  }

  async confirmReceipt(soPhieu: string, dto: ConfirmReceiptDto) {
    const slip = await this.findSlip(soPhieu);

    if (slip.TrangThaiDuyet !== 'DA_DUYET') {
      throw new BadRequestException('Chi co the nhan tai san khi phieu o trang thai DA_DUYET (cho ban giao)');
    }

    const connection = await this.dbConnection.getConnection();
    await connection.beginTransaction();

    try {
      for (const item of dto.danhSachTaiSan) {
        // Cập nhật trạng thái trong chi tiết phiếu
        await connection.execute(
          `UPDATE CHI_TIET_PHIEU_DIEU_CHUYEN SET TrangThaiNhan = ?, GhiChuNhan = ? WHERE SoPhieu = ? AND MaTaiSan = ?`,
          [item.hanhDong, item.ghiChu ?? null, soPhieu, item.maTaiSan]
        );

        if (item.hanhDong === 'DA_NHAN') {
          // Lấy thông tin phòng ban đích
          const [rows] = await connection.query<RowDataPacket[]>(
            `SELECT DenPhongBan FROM CHI_TIET_PHIEU_DIEU_CHUYEN WHERE SoPhieu = ? AND MaTaiSan = ?`,
            [soPhieu, item.maTaiSan]
          );
          const denPhongBan = rows[0]?.DenPhongBan;

          // Cập nhật phòng ban mới và gỡ trạng thái luân chuyển
          await connection.execute(
            `UPDATE TAI_SAN SET MaPhongBanHienTai = ?, TrangThai = 'DANG_SU_DUNG' WHERE MaTaiSan = ?`,
            [denPhongBan, item.maTaiSan]
          );
        } else if (item.hanhDong === 'TU_CHOI') {
          // Trả về phòng ban cũ, gỡ trạng thái luân chuyển
          await connection.execute(
            `UPDATE TAI_SAN SET TrangThai = 'DANG_SU_DUNG' WHERE MaTaiSan = ?`,
            [item.maTaiSan]
          );
        }
      }

      // Kiểm tra xem tất cả tài sản trong phiếu đã được xử lý nhận chưa
      const [pendingItems] = await connection.query<RowDataPacket[]>(
        `SELECT COUNT(*) as count FROM CHI_TIET_PHIEU_DIEU_CHUYEN WHERE SoPhieu = ? AND TrangThaiNhan = 'CHO_NHAN'`,
        [soPhieu]
      );
      
      if (Number(pendingItems[0].count) === 0) {
        // Nếu không còn tài sản nào chờ nhận, hoàn thành phiếu
        await connection.execute(
          `UPDATE PHIEU_DIEU_CHUYEN SET TrangThaiDuyet = 'HOAN_THANH' WHERE SoPhieu = ?`,
          [soPhieu]
        );
      }

      await connection.commit();
      return this.getSlipDetail(soPhieu);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  private async generateSlipNumber(connection: PoolConnection) {
    const today = new Date();
    const year = today.getFullYear();
    const prefix = `PDC-${year}-`;
    
    // Count slips for current year to determine sequential ID
    const [rows] = await connection.query<RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM PHIEU_DIEU_CHUYEN WHERE SoPhieu LIKE ?`,
      [`${prefix}%`]
    );
    
    const count = Number(rows[0].count) || 0;
    const nextNumber = count + 1;
    const sequentialPart = String(nextNumber).padStart(4, '0');
    
    return `${prefix}${sequentialPart}`;
  }
}