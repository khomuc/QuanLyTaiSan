import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { createHash } from 'crypto';
import type { SignOptions } from 'jsonwebtoken';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { MYSQL_CONNECTION } from '../common/constants';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

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

interface RefreshTokenPayload {
  sub: string;
  type: 'refresh';
  iat?: number;
  exp?: number;
}

const BCRYPT_SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS ?? 12);

@Injectable()
export class AuthService {
  constructor(
    @Inject(MYSQL_CONNECTION) private readonly db: Pool,
    private readonly jwtService: JwtService,
  ) {}

  // ─── Public methods ──────────────────────────────────────────────────────────

  async login(dto: LoginDto) {
    const employee = await this.findEmployeeByEmail(dto.email);

    if (!employee || employee.TrangThai !== 'ACTIVE') {
      throw new UnauthorizedException('Invalid login information');
    }

    const passwordOk = await this.verifyPassword(dto.matKhau, employee.MatKhau);
    if (!passwordOk) {
      throw new UnauthorizedException('Invalid login information');
    }

    const permissions = await this.getPermissions(employee.MaVaiTro, employee.MaNhanVien);
    const user = this.toAuthUser(employee, permissions);

    const [accessToken, refreshToken] = await Promise.all([
      this.signToken(user),
      this.signRefreshToken(employee.MaNhanVien),
    ]);

    await this.storeRefreshToken(employee.MaNhanVien, refreshToken);

    await this.writeAudit(
      user.maNhanVien,
      'LOGIN',
      'NHAN_VIEN',
      user.maNhanVien,
    );

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      user,
    };
  }

  /**
   * POST /auth/refresh
   * Validates refresh token, revokes it, and issues a new pair (token rotation).
   */
  async refresh(dto: RefreshTokenDto) {
    // 1. Verify JWT signature & expiry
    let payload: RefreshTokenPayload;
    try {
      payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(
        dto.refreshToken,
        {
          secret:
            process.env.JWT_REFRESH_SECRET ??
            'quan-ly-tai-san-refresh-secret',
        },
      );
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    // 2. Check token exists in DB and has not been revoked
    const hash = this.hashToken(dto.refreshToken);
    const [rows] = await this.db.execute<RowDataPacket[]>(
      `SELECT Id
       FROM REFRESH_TOKEN
       WHERE TokenHash   = ?
         AND MaNhanVien  = ?
         AND RevokedAt  IS NULL
         AND ExpiresAt   > NOW()
       LIMIT 1`,
      [hash, payload.sub],
    );

    if (!rows.length) {
      // Possible token reuse attack — revoke all tokens for this user
      await this.revokeAllTokens(payload.sub);
      throw new UnauthorizedException(
        'Refresh token has been revoked. Please log in again.',
      );
    }

    // 3. Revoke the used token (rotation: one-time use)
    await this.db.execute(
      `UPDATE REFRESH_TOKEN SET RevokedAt = NOW() WHERE TokenHash = ?`,
      [hash],
    );

    // 4. Re-load employee to get fresh state
    const employee = await this.findEmployeeById(payload.sub);
    if (!employee || employee.TrangThai !== 'ACTIVE') {
      throw new UnauthorizedException('Account is inactive or not found');
    }

    // 5. Issue new token pair
    const permissions = await this.getPermissions(employee.MaVaiTro, employee.MaNhanVien);
    const user = this.toAuthUser(employee, permissions);

    const [newAccessToken, newRefreshToken] = await Promise.all([
      this.signToken(user),
      this.signRefreshToken(employee.MaNhanVien),
    ]);

    await this.storeRefreshToken(employee.MaNhanVien, newRefreshToken);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      tokenType: 'Bearer',
    };
  }

  /**
   * POST /auth/logout
   * Revokes the provided refresh token so it can no longer be used.
   */
  async logout(user: AuthUser, dto: RefreshTokenDto) {
    const hash = this.hashToken(dto.refreshToken);

    await this.db.execute(
      `UPDATE REFRESH_TOKEN
       SET    RevokedAt  = NOW()
       WHERE  TokenHash  = ?
         AND  MaNhanVien = ?
         AND  RevokedAt IS NULL`,
      [hash, user.maNhanVien],
    );

    await this.writeAudit(
      user.maNhanVien,
      'LOGOUT',
      'NHAN_VIEN',
      user.maNhanVien,
    );

    return { message: 'Logged out successfully' };
  }

  async getProfile(user: AuthUser) {
    const employee = await this.findEmployeeById(user.maNhanVien);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const permissions = await this.getPermissions(employee.MaVaiTro, employee.MaNhanVien);
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

    const hashedPassword = await bcrypt.hash(
      dto.matKhauMoi,
      BCRYPT_SALT_ROUNDS,
    );
    await this.db.execute(
      'UPDATE NHAN_VIEN SET MatKhau = ? WHERE MaNhanVien = ?',
      [hashedPassword, user.maNhanVien],
    );

    // Revoke all refresh tokens after password change (security best practice)
    await this.revokeAllTokens(user.maNhanVien);

    await this.writeAudit(
      user.maNhanVien,
      'CHANGE_PASSWORD',
      'NHAN_VIEN',
      user.maNhanVien,
    );

    return { message: 'Password changed successfully' };
  }

  async updateProfile(user: AuthUser, dto: UpdateProfileDto) {
    await this.ensureDepartmentExists(dto.maPhongBan);

    const employee = await this.findEmployeeById(user.maNhanVien);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    await this.db.execute(
      `UPDATE NHAN_VIEN
       SET HoTen = ?, ChucVu = ?, SoDienThoai = ?, MaPhongBan = ?
       WHERE MaNhanVien = ?`,
      [
        dto.hoTen,
        dto.chucVu ?? null,
        dto.soDienThoai ?? null,
        dto.maPhongBan,
        user.maNhanVien,
      ],
    );

    await this.writeAudit(
      user.maNhanVien,
      'PROFILE_UPDATE',
      'NHAN_VIEN',
      user.maNhanVien,
    );

    return this.getProfile(user);
  }

  async listDepartments() {
    const [rows] = await this.db.execute<RowDataPacket[]>(
      `SELECT MaPhongBan AS maPhongBan, TenPhongBan AS tenPhongBan
       FROM PHONG_BAN
       ORDER BY TenPhongBan`,
    );

    return rows;
  }

  async getPermissions(maVaiTro: string, maNhanVien?: string): Promise<string[]> {
    const [roleRows] = await this.db.execute<RowDataPacket[]>(
      `SELECT MaQuyen
       FROM VAI_TRO_QUYEN
       WHERE MaVaiTro = ?
       ORDER BY MaQuyen`,
      [maVaiTro],
    );
    const roleCodes = roleRows.map((row) => String(row.MaQuyen));

    if (!maNhanVien) return roleCodes;

    const [empRows] = await this.db.execute<RowDataPacket[]>(
      `SELECT MaQuyen
       FROM NHAN_VIEN_QUYEN
       WHERE MaNhanVien = ?
       ORDER BY MaQuyen`,
      [maNhanVien],
    );
    const empCodes = empRows.map((row) => String(row.MaQuyen));

    return Array.from(new Set([...roleCodes, ...empCodes])).sort();
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
          '15m') as SignOptions['expiresIn'],
      },
    );
  }

  async findEmployeeById(id: string): Promise<EmployeeAuthRow | null> {
    const [rows] = await this.db.execute<EmployeeAuthRow[]>(
      `SELECT nv.*, pb.TenPhongBan, vt.TenVaiTro
       FROM NHAN_VIEN nv
       LEFT JOIN PHONG_BAN pb ON pb.MaPhongBan = nv.MaPhongBan
       LEFT JOIN VAI_TRO   vt ON vt.MaVaiTro   = nv.MaVaiTro
       WHERE nv.MaNhanVien = ?
       LIMIT 1`,
      [id],
    );

    return rows[0] ?? null;
  }

  // ─── Token helpers ────────────────────────────────────────────────────────────

  private async signRefreshToken(maNhanVien: string): Promise<string> {
    return this.jwtService.signAsync(
      { sub: maNhanVien, type: 'refresh' },
      {
        secret:
          process.env.JWT_REFRESH_SECRET ??
          'quan-ly-tai-san-refresh-secret',
        expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ??
          '7d') as SignOptions['expiresIn'],
      },
    );
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private async storeRefreshToken(
    maNhanVien: string,
    token: string,
  ): Promise<void> {
    const hash = this.hashToken(token);
    const decoded = this.jwtService.decode(token) as { exp: number };
    const expiresAt = new Date(decoded.exp * 1000);

    await this.db.execute(
      `INSERT INTO REFRESH_TOKEN (MaNhanVien, TokenHash, ExpiresAt)
       VALUES (?, ?, ?)`,
      [maNhanVien, hash, expiresAt],
    );
  }

  private async revokeAllTokens(maNhanVien: string): Promise<void> {
    await this.db.execute(
      `UPDATE REFRESH_TOKEN
       SET    RevokedAt  = NOW()
       WHERE  MaNhanVien = ?
         AND  RevokedAt IS NULL`,
      [maNhanVien],
    );
  }

  // ─── Private helpers ──────────────────────────────────────────────────────────

  private async ensureDepartmentExists(maPhongBan: string) {
    const [rows] = await this.db.execute<RowDataPacket[]>(
      'SELECT MaPhongBan FROM PHONG_BAN WHERE MaPhongBan = ? LIMIT 1',
      [maPhongBan],
    );

    if (!rows.length) {
      throw new NotFoundException('Department not found');
    }
  }

  private async findEmployeeByEmail(
    email: string,
  ): Promise<EmployeeAuthRow | null> {
    const [rows] = await this.db.execute<EmployeeAuthRow[]>(
      `SELECT nv.*, pb.TenPhongBan, vt.TenVaiTro
       FROM NHAN_VIEN nv
       LEFT JOIN PHONG_BAN pb ON pb.MaPhongBan = nv.MaPhongBan
       LEFT JOIN VAI_TRO   vt ON vt.MaVaiTro   = nv.MaVaiTro
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
      chucVu: employee.ChucVu,
      soDienThoai: employee.SoDienThoai,
      maPhongBan: employee.MaPhongBan,
      tenPhongBan: employee.TenPhongBan,
      maVaiTro: employee.MaVaiTro,
      tenVaiTro: employee.TenVaiTro,
      trangThai: employee.TrangThai,
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
      permissions: [],
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
