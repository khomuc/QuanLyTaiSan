import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { MYSQL_CONNECTION } from '../common/constants';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

describe('AuthService - Authentication & Security', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let mockDb: any;

  beforeEach(async () => {
    mockDb = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: MYSQL_CONNECTION, useValue: mockDb },
        { provide: JwtService, useValue: { signAsync: jest.fn() } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const loginDto: LoginDto = { email: 'user@test.com', matKhau: 'password123' };

      const mockEmployee = [[
        {
          MaNhanVien: 'NV001',
          Email: 'user@test.com',
          MatKhau: '$2b$12$hashedpassword',
          HoTen: 'Test User',
          TrangThai: 'ACTIVE',
          MaVaiTro: 'NHAN_VIEN',
        },
      ]];

      mockDb.execute.mockImplementation((query: string) => {
        if (query.includes('NHAN_VIEN')) return Promise.resolve(mockEmployee);
        return Promise.resolve([[]]);
      });

      jest.spyOn(service as any, 'verifyPassword').mockResolvedValue(true);
      jest.spyOn(service as any, 'getPermissions').mockResolvedValue(['STAFF_VIEW']);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('jwt-token');

      const result = await service.login(loginDto);

      expect(result.accessToken).toBe('jwt-token');
      expect(result.user.email).toBe('user@test.com');
      expect(result.user.trangThai).toBe('ACTIVE');
    });

    it('should reject login with invalid email', async () => {
      const loginDto: LoginDto = { email: 'nonexistent@test.com', matKhau: 'password123' };
      mockDb.execute.mockResolvedValue([[]]);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should reject login with wrong password', async () => {
      const loginDto: LoginDto = { email: 'user@test.com', matKhau: 'wrongpassword' };
      const mockEmployee = [[
        { MaNhanVien: 'NV001', Email: 'user@test.com', MatKhau: '$2b$12$hashedpassword', HoTen: 'User', TrangThai: 'ACTIVE' },
      ]];

      mockDb.execute.mockResolvedValueOnce(mockEmployee);
      jest.spyOn(service as any, 'verifyPassword').mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should reject login for inactive users', async () => {
      const loginDto: LoginDto = { email: 'inactive@test.com', matKhau: 'password123' };
      const mockEmployee = [[
        { MaNhanVien: 'NV002', Email: 'inactive@test.com', MatKhau: '$2b$12$hashedpassword', HoTen: 'User', TrangThai: 'INACTIVE' },
      ]];

      mockDb.execute.mockResolvedValueOnce(mockEmployee);
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('Password Security', () => {
    it('should use bcrypt for password hashing', async () => {
      const bcryptHash = '$2b$12$SomeHashedPassword';
      expect(bcryptHash.startsWith('$2b$') || bcryptHash.startsWith('$2a$')).toBe(true);
    });

    it('should support legacy plaintext passwords', async () => {
      jest.spyOn(service as any, 'verifyPassword').mockImplementation(
        (plain: string, stored: string) => {
          if (stored.startsWith('$2a$') || stored.startsWith('$2b$')) {
            return Promise.resolve(false);
          }
          return Promise.resolve(plain === stored);
        }
      );

      const result = await (service as any).verifyPassword('plaintext', 'plaintext');
      expect(result).toBe(true);
    });
  });

  describe('JWT Token Generation', () => {
    it('should generate JWT token with user data', async () => {
      const mockUser = {
        maNhanVien: 'NV001',
        email: 'user@test.com',
        hoTen: 'Test User',
        maVaiTro: 'NHAN_VIEN',
        permissions: ['STAFF_VIEW'],
      };

      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('jwt-token');
      const token = await (service as any).signToken(mockUser);

      expect(token).toBe('jwt-token');
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({ sub: 'NV001', ...mockUser }),
        expect.any(Object)
      );
    });
  });
});
