import {
  LayoutDashboard,
  PackageSearch,
  Users,
  ShieldCheck,
  ClipboardCheck,
  Bell,
  Settings,
  FileClock,
  User,
  type LucideIcon,
} from 'lucide-react';
import type { AuthUser } from './types';

export interface NavItem {
  key: string;
  label: string;
  icon: LucideIcon;
  requiredPermissions?: string[];
}

// Define all available nav items
const allNavItems: NavItem[] = [
  {
    key: 'dashboard',
    label: 'Tổng quan',
    icon: LayoutDashboard,
  },
  {
    key: 'assets',
    label: 'Tài sản',
    icon: PackageSearch,
    requiredPermissions: ['ASSET_VIEW'],
  },
  {
    key: 'employees',
    label: 'Nhân viên',
    icon: Users,
    requiredPermissions: ['STAFF_VIEW'],
  },
  {
    key: 'staff-management',
    label: 'Quản lý nhân viên',
    icon: Users,
    requiredPermissions: ['STAFF_MANAGE'],
  },
  {
    key: 'roles',
    label: 'Vai trò & quyền',
    icon: ShieldCheck,
    requiredPermissions: ['ROLE_MANAGE'],
  },
  {
    key: 'approvals',
    label: 'Ký duyệt',
    icon: ClipboardCheck,
    requiredPermissions: ['APPROVAL_VIEW'],
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
    requiredPermissions: ['SETTINGS_MANAGE'],
  },
  {
    key: 'audit',
    label: 'Giám sát log',
    icon: FileClock,
    requiredPermissions: ['AUDIT_VIEW'],
  },
  {
    key: 'profile',
    label: 'Tài khoản',
    icon: User,
  },
];

/**
 * Get visible nav items based on user's permissions
 * Admin users (permissions includes '*') can see all items
 * Other users see only items they have permission for
 */
export function getVisibleNavItems(user: AuthUser | null): NavItem[] {
  if (!user) {
    return [];
  }

  // Admin with wildcard permission sees everything
  if (user.permissions.includes('*')) {
    return allNavItems;
  }

  // Filter items based on user permissions
  return allNavItems.filter((item) => {
    // Items without permission requirement are always visible
    if (!item.requiredPermissions || item.requiredPermissions.length === 0) {
      return true;
    }

    // User must have at least one of the required permissions
    return item.requiredPermissions.some((perm) =>
      user.permissions.includes(perm),
    );
  });
}
