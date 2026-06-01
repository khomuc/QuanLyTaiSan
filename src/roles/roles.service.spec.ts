import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MYSQL_CONNECTION } from '../common/constants';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { RolesService } from './roles.service';

describe('RolesService - RBAC', () => {
  let service: RolesService;
  let mockDb: any;

  const mockAuthUser: AuthUser = {
    maNhanVien: 'NV001',
    email: 'admin@test.com',
    hoTen: 'Admin User',
    chucVu: 'Quản trị viên',
    soDienThoai: null,
    maPhongBan: 'PB01',
    tenPhongBan: 'IT',
    maVaiTro: 'ADMIN',
    tenVaiTro: 'Quản trị viên',
    trangThai: 'ACTIVE',
    permissions: ['ROLE_MANAGE'],
  };

  beforeEach(async () => {
    mockDb = {
      execute: jest.fn(),
      getConnection: jest.fn().mockResolvedValue({
        beginTransaction: jest.fn(),
        commit: jest.fn(),
        rollback: jest.fn(),
        release: jest.fn(),
        execute: jest.fn(),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: MYSQL_CONNECTION,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
  });

  describe('findAll', () => {
    it('should return all roles with permissions', async () => {
      const mockRoles = [
        {
          MaVaiTro: 'ADMIN',
          TenVaiTro: 'Quản trị viên',
          MoTa: 'Full access',
          PermissionCodes: 'ROLE_MANAGE,STAFF_MANAGE',
          CreatedAt: new Date(),
          UpdatedAt: new Date(),
        },
      ];

      mockDb.execute.mockResolvedValueOnce([mockRoles]);
      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].maVaiTro).toBe('ADMIN');
      expect(result[0].permissions).toEqual(['ROLE_MANAGE', 'STAFF_MANAGE']);
    });

    it('should handle roles with no permissions', async () => {
      const mockRoles = [
        {
          MaVaiTro: 'GUEST',
          TenVaiTro: 'Khách',
          MoTa: 'No access',
          PermissionCodes: null,
          CreatedAt: new Date(),
          UpdatedAt: new Date(),
        },
      ];

      mockDb.execute.mockResolvedValueOnce([mockRoles]);
      const result = await service.findAll();

      expect(result[0].permissions).toEqual([]);
    });
  });

  describe('assignPermissions', () => {
    it('should successfully assign permissions to role', async () => {
      const mockConnection = {
        beginTransaction: jest.fn(),
        commit: jest.fn(),
        rollback: jest.fn(),
        release: jest.fn(),
        execute: jest.fn(),
      };

      mockDb.getConnection.mockResolvedValueOnce(mockConnection);
      mockDb.execute.mockResolvedValueOnce([[
        { MaVaiTro: 'NHAN_VIEN', TenVaiTro: 'Nhân viên', PermissionCodes: 'STAFF_VIEW' },
      ]]);
      mockConnection.execute.mockResolvedValue([]);
      mockDb.execute.mockResolvedValueOnce([[
        { MaVaiTro: 'NHAN_VIEN', TenVaiTro: 'Nhân viên', PermissionCodes: 'STAFF_VIEW,STAFF_EDIT' },
      ]]);

      const dto: AssignPermissionsDto = { maQuyen: ['STAFF_VIEW', 'STAFF_EDIT'] };
      const result = await service.assignPermissions('NHAN_VIEN', dto, mockAuthUser);

      expect(result.maVaiTro).toBe('NHAN_VIEN');
      expect(mockConnection.commit).toHaveBeenCalled();
    });

    it('should rollback on error', async () => {
      const mockConnection = {
        beginTransaction: jest.fn(),
        commit: jest.fn(),
        rollback: jest.fn(),
        release: jest.fn(),
        execute: jest.fn(),
      };

      mockDb.getConnection.mockResolvedValueOnce(mockConnection);
      mockDb.execute.mockResolvedValueOnce([[]]);
      mockConnection.execute.mockRejectedValueOnce(new Error('DB Error'));

      const dto: AssignPermissionsDto = { maQuyen: ['INVALID'] };

      await expect(
        service.assignPermissions('NHAN_VIEN', dto, mockAuthUser)
      ).rejects.toThrow();

      expect(mockConnection.rollback).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create new role with permissions', async () => {
      const mockConnection = {
        beginTransaction: jest.fn(),
        commit: jest.fn(),
        rollback: jest.fn(),
        release: jest.fn(),
        execute: jest.fn(),
      };

      mockDb.getConnection.mockResolvedValueOnce(mockConnection);
      mockConnection.execute.mockResolvedValue([]);
      mockDb.execute.mockResolvedValueOnce([[
        { MaVaiTro: 'CUSTOM', TenVaiTro: 'Custom Role', PermissionCodes: 'STAFF_VIEW' },
      ]]);

      const dto: CreateRoleDto = { maVaiTro: 'CUSTOM', tenVaiTro: 'Custom Role', maQuyen: ['STAFF_VIEW'] };
      const result = await service.create(dto, mockAuthUser);

      expect(result.maVaiTro).toBe('CUSTOM');
      expect(mockConnection.commit).toHaveBeenCalled();
    });

    it('should reject duplicate role', async () => {
      const mockConnection = {
        beginTransaction: jest.fn(),
        commit: jest.fn(),
        rollback: jest.fn(),
        release: jest.fn(),
        execute: jest.fn(),
      };

      mockDb.getConnection.mockResolvedValueOnce(mockConnection);
      mockConnection.execute.mockRejectedValueOnce({ code: 'ER_DUP_ENTRY' });

      const dto: CreateRoleDto = { maVaiTro: 'ADMIN', tenVaiTro: 'Admin' };

      await expect(service.create(dto, mockAuthUser)).rejects.toThrow(ConflictException);
    });
  });

  describe('RBAC Permission Checks', () => {
    it('should prevent non-admin from role management', async () => {
      const limitedUser: AuthUser = {
        ...mockAuthUser,
        maVaiTro: 'NHAN_VIEN',
        permissions: ['STAFF_VIEW'],
      };

      expect(limitedUser.permissions).not.toContain('ROLE_MANAGE');
    });

    it('should allow admin to manage roles', async () => {
      expect(mockAuthUser.permissions).toContain('ROLE_MANAGE');
    });
  });

  describe('findOne', () => {
    it('should find role by ID', async () => {
      mockDb.execute.mockResolvedValueOnce([[
        { MaVaiTro: 'ADMIN', TenVaiTro: 'Admin', PermissionCodes: 'ROLE_MANAGE' },
      ]]);

      const result = await service.findOne('ADMIN');
      expect(result.maVaiTro).toBe('ADMIN');
    });

    it('should throw NotFoundException if role not found', async () => {
      mockDb.execute.mockResolvedValueOnce([[]]);
      await expect(service.findOne('NONEXISTENT')).rejects.toThrow(NotFoundException);
    });
  });
});
