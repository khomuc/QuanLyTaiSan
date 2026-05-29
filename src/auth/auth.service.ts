import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import type { SignOptions } from 'jsonwebtoken';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { MYSQL_CONNECTION } from '../common/constants';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';

interface EmployeeAuthRow extends RowDataPacket {
  MaNhanVien: string;
  HoTen: string;
  ChucVu: string | null;
  Email: string;
  SoDienThoai: string | null;
  MaPhongBan: string;
  TenPhongBan: string | null;
  MaVaiTro: string;
  TenVaiTro: string | null;
  MatKhau: string;
  TrangThai: 'ACTIVE' | 'INACTIVE';
  CreatedAt: Date;
  UpdatedAt: Date;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(MYSQL_CONNECTION) private readonly db: Pool,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const employee = await this.findEmployeeByEmail(dto.email);

    if (!employee || employee.TrangThai !== 'ACTIVE') {
      throw new UnauthorizedException('Invalid login information');
    }

    const passwordOk = await this.verifyPassword(dto.matKhau, employee.MatKhau);
    if (!passwordOk) {
      throw new UnauthorizedException('Invalid login information');
    }

    const permissions = await this.getPermissions(employee.MaVaiTro);
    const user = this.toAuthUser(employee, permissions);
    const accessToken = await this.signToken(user);

    await this.writeAudit(
      user.maNhanVien,
      'LOGIN',
      'NHAN_VIEN',
      user.maNhanVien,
    );

    return {
      accessToken,
      tokenType: 'Bearer',
      user,
    };
  }

  async getProfile(user: AuthUser) {
    const employee = await this.findEmployeeById(user.maNhanVien);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const permissions = await this.getPermissions(employee.MaVaiTro);
    return {
      ...this.sanitizeEmployee(employee),
      permissions,
    };
  }

  async changePassword(user: AuthUser, dto: ChangePasswordDto) {
    const employee = await this.findEmployeeById(user.maNhanVien);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const passwordOk = await this.verifyPassword(
      dto.matKhauCu,
      employee.MatKhau,
    );
    if (!passwordOk) {
      throw new UnauthorizedException('Old password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(dto.matKhauMoi, 10);
    await this.db.execute(
      'UPDATE NHAN_VIEN SET MatKhau = ? WHERE MaNhanVien = ?',
      [hashedPassword, user.maNhanVien],
    );

    await this.writeAudit(
      user.maNhanVien,
      'CHANGE_PASSWORD',
      'NHAN_VIEN',
      user.maNhanVien,
    );

    return { message: 'Password changed successfully' };
  }

  async getPermissions(maVaiTro: string): Promise<string[]> {
    const [rows] = await this.db.execute<RowDataPacket[]>(
      `SELECT MaQuyen
       FROM VAI_TRO_QUYEN
       WHERE MaVaiTro = ?
       ORDER BY MaQuyen`,
      [maVaiTro],
    );

    return rows.map((row) => String(row.MaQuyen));
  }

  async signToken(user: AuthUser): Promise<string> {
    return this.jwtService.signAsync(
      {
        sub: user.maNhanVien,
        ...user,
      },
      {
        secret: process.env.JWT_SECRET ?? 'quan-ly-tai-san-secret',
        expiresIn: (process.env.JWT_EXPIRES_IN ??
          '8h') as SignOptions['expiresIn'],
      },
    );
  }

  async findEmployeeById(id: string): Promise<EmployeeAuthRow | null> {
    const [rows] = await this.db.execute<EmployeeAuthRow[]>(
      `SELECT nv.*, pb.TenPhongBan, vt.TenVaiTro
       FROM NHAN_VIEN nv
       LEFT JOIN PHONG_BAN pb ON pb.MaPhongBan = nv.MaPhongBan
       LEFT JOIN VAI_TRO vt ON vt.MaVaiTro = nv.MaVaiTro
       WHERE nv.MaNhanVien = ?
       LIMIT 1`,
      [id],
    );

    return rows[0] ?? null;
  }

  private async findEmployeeByEmail(
    email: string,
  ): Promise<EmployeeAuthRow | null> {
    const [rows] = await this.db.execute<EmployeeAuthRow[]>(
      `SELECT nv.*, pb.TenPhongBan, vt.TenVaiTro
       FROM NHAN_VIEN nv
       LEFT JOIN PHONG_BAN pb ON pb.MaPhongBan = nv.MaPhongBan
       LEFT JOIN VAI_TRO vt ON vt.MaVaiTro = nv.MaVaiTro
       WHERE nv.Email = ?
       LIMIT 1`,
      [email],
    );

    return rows[0] ?? null;
  }

  private async verifyPassword(
    plainPassword: string,
    storedPassword: string,
  ): Promise<boolean> {
    if (
      storedPassword.startsWith('$2a$') ||
      storedPassword.startsWith('$2b$')
    ) {
      return bcrypt.compare(plainPassword, storedPassword);
    }

    return plainPassword === storedPassword;
  }

  private toAuthUser(
    employee: EmployeeAuthRow,
    permissions: string[],
  ): AuthUser {
    return {
      maNhanVien: employee.MaNhanVien,
      email: employee.Email,
      hoTen: employee.HoTen,
      maVaiTro: employee.MaVaiTro,
      permissions,
    };
  }

  private sanitizeEmployee(employee: EmployeeAuthRow) {
    return {
      maNhanVien: employee.MaNhanVien,
      hoTen: employee.HoTen,
      chucVu: employee.ChucVu,
      email: employee.Email,
      soDienThoai: employee.SoDienThoai,
      maPhongBan: employee.MaPhongBan,
      tenPhongBan: employee.TenPhongBan,
      maVaiTro: employee.MaVaiTro,
      tenVaiTro: employee.TenVaiTro,
      trangThai: employee.TrangThai,
      createdAt: employee.CreatedAt,
      updatedAt: employee.UpdatedAt,
    };
  }

  private async writeAudit(
    maNhanVien: string,
    hanhDong: string,
    doiTuong: string,
    doiTuongId: string,
  ) {
    await this.db.execute(
      `INSERT INTO AUDIT_LOG
       (MaNhanVien, HanhDong, DoiTuong, DoiTuongId, TrangThai, ChiTiet)
       VALUES (?, ?, ?, ?, 'SUCCESS', ?)`,
      [maNhanVien, hanhDong, doiTuong, doiTuongId, hanhDong],
    );
  }
}
