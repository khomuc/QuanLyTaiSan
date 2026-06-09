import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { MYSQL_CONNECTION } from '../common/constants';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { QueryEmployeesDto } from './dto/query-employees.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

interface EmployeeRow extends RowDataPacket {
  MaNhanVien: string;
  HoTen: string;
  ChucVu: string | null;
  Email: string;
  SoDienThoai: string | null;
  MaPhongBan: string;
  TenPhongBan: string | null;
  MaVaiTro: string;
  TenVaiTro: string | null;
  TrangThai: string;
  CreatedAt: Date;
  UpdatedAt: Date;
}

const BCRYPT_SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS ?? 12);

@Injectable()
export class EmployeesService {
  constructor(@Inject(MYSQL_CONNECTION) private readonly db: Pool) {}

  async findAll(query: QueryEmployeesDto) {
    const where: string[] = [];
    const params: Array<string | number> = [];

    if (query.search) {
      where.push(
        '(nv.MaNhanVien LIKE ? OR nv.HoTen LIKE ? OR nv.Email LIKE ?)',
      );
      const keyword = `%${query.search}%`;
      params.push(keyword, keyword, keyword);
    }

    if (query.maPhongBan) {
      where.push('nv.MaPhongBan = ?');
      params.push(query.maPhongBan);
    }

    if (query.maVaiTro) {
      where.push('nv.MaVaiTro = ?');
      params.push(query.maVaiTro);
    }

    if (query.trangThai) {
      where.push('nv.TrangThai = ?');
      params.push(query.trangThai);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const offset = (page - 1) * limit;

    const [rows] = await this.db.query<EmployeeRow[]>(
      `SELECT nv.MaNhanVien, nv.HoTen, nv.ChucVu, nv.Email, nv.SoDienThoai,
              nv.MaPhongBan, pb.TenPhongBan, nv.MaVaiTro, vt.TenVaiTro,
              nv.TrangThai, nv.CreatedAt, nv.UpdatedAt
       FROM NHAN_VIEN nv
       LEFT JOIN PHONG_BAN pb ON pb.MaPhongBan = nv.MaPhongBan
       LEFT JOIN VAI_TRO vt ON vt.MaVaiTro = nv.MaVaiTro
       ${whereSql}
       ORDER BY nv.CreatedAt DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );

    const [countRows] = await this.db.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total
       FROM NHAN_VIEN nv
       ${whereSql}`,
      params,
    );

    const total = Number(countRows[0]?.total ?? 0);

    return {
      data: rows.map((row) => this.mapEmployee(row)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(maNhanVien: string) {
    const row = await this.findEmployeeRow(maNhanVien);
    if (!row) {
      throw new NotFoundException('Employee not found');
    }

    return this.mapEmployee(row);
  }

  async create(dto: CreateEmployeeDto, user: AuthUser) {
    await this.ensureUnique(dto.maNhanVien, dto.email);
    const password = await bcrypt.hash(dto.matKhau, BCRYPT_SALT_ROUNDS);

    await this.db.execute(
      `INSERT INTO NHAN_VIEN
       (MaNhanVien, HoTen, ChucVu, Email, SoDienThoai, MaPhongBan, MaVaiTro, MatKhau, TrangThai)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        dto.maNhanVien,
        dto.hoTen,
        dto.chucVu ?? null,
        dto.email,
        dto.soDienThoai ?? null,
        dto.maPhongBan,
        dto.maVaiTro ?? 'NHAN_VIEN',
        password,
        dto.trangThai ?? 'ACTIVE',
      ],
    );

    await this.writeAudit(user.maNhanVien, 'STAFF_CREATE', dto.maNhanVien);
    return this.findOne(dto.maNhanVien);
  }

  async update(maNhanVien: string, dto: UpdateEmployeeDto, user: AuthUser) {
    await this.findOne(maNhanVien);

    const assignments: string[] = [];
    const params: Array<string | null> = [];

    const add = (column: string, value: string | null | undefined) => {
      if (value !== undefined) {
        assignments.push(`${column} = ?`);
        params.push(value);
      }
    };

    add('HoTen', dto.hoTen);
    add('ChucVu', dto.chucVu ?? undefined);
    add('Email', dto.email);
    add('SoDienThoai', dto.soDienThoai ?? undefined);
    add('MaPhongBan', dto.maPhongBan);
    add('MaVaiTro', dto.maVaiTro);
    add('TrangThai', dto.trangThai);

    if (dto.matKhau) {
      assignments.push('MatKhau = ?');
      params.push(await bcrypt.hash(dto.matKhau, BCRYPT_SALT_ROUNDS));
    }

    if (!assignments.length) {
      throw new BadRequestException('No fields to update');
    }

    try {
      await this.db.execute(
        `UPDATE NHAN_VIEN SET ${assignments.join(', ')}
         WHERE MaNhanVien = ?`,
        [...params, maNhanVien],
      );
    } catch (error) {
      if (this.isDuplicateEntry(error)) {
        throw new ConflictException('Employee id or email already exists');
      }
      throw error;
    }

    await this.writeAudit(user.maNhanVien, 'STAFF_EDIT', maNhanVien);
    return this.findOne(maNhanVien);
  }

  async remove(maNhanVien: string, user: AuthUser) {
    const [result] = await this.db.execute<ResultSetHeader>(
      `UPDATE NHAN_VIEN
       SET TrangThai = 'INACTIVE'
       WHERE MaNhanVien = ?`,
      [maNhanVien],
    );

    if (!result.affectedRows) {
      throw new NotFoundException('Employee not found');
    }

    await this.writeAudit(user.maNhanVien, 'STAFF_DELETE', maNhanVien);
    return { message: 'Employee deactivated successfully' };
  }

  async overridePermissions(
    maNhanVien: string,
    maQuyen: string[],
    user: AuthUser,
  ) {
    await this.findOne(maNhanVien);

    const connection = await this.db.getConnection();
    try {
      await connection.beginTransaction();

      await connection.execute(
        'DELETE FROM NHAN_VIEN_QUYEN WHERE MaNhanVien = ?',
        [maNhanVien],
      );

      for (const quyen of maQuyen) {
        await connection.execute(
          'INSERT INTO NHAN_VIEN_QUYEN (MaNhanVien, MaQuyen) VALUES (?, ?)',
          [maNhanVien, quyen],
        );
      }

      await connection.execute(
        `INSERT INTO AUDIT_LOG
         (MaNhanVien, HanhDong, DoiTuong, DoiTuongId, TrangThai, ChiTiet)
         VALUES (?, 'STAFF_OVERRIDE_PERMISSIONS', 'NHAN_VIEN', ?, 'SUCCESS', ?)`,
        [user.maNhanVien, maNhanVien, `Override ${maQuyen.length} permissions`],
      );

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    return { message: 'Permissions updated successfully', count: maQuyen.length };
  }

  async listDepartments() {
    const [rows] = await this.db.execute<RowDataPacket[]>(
      `SELECT MaPhongBan AS maPhongBan, TenPhongBan AS tenPhongBan
       FROM PHONG_BAN
       ORDER BY TenPhongBan`,
    );

    return rows;
  }

  private async findEmployeeRow(
    maNhanVien: string,
  ): Promise<EmployeeRow | null> {
    const [rows] = await this.db.execute<EmployeeRow[]>(
      `SELECT nv.MaNhanVien, nv.HoTen, nv.ChucVu, nv.Email, nv.SoDienThoai,
              nv.MaPhongBan, pb.TenPhongBan, nv.MaVaiTro, vt.TenVaiTro,
              nv.TrangThai, nv.CreatedAt, nv.UpdatedAt
       FROM NHAN_VIEN nv
       LEFT JOIN PHONG_BAN pb ON pb.MaPhongBan = nv.MaPhongBan
       LEFT JOIN VAI_TRO vt ON vt.MaVaiTro = nv.MaVaiTro
       WHERE nv.MaNhanVien = ?
       LIMIT 1`,
      [maNhanVien],
    );

    return rows[0] ?? null;
  }

  private async ensureUnique(maNhanVien: string, email: string) {
    const [rows] = await this.db.execute<RowDataPacket[]>(
      `SELECT MaNhanVien, Email
       FROM NHAN_VIEN
       WHERE MaNhanVien = ? OR Email = ?
       LIMIT 1`,
      [maNhanVien, email],
    );

    if (rows.length) {
      throw new ConflictException('Employee id or email already exists');
    }
  }

  private mapEmployee(row: EmployeeRow) {
    return {
      maNhanVien: row.MaNhanVien,
      hoTen: row.HoTen,
      chucVu: row.ChucVu,
      email: row.Email,
      soDienThoai: row.SoDienThoai,
      maPhongBan: row.MaPhongBan,
      tenPhongBan: row.TenPhongBan,
      maVaiTro: row.MaVaiTro,
      tenVaiTro: row.TenVaiTro,
      trangThai: row.TrangThai,
      createdAt: row.CreatedAt,
      updatedAt: row.UpdatedAt,
    };
  }

  private async writeAudit(
    maNhanVien: string,
    hanhDong: string,
    targetId: string,
  ) {
    await this.db.execute(
      `INSERT INTO AUDIT_LOG
       (MaNhanVien, HanhDong, DoiTuong, DoiTuongId, TrangThai, ChiTiet)
       VALUES (?, ?, 'NHAN_VIEN', ?, 'SUCCESS', ?)`,
      [maNhanVien, hanhDong, targetId, `${hanhDong}:${targetId}`],
    );
  }

  private isDuplicateEntry(error: unknown) {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'ER_DUP_ENTRY'
    );
  }
}
