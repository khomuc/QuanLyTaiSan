import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type {
  ApprovalItem,
  Asset,
  AssetCategory,
  AuditLog,
  DashboardOverview,
  Department,
  Employee,
  NotificationItem,
  Permission,
  Role,
  SystemSettings,
} from '../lib/types';
import * as demo from '../lib/mockData';

interface DataContextType {
  dashboard: DashboardOverview;
  assets: Asset[];
  assetCategories: AssetCategory[];
  employees: Employee[];
  departments: Department[];
  roles: Role[];
  permissions: Permission[];
  approvals: ApprovalItem[];
  notifications: NotificationItem[];
  settings: SystemSettings;
  auditLogs: AuditLog[];
  // Setters
  setDashboard: (data: DashboardOverview) => void;
  setAssets: (data: Asset[]) => void;
  setAssetCategories: (data: AssetCategory[]) => void;
  setEmployees: (data: Employee[]) => void;
  setDepartments: (data: Department[]) => void;
  setRoles: (data: Role[]) => void;
  setPermissions: (data: Permission[]) => void;
  setApprovals: (data: ApprovalItem[]) => void;
  setNotifications: (data: NotificationItem[]) => void;
  setSettings: (data: SystemSettings) => void;
  setAuditLogs: (data: AuditLog[]) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [dashboard, setDashboard] = useState<DashboardOverview>(demo.dashboard);
  const [assets, setAssets] = useState<Asset[]>(demo.assets);
  const [assetCategories, setAssetCategories] = useState<AssetCategory[]>(
    demo.assetCategories,
  );
  const [employees, setEmployees] = useState<Employee[]>(demo.employees);
  const [departments, setDepartments] = useState<Department[]>(demo.departments);
  const [roles, setRoles] = useState<Role[]>(demo.roles);
  const [permissions, setPermissions] = useState<Permission[]>(demo.permissions);
  const [approvals, setApprovals] = useState<ApprovalItem[]>(demo.approvals);
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    demo.notifications,
  );
  const [settings, setSettings] = useState<SystemSettings>(demo.settings);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(demo.auditLogs.data);

  return (
    <DataContext.Provider
      value={{
        dashboard,
        assets,
        assetCategories,
        employees,
        departments,
        roles,
        permissions,
        approvals,
        notifications,
        settings,
        auditLogs,
        setDashboard,
        setAssets,
        setAssetCategories,
        setEmployees,
        setDepartments,
        setRoles,
        setPermissions,
        setApprovals,
        setNotifications,
        setSettings,
        setAuditLogs,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
}
