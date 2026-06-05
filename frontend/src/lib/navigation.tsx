import {
  Bell,
  ClipboardCheck,
  FileClock,
  LayoutDashboard,
  PackageSearch,
  QrCode,
  Settings,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { AuthUser, ViewKey } from './types';

export const PERMISSIONS = {
  ASSET_VIEW: 'ASSET_VIEW',

  STAFF_VIEW: 'STAFF_VIEW',

  ROLE_MANAGE: 'ROLE_MANAGE',

  TRANSFER_APPROVE: 'TRANSFER_APPROVE',

  INVENTORY_VIEW: 'INVENTORY_VIEW',
  INVENTORY_SCAN: 'INVENTORY_SCAN',
  INVENTORY_APPROVE: 'INVENTORY_APPROVE',

  CONFIG_SYSTEM: 'CONFIG_SYSTEM',

  AUDIT_VIEW: 'AUDIT_VIEW',
} as const;

type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

type PermissionMode = 'all' | 'any';

export interface NavItem {
  key: ViewKey;
  label: string;
  icon: LucideIcon;
  requiredPermissions?: PermissionCode[];
  permissionMode?: PermissionMode;
}

export const navItems: NavItem[] = [
  {
    key: 'dashboard',
    label: 'Tổng quan',
    icon: LayoutDashboard,
  },
  {
    key: 'assets',
    label: 'Tài sản',
    icon: PackageSearch,
    requiredPermissions: [PERMISSIONS.ASSET_VIEW],
  },
  {
    key: 'inventory',
    label: 'Kiểm kê',
    icon: ClipboardCheck,
    requiredPermissions: [PERMISSIONS.INVENTORY_VIEW],
  },
  {
    key: 'scanner',
    label: 'Quét QR',
    icon: QrCode,
    requiredPermissions: [PERMISSIONS.INVENTORY_SCAN],
  },
  {
    key: 'employees',
    label: 'Nhân viên',
    icon: Users,
    requiredPermissions: [PERMISSIONS.STAFF_VIEW],
  },
  {
    key: 'roles',
    label: 'Vai trò & quyền',
    icon: ShieldCheck,
    requiredPermissions: [PERMISSIONS.ROLE_MANAGE],
  },
  {
    key: 'approvals',
    label: 'Ký duyệt',
    icon: ClipboardCheck,
    requiredPermissions: [
      PERMISSIONS.TRANSFER_APPROVE,
      PERMISSIONS.INVENTORY_APPROVE,
    ],
    permissionMode: 'any',
  },
  {
    key: 'notifications',
    label: 'Thông báo',
    icon: Bell,
  },
  {
    key: 'settings',
    label: 'Cấu hình',
    icon: Settings,
    requiredPermissions: [PERMISSIONS.CONFIG_SYSTEM],
  },
  {
    key: 'audit',
    label: 'Giám sát log',
    icon: FileClock,
    requiredPermissions: [PERMISSIONS.AUDIT_VIEW],
  },
  {
    key: 'profile',
    label: 'Tài khoản',
    icon: User,
  },
];

export function isAdmin(user?: AuthUser | null) {
  return user?.maVaiTro === 'ADMIN';
}

export function hasPermission(
  user: AuthUser | null | undefined,
  requiredPermissions?: PermissionCode[],
  mode: PermissionMode = 'all',
) {
  if (!user) return false;

  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;
  }

  if (isAdmin(user)) {
    return true;
  }

  const userPermissions = new Set(user.permissions ?? []);

  if (mode === 'any') {
    return requiredPermissions.some((permission) =>
      userPermissions.has(permission),
    );
  }

  return requiredPermissions.every((permission) =>
    userPermissions.has(permission),
  );
}

export function getVisibleNavItems(user: AuthUser | null | undefined) {
  if (!user) return [];

  return navItems.filter((item) =>
    hasPermission(
      user,
      item.requiredPermissions,
      item.permissionMode,
    ),
  );
}

export function canAccessView(
  user: AuthUser | null | undefined,
  view: ViewKey,
) {
  const item = navItems.find((navItem) => navItem.key === view);

  if (!item) return false;

  return hasPermission(
    user,
    item.requiredPermissions,
    item.permissionMode,
  );
}
