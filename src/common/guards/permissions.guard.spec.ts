import type { ExecutionContext } from '@nestjs/common';
import { PermissionsGuard } from './permissions.guard';

function createContext(userPermissions: string[], role = 'NHAN_VIEN') {
  return {
    getClass: jest.fn(),
    getHandler: jest.fn(),
    switchToHttp: () => ({
      getRequest: () => ({
        user: {
          maNhanVien: 'NV001',
          email: 'nv001@example.com',
          hoTen: 'Nhan vien test',
          maVaiTro: role,
          permissions: userPermissions,
        },
      }),
    }),
  } as unknown as ExecutionContext;
}

describe('PermissionsGuard', () => {
  const reflector = {
    getAllAndOverride: jest.fn(),
  };
  const guard = new PermissionsGuard(reflector as never);

  beforeEach(() => {
    reflector.getAllAndOverride.mockReset();
  });

  it('allows requests when route has no required permission', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    expect(guard.canActivate(createContext([]))).toBe(true);
  });

  it('allows users that have all required permissions', () => {
    reflector.getAllAndOverride.mockReturnValue(['CONFIG_SYSTEM']);

    expect(guard.canActivate(createContext(['CONFIG_SYSTEM']))).toBe(true);
  });

  it('blocks users that miss a required permission', () => {
    reflector.getAllAndOverride.mockReturnValue(['CONFIG_SYSTEM']);

    expect(guard.canActivate(createContext(['STAFF_VIEW']))).toBe(false);
  });

  it('allows ADMIN role even when explicit permissions are not present', () => {
    reflector.getAllAndOverride.mockReturnValue(['CONFIG_SYSTEM']);

    expect(guard.canActivate(createContext([], 'ADMIN'))).toBe(true);
  });
});
