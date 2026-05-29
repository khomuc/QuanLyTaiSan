import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { MYSQL_CONNECTION } from '../common/constants';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import { SendApprovalReminderDto } from './send-approval-reminder.dto';

interface ApprovalNotificationRow extends RowDataPacket {
  id: string;
  type: 'TRANSFER' | 'INVENTORY';
  documentId: string;
  documentDate: Date | string | null;
  status: string;
  createdAt: Date | string;
  message: string;
}

interface EmployeeEmailRow extends RowDataPacket {
  MaNhanVien: string;
  Email: string;
  HoTen: string;
}

@Injectable()
export class NotificationsService {
  constructor(@Inject(MYSQL_CONNECTION) private readonly db: Pool) {}

  async getMyApprovalNotifications(user: AuthUser) {
    const [transferRows] = await this.db.execute<ApprovalNotificationRow[]>(
      `SELECT 'TRANSFER' AS type, CONCAT('transfer:', p.SoPhieu) AS id,
              p.SoPhieu AS documentId, p.NgayDieuChuyen AS documentDate,
              'CHO_KY' AS status, pk.CreatedAt AS createdAt,
              CONCAT('Transfer document ', p.SoPhieu, ' is waiting for approval') AS message
       FROM PHIEU_DIEU_CHUYEN_NHAN_VIEN pk
       INNER JOIN PHIEU_DIEU_CHUYEN p ON p.SoPhieu = pk.SoPhieu
       WHERE pk.MaNhanVien = ? AND pk.TrangThaiKy = 'CHO_KY'`,
      [user.maNhanVien],
    );

    const [inventoryRows] = await this.db.execute<ApprovalNotificationRow[]>(
      `SELECT 'INVENTORY' AS type, CONCAT('inventory:', p.MaKiemKe) AS id,
              p.MaKiemKe AS documentId, p.NgayKiemKe AS documentDate,
              'CHO_KY' AS status, pk.CreatedAt AS createdAt,
              CONCAT('Inventory document ', p.MaKiemKe, ' is waiting for approval') AS message
       FROM PHIEU_KIEM_KE_NHAN_VIEN pk
       INNER JOIN PHIEU_KIEM_KE p ON p.MaKiemKe = pk.MaKiemKe
       WHERE pk.MaNhanVien = ? AND pk.TrangThaiKy = 'CHO_KY'`,
      [user.maNhanVien],
    );

    return [...transferRows, ...inventoryRows].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  async sendApprovalReminder(dto: SendApprovalReminderDto, user: AuthUser) {
    const recipient = await this.findEmployee(dto.maNhanVien);
    if (!recipient) {
      throw new NotFoundException('Recipient not found');
    }

    await this.db.execute(
      `INSERT INTO AUDIT_LOG
       (MaNhanVien, HanhDong, DoiTuong, DoiTuongId, TrangThai, ChiTiet)
       VALUES (?, 'EMAIL_APPROVAL_REMINDER', ?, ?, 'QUEUED', ?)`,
      [
        user.maNhanVien,
        dto.loaiPhieu === 'TRANSFER' ? 'PHIEU_DIEU_CHUYEN' : 'PHIEU_KIEM_KE',
        dto.maPhieu,
        `recipient=${recipient.MaNhanVien};email=${recipient.Email}`,
      ],
    );

    return {
      queued: true,
      to: recipient.Email,
      documentType: dto.loaiPhieu,
      documentId: dto.maPhieu,
    };
  }

  private async findEmployee(
    maNhanVien: string,
  ): Promise<EmployeeEmailRow | null> {
    const [rows] = await this.db.execute<EmployeeEmailRow[]>(
      `SELECT MaNhanVien, Email, HoTen
       FROM NHAN_VIEN
       WHERE MaNhanVien = ?
       LIMIT 1`,
      [maNhanVien],
    );

    return rows[0] ?? null;
  }
}
