import {
  Bell,
  ClipboardCheck,
  FileClock,
  LayoutDashboard,
  PackageSearch,
  Settings,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { AuthUser, ViewKey } from './types';

export interface NavItem {
  key: ViewKey;
  label: string;
  icon: LucideIcon;
  requiredPermission?: string;
}

export const navItems: NavItem[] = [
  { key: 'dashboard', label: 'Tong quan', icon: LayoutDashboard },
  {
    key: 'assets',
    label: 'Tai san',
    icon: PackageSearch,
    requiredPermission: 'ASSET_VIEW',
  },
  {
    key: 'employees',
    label: 'Nhan vien',
    icon: Users,
    requiredPermission: 'STAFF_VIEW',
  },
  {
    key: 'roles',
    label: 'Vai tro & quyen',
    icon: ShieldCheck,
    requiredPermission: 'ROLE_MANAGE',
  },
  { key: 'approvals', label: 'Ky duyet', icon: ClipboardCheck },
  { key: 'notifications', label: 'Thong bao', icon: Bell },
  {
    key: 'settings',
    label: 'Cau hinh',
    icon: Settings,
    requiredPermission: 'CONFIG_SYSTEM',
  },
  {
    key: 'audit',
    label: 'Giam sat log',
    icon: FileClock,
    requiredPermission: 'AUDIT_VIEW',
  },
  { key: 'profile', label: 'Tai khoan', icon: User },
];

export function hasPermission(user: AuthUser, permission?: string) {
  if (!permission) return true;
  if (user.maVaiTro === 'ADMIN') return true;
  return user.permissions.includes(permission);
}

export function getVisibleNavItems(user: AuthUser) {
  return navItems.filter((item) => hasPermission(user, item.requiredPermission));
}

export function canAccessView(user: AuthUser, view: ViewKey) {
  const item = navItems.find((navItem) => navItem.key === view);
  return item ? hasPermission(user, item.requiredPermission) : false;
}
