import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  Pool,
  PoolConnection,
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2/promise';
import { MYSQL_CONNECTION } from '../common/constants';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import { ApprovalActionDto } from './dto/approval-action.dto';
import { AssignApproversDto } from './dto/assign-approvers.dto';

type WorkflowType = 'TRANSFER' | 'INVENTORY';

interface PendingApprovalRow extends RowDataPacket {
  createdAt: Date | string;
}

@Injectable()
export class ApprovalsService {
  constructor(@Inject(MYSQL_CONNECTION) private readonly db: Pool) {}

  async findPendingForUser(user: AuthUser) {
    const [transferRows] = await this.db.execute<PendingApprovalRow[]>(
      `SELECT 'TRANSFER' AS loaiPhieu, p.SoPhieu AS maPhieu, p.NgayDieuChuyen AS ngay,
              p.TrangThaiDuyet AS trangThaiPhieu, nv.HoTen AS nguoiLap,
              pk.VongKy AS vongKy, pk.TenVaiTro AS tenVaiTro, pk.CreatedAt AS createdAt
       FROM PHIEU_DIEU_CHUYEN_NHAN_VIEN pk
       INNER JOIN PHIEU_DIEU_CHUYEN p ON p.SoPhieu = pk.SoPhieu
       INNER JOIN NHAN_VIEN nv ON nv.MaNhanVien = p.NguoiLap
       WHERE pk.MaNhanVien = ? AND pk.TrangThaiKy = 'CHO_KY'
       ORDER BY pk.CreatedAt DESC`,
      [user.maNhanVien],
    );

    const [inventoryRows] = await this.db.execute<PendingApprovalRow[]>(
      `SELECT 'INVENTORY' AS loaiPhieu, p.MaKiemKe AS maPhieu, p.NgayKiemKe AS ngay,
              p.TrangThai AS trangThaiPhieu, nv.HoTen AS nguoiLap,
              pk.VongKy AS vongKy, pk.TenVaiTro AS tenVaiTro, pk.CreatedAt AS createdAt
       FROM PHIEU_KIEM_KE_NHAN_VIEN pk
       INNER JOIN PHIEU_KIEM_KE p ON p.MaKiemKe = pk.MaKiemKe
       INNER JOIN NHAN_VIEN nv ON nv.MaNhanVien = p.NguoiLap
       WHERE pk.MaNhanVien = ? AND pk.TrangThaiKy = 'CHO_KY'
       ORDER BY pk.CreatedAt DESC`,
      [user.maNhanVien],
    );

    return [...transferRows, ...inventoryRows].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  async findTransferApprovers(soPhieu: string) {
    const [rows] = await this.db.execute<RowDataPacket[]>(
      `SELECT pk.SoPhieu AS soPhieu, pk.MaNhanVien AS maNhanVien,
              nv.HoTen AS hoTen, pk.VongKy AS vongKy, pk.TenVaiTro AS tenVaiTro,
              pk.TrangThaiKy AS trangThaiKy, pk.ThoiGianKy AS thoiGianKy,
              pk.LyDoTuChoi AS lyDoTuChoi
       FROM PHIEU_DIEU_CHUYEN_NHAN_VIEN pk
       INNER JOIN NHAN_VIEN nv ON nv.MaNhanVien = pk.MaNhanVien
       WHERE pk.SoPhieu = ?
       ORDER BY pk.VongKy, nv.HoTen`,
      [soPhieu],
    );

    return rows;
  }

  async findInventoryApprovers(maKiemKe: string) {
    const [rows] = await this.db.execute<RowDataPacket[]>(
      `SELECT pk.MaKiemKe AS maKiemKe, pk.MaNhanVien AS maNhanVien,
              nv.HoTen AS hoTen, pk.VongKy AS vongKy, pk.TenVaiTro AS tenVaiTro,
              pk.TrangThaiKy AS trangThaiKy, pk.ThoiGianKy AS thoiGianKy,
              pk.LyDoTuChoi AS lyDoTuChoi
       FROM PHIEU_KIEM_KE_NHAN_VIEN pk
       INNER JOIN NHAN_VIEN nv ON nv.MaNhanVien = pk.MaNhanVien
       WHERE pk.MaKiemKe = ?
       ORDER BY pk.VongKy, nv.HoTen`,
      [maKiemKe],
    );

    return rows;
  }

  async assignTransferApprovers(
    soPhieu: string,
    dto: AssignApproversDto,
    user: AuthUser,
  ) {
    await this.ensureDocumentExists('TRANSFER', soPhieu);
    return this.assignApprovers('TRANSFER', soPhieu, dto, user);
  }

  async assignInventoryApprovers(
    maKiemKe: string,
    dto: AssignApproversDto,
    user: AuthUser,
  ) {
    await this.ensureDocumentExists('INVENTORY', maKiemKe);
    return this.assignApprovers('INVENTORY', maKiemKe, dto, user);
  }

  async signTransfer(soPhieu: string, dto: ApprovalActionDto, user: AuthUser) {
    const connection = await this.db.getConnection();
    try {
      await connection.beginTransaction();
      await this.signApprover(connection, 'TRANSFER', soPhieu, dto, user);
      await this.recalculateTransferStatus(
        connection,
        soPhieu,
        dto.trangThaiKy,
      );
      await this.writeAudit(
        connection,
        user.maNhanVien,
        dto.trangThaiKy === 'DA_KY'
          ? 'TRANSFER_APPROVAL_SIGNED'
          : 'TRANSFER_APPROVAL_REJECTED',
        'PHIEU_DIEU_CHUYEN',
        soPhieu,
        dto.lyDoTuChoi ?? null,
      );
      await connection.commit();

      return {
        message: 'Transfer approval updated successfully',
        approvers: await this.findTransferApprovers(soPhieu),
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async signInventory(
    maKiemKe: string,
    dto: ApprovalActionDto,
    user: AuthUser,
  ) {
    const connection = await this.db.getConnection();
    try {
      await connection.beginTransaction();
      await this.signApprover(connection, 'INVENTORY', maKiemKe, dto, user);
      const completedApproval = await this.hasNoPendingApprovers(
        connection,
        'INVENTORY',
        maKiemKe,
      );
      await this.writeAudit(
        connection,
        user.maNhanVien,
        dto.trangThaiKy === 'DA_KY'
          ? 'INVENTORY_APPROVAL_SIGNED'
          : 'INVENTORY_APPROVAL_REJECTED',
        'PHIEU_KIEM_KE',
        maKiemKe,
        dto.lyDoTuChoi ?? null,
      );
      await connection.commit();

      return {
        message: 'Inventory approval updated successfully',
        completedApproval,
        approvers: await this.findInventoryApprovers(maKiemKe),
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  private async assignApprovers(
    type: WorkflowType,
    documentId: string,
    dto: AssignApproversDto,
    user: AuthUser,
  ) {
    const connection = await this.db.getConnection();
    try {
      await connection.beginTransaction();

      for (const approver of dto.approvers) {
        await connection.execute(
          type === 'TRANSFER'
            ? `INSERT INTO PHIEU_DIEU_CHUYEN_NHAN_VIEN
               (SoPhieu, MaNhanVien, VongKy, TenVaiTro, TrangThaiKy)
               VALUES (?, ?, ?, ?, 'CHO_KY')
               ON DUPLICATE KEY UPDATE TenVaiTro = VALUES(TenVaiTro)`
            : `INSERT INTO PHIEU_KIEM_KE_NHAN_VIEN
               (MaKiemKe, MaNhanVien, VongKy, TenVaiTro, TrangThaiKy)
               VALUES (?, ?, ?, ?, 'CHO_KY')
               ON DUPLICATE KEY UPDATE TenVaiTro = VALUES(TenVaiTro)`,
          [
            documentId,
            approver.maNhanVien,
            approver.vongKy ?? 1,
            approver.tenVaiTro ?? null,
          ],
        );

        await this.writeAudit(
          connection,
          user.maNhanVien,
          'NOTIFY_APPROVER',
          type === 'TRANSFER' ? 'PHIEU_DIEU_CHUYEN' : 'PHIEU_KIEM_KE',
          documentId,
          `approver=${approver.maNhanVien}`,
        );
      }

      await connection.commit();

      return type === 'TRANSFER'
        ? this.findTransferApprovers(documentId)
        : this.findInventoryApprovers(documentId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  private async signApprover(
    connection: PoolConnection,
    type: WorkflowType,
    documentId: string,
    dto: ApprovalActionDto,
    user: AuthUser,
  ) {
    if (dto.trangThaiKy === 'TU_CHOI' && !dto.lyDoTuChoi) {
      throw new BadRequestException('Reject reason is required');
    }

    const [result] = await connection.execute<ResultSetHeader>(
      type === 'TRANSFER'
        ? `UPDATE PHIEU_DIEU_CHUYEN_NHAN_VIEN
           SET TrangThaiKy = ?, ThoiGianKy = NOW(), LyDoTuChoi = ?
           WHERE SoPhieu = ? AND MaNhanVien = ? AND TrangThaiKy = 'CHO_KY'`
        : `UPDATE PHIEU_KIEM_KE_NHAN_VIEN
           SET TrangThaiKy = ?, ThoiGianKy = NOW(), LyDoTuChoi = ?
           WHERE MaKiemKe = ? AND MaNhanVien = ? AND TrangThaiKy = 'CHO_KY'`,
      [
        dto.trangThaiKy,
        dto.trangThaiKy === 'TU_CHOI' ? (dto.lyDoTuChoi ?? null) : null,
        documentId,
        user.maNhanVien,
      ],
    );

    if (!result.affectedRows) {
      throw new NotFoundException('Pending approval was not found');
    }
  }

  private async recalculateTransferStatus(
    connection: PoolConnection,
    soPhieu: string,
    latestStatus: 'DA_KY' | 'TU_CHOI',
  ) {
    if (latestStatus === 'TU_CHOI') {
      await connection.execute(
        `UPDATE PHIEU_DIEU_CHUYEN
         SET TrangThaiDuyet = 'TU_CHOI'
         WHERE SoPhieu = ?`,
        [soPhieu],
      );
      return;
    }

    const completed = await this.hasNoPendingApprovers(
      connection,
      'TRANSFER',
      soPhieu,
    );

    if (completed) {
      await connection.execute(
        `UPDATE PHIEU_DIEU_CHUYEN
         SET TrangThaiDuyet = 'DA_DUYET'
         WHERE SoPhieu = ?`,
        [soPhieu],
      );
    }
  }

  private async hasNoPendingApprovers(
    connection: PoolConnection,
    type: WorkflowType,
    documentId: string,
  ) {
    const [rows] = await connection.execute<RowDataPacket[]>(
      type === 'TRANSFER'
        ? `SELECT COUNT(*) AS total
           FROM PHIEU_DIEU_CHUYEN_NHAN_VIEN
           WHERE SoPhieu = ? AND TrangThaiKy = 'CHO_KY'`
        : `SELECT COUNT(*) AS total
           FROM PHIEU_KIEM_KE_NHAN_VIEN
           WHERE MaKiemKe = ? AND TrangThaiKy = 'CHO_KY'`,
      [documentId],
    );

    return Number(rows[0]?.total ?? 0) === 0;
  }

  private async ensureDocumentExists(type: WorkflowType, documentId: string) {
    const [rows] = await this.db.execute<RowDataPacket[]>(
      type === 'TRANSFER'
        ? 'SELECT SoPhieu FROM PHIEU_DIEU_CHUYEN WHERE SoPhieu = ? LIMIT 1'
        : 'SELECT MaKiemKe FROM PHIEU_KIEM_KE WHERE MaKiemKe = ? LIMIT 1',
      [documentId],
    );

    if (!rows.length) {
      throw new NotFoundException('Document not found');
    }
  }

  private async writeAudit(
    connection: Pool | PoolConnection,
    maNhanVien: string,
    hanhDong: string,
    doiTuong: string,
    doiTuongId: string,
    chiTiet: string | null,
  ) {
    await connection.execute(
      `INSERT INTO AUDIT_LOG
       (MaNhanVien, HanhDong, DoiTuong, DoiTuongId, TrangThai, ChiTiet)
       VALUES (?, ?, ?, ?, 'SUCCESS', ?)`,
      [maNhanVien, hanhDong, doiTuong, doiTuongId, chiTiet],
    );
  }
}
