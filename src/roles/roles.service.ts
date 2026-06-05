import {
  BadRequestException,
  ConflictException,
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
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

interface RoleRow extends RowDataPacket {
  MaVaiTro: string;
  TenVaiTro: string;
  MoTa: string | null;
  CreatedAt: Date;
  UpdatedAt: Date;
  PermissionCodes: string | null;
}

@Injectable()
export class RolesService {
  constructor(@Inject(MYSQL_CONNECTION) private readonly db: Pool) {}

  async findAll() {
    const [rows] = await this.db.execute<RoleRow[]>(
      `SELECT vt.MaVaiTro, vt.TenVaiTro, vt.MoTa, vt.CreatedAt, vt.UpdatedAt,
              GROUP_CONCAT(vtq.MaQuyen ORDER BY vtq.MaQuyen SEPARATOR ',') AS PermissionCodes
       FROM VAI_TRO vt
       LEFT JOIN VAI_TRO_QUYEN vtq ON vtq.MaVaiTro = vt.MaVaiTro
       GROUP BY vt.MaVaiTro, vt.TenVaiTro, vt.MoTa, vt.CreatedAt, vt.UpdatedAt
       ORDER BY vt.MaVaiTro`,
    );

    return rows.map((row) => this.mapRole(row));
  }

  async findOne(maVaiTro: string) {
    const [rows] = await this.db.execute<RoleRow[]>(
      `SELECT vt.MaVaiTro, vt.TenVaiTro, vt.MoTa, vt.CreatedAt, vt.UpdatedAt,
              GROUP_CONCAT(vtq.MaQuyen ORDER BY vtq.MaQuyen SEPARATOR ',') AS PermissionCodes
       FROM VAI_TRO vt
       LEFT JOIN VAI_TRO_QUYEN vtq ON vtq.MaVaiTro = vt.MaVaiTro
       WHERE vt.MaVaiTro = ?
       GROUP BY vt.MaVaiTro, vt.TenVaiTro, vt.MoTa, vt.CreatedAt, vt.UpdatedAt
       LIMIT 1`,
      [maVaiTro],
    );

    if (!rows[0]) {
      throw new NotFoundException('Role not found');
    }

    return this.mapRole(rows[0]);
  }

  async create(dto: CreateRoleDto, user: AuthUser) {
    const connection = await this.db.getConnection();
    try {
      await connection.beginTransaction();
      await connection.execute(
        `INSERT INTO VAI_TRO (MaVaiTro, TenVaiTro, MoTa)
         VALUES (?, ?, ?)`,
        [dto.maVaiTro, dto.tenVaiTro, dto.moTa ?? null],
      );

      await this.replacePermissions(
        connection,
        dto.maVaiTro,
        dto.maQuyen ?? [],
      );
      await this.writeAudit(
        connection,
        user.maNhanVien,
        'ROLE_CREATE',
        dto.maVaiTro,
      );
      await connection.commit();

      return this.findOne(dto.maVaiTro);
    } catch (error) {
      await connection.rollback();
      if (this.isDuplicateEntry(error)) {
        throw new ConflictException('Role already exists');
      }
      throw error;
    } finally {
      connection.release();
    }
  }

  async update(maVaiTro: string, dto: UpdateRoleDto, user: AuthUser) {
    await this.findOne(maVaiTro);

    const connection = await this.db.getConnection();
    try {
      await connection.beginTransaction();

      const assignments: string[] = [];
      const params: Array<string | null> = [];
      if (dto.tenVaiTro !== undefined) {
        assignments.push('TenVaiTro = ?');
        params.push(dto.tenVaiTro);
      }
      if (dto.moTa !== undefined) {
        assignments.push('MoTa = ?');
        params.push(dto.moTa);
      }

      if (assignments.length) {
        await connection.execute(
          `UPDATE VAI_TRO SET ${assignments.join(', ')}
           WHERE MaVaiTro = ?`,
          [...params, maVaiTro],
        );
      }

      if (dto.maQuyen) {
        await this.replacePermissions(connection, maVaiTro, dto.maQuyen);
      }

      if (!assignments.length && !dto.maQuyen) {
        throw new BadRequestException('No fields to update');
      }

      await this.writeAudit(connection, user.maNhanVien, 'ROLE_EDIT', maVaiTro);
      await connection.commit();

      return this.findOne(maVaiTro);
    } catch (error) {
      await connection.rollback();
      if (this.isDuplicateEntry(error)) {
        throw new ConflictException('Role name already exists');
      }
      throw error;
    } finally {
      connection.release();
    }
  }

  async assignPermissions(
    maVaiTro: string,
    dto: AssignPermissionsDto,
    user: AuthUser,
  ) {
    await this.findOne(maVaiTro);
    const connection = await this.db.getConnection();

    try {
      await connection.beginTransaction();
      await this.replacePermissions(connection, maVaiTro, dto.maQuyen);
      await this.writeAudit(
        connection,
        user.maNhanVien,
        'ROLE_ASSIGN_PERMISSIONS',
        maVaiTro,
      );
      await connection.commit();

      return this.findOne(maVaiTro);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async remove(maVaiTro: string, user: AuthUser) {
    if (['ADMIN', 'NHAN_VIEN', 'GUEST'].includes(maVaiTro)) {
      throw new BadRequestException('Default role cannot be deleted');
    }

    const connection = await this.db.getConnection();
    try {
      await connection.beginTransaction();
      await connection.execute('DELETE FROM VAI_TRO_QUYEN WHERE MaVaiTro = ?', [
        maVaiTro,
      ]);
      const [result] = await connection.execute<ResultSetHeader>(
        'DELETE FROM VAI_TRO WHERE MaVaiTro = ?',
        [maVaiTro],
      );

      if (!result.affectedRows) {
        throw new NotFoundException('Role not found');
      }

      await this.writeAudit(
        connection,
        user.maNhanVien,
        'ROLE_DELETE',
        maVaiTro,
      );
      await connection.commit();
      return { message: 'Role deleted successfully' };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async listPermissions(module?: string) {
    const params = module ? [module] : [];
    const [rows] = await this.db.execute<RowDataPacket[]>(
      `SELECT MaQuyen AS maQuyen, TenQuyen AS tenQuyen, MoTa AS moTa,
              Module AS module, CreatedAt AS createdAt, UpdatedAt AS updatedAt
       FROM QUYEN
       ${module ? 'WHERE Module = ?' : ''}
       ORDER BY Module, MaQuyen`,
      params,
    );

    return rows;
  }

  async createPermission(dto: CreatePermissionDto, user: AuthUser) {
    try {
      await this.db.execute(
        `INSERT INTO QUYEN (MaQuyen, TenQuyen, MoTa, Module)
         VALUES (?, ?, ?, ?)`,
        [dto.maQuyen, dto.tenQuyen, dto.moTa ?? null, dto.module ?? null],
      );
    } catch (error) {
      if (this.isDuplicateEntry(error)) {
        throw new ConflictException('Permission already exists');
      }
      throw error;
    }

    await this.writeAudit(
      this.db,
      user.maNhanVien,
      'PERMISSION_CREATE',
      dto.maQuyen,
    );
    return this.listPermissions();
  }

  async updatePermission(
    maQuyen: string,
    dto: UpdatePermissionDto,
    user: AuthUser,
  ) {
    const assignments: string[] = [];
    const params: Array<string | null> = [];

    if (dto.tenQuyen !== undefined) {
      assignments.push('TenQuyen = ?');
      params.push(dto.tenQuyen);
    }
    if (dto.moTa !== undefined) {
      assignments.push('MoTa = ?');
      params.push(dto.moTa);
    }
    if (dto.module !== undefined) {
      assignments.push('Module = ?');
      params.push(dto.module);
    }

    if (!assignments.length) {
      throw new BadRequestException('No fields to update');
    }

    const [result] = await this.db.execute<ResultSetHeader>(
      `UPDATE QUYEN SET ${assignments.join(', ')}
       WHERE MaQuyen = ?`,
      [...params, maQuyen],
    );

    if (!result.affectedRows) {
      throw new NotFoundException('Permission not found');
    }

    await this.writeAudit(this.db, user.maNhanVien, 'PERMISSION_EDIT', maQuyen);
    return this.listPermissions();
  }

  private async replacePermissions(
    connection: Pool | PoolConnection,
    maVaiTro: string,
    maQuyen: string[],
  ) {
    await connection.execute('DELETE FROM VAI_TRO_QUYEN WHERE MaVaiTro = ?', [
      maVaiTro,
    ]);

    for (const permission of maQuyen) {
      await connection.execute(
        `INSERT INTO VAI_TRO_QUYEN (MaVaiTro, MaQuyen)
         VALUES (?, ?)`,
        [maVaiTro, permission],
      );
    }
  }

  private mapRole(row: RoleRow) {
    return {
      maVaiTro: row.MaVaiTro,
      tenVaiTro: row.TenVaiTro,
      moTa: row.MoTa,
      permissions: row.PermissionCodes ? row.PermissionCodes.split(',') : [],
      createdAt: row.CreatedAt,
      updatedAt: row.UpdatedAt,
    };
  }

  private async writeAudit(
    connection: Pool | PoolConnection,
    maNhanVien: string,
    hanhDong: string,
    targetId: string,
  ) {
    await connection.execute(
      `INSERT INTO AUDIT_LOG
       (MaNhanVien, HanhDong, DoiTuong, DoiTuongId, TrangThai, ChiTiet)
       VALUES (?, ?, 'VAI_TRO', ?, 'SUCCESS', ?)`,
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
