import { lazy, Suspense, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { EmployeeModal } from './components/EmployeeModal';
import { Toast } from './components/Toast';
import { EmptyState } from './components/ui';
import { api, clearStoredToken, getStoredToken, setStoredToken } from './lib/api';
import * as demo from './lib/mockData';
import { hasPermission } from './lib/navigation';
import type {
  ApiMode,
  ApprovalItem,
  Asset,
  AssetCategory,
  AuditLog,
  AuthUser,
  DashboardOverview,
  Department,
  Employee,
  EmployeeForm,
  NotificationItem,
  Permission,
  ProfileUpdatePayload,
  Role,
  SystemSettings,
} from './lib/types';

const LoginScreen = lazy(() => import('./pages/LoginScreen'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const AssetsPage = lazy(() => import('./pages/AssetsPage'));
const EmployeesPage = lazy(() => import('./pages/EmployeesPage'));
const RolesPage = lazy(() => import('./pages/RolesPage'));
const ApprovalsPage = lazy(() => import('./pages/ApprovalsPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const AuditPage = lazy(() => import('./pages/AuditPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

const emptyEmployee: EmployeeForm = {
  maNhanVien: '',
  hoTen: '',
  chucVu: '',
  email: '',
  soDienThoai: '',
  maPhongBan: 'PB06',
  maVaiTro: 'NHAN_VIEN',
  matKhau: '123456',
  trangThai: 'ACTIVE',
};

function AppContent({ user }: { user: AuthUser }) {
  const navigate = useNavigate();
  const [apiMode, setApiMode] = useState<ApiMode>('api');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

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

  const [employeeSearch, setEmployeeSearch] = useState('');
  const [assetSearch, setAssetSearch] = useState('');
  const [assetStatus, setAssetStatus] = useState('');
  const [assetCategory, setAssetCategory] = useState('');
  const [assetDepartment, setAssetDepartment] = useState('');
  const [auditSearch, setAuditSearch] = useState('');
  const [employeeModal, setEmployeeModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<string | null>(null);
  const [employeeForm, setEmployeeForm] = useState(emptyEmployee);
  const [selectedRoleId, setSelectedRoleId] = useState('ADMIN');
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>(
    demo.roles[0].permissions,
  );

  const selectedRole = roles.find((role) => role.maVaiTro === selectedRoleId);

  useEffect(() => {
    const selected = roles.find((role) => role.maVaiTro === selectedRoleId);
    if (selected) {
      setSelectedPermissionIds(selected.permissions);
    }
  }, [roles, selectedRoleId]);

  async function loadView(viewName: string) {
    setLoading(true);
    try {
      if (viewName === 'dashboard') {
        setDashboard(await api.dashboard());
      }

      if (viewName === 'assets') {
        const [assetList, categoryList, departmentList] = await Promise.all([
          api.assets({
            search: assetSearch,
            maLoai: assetCategory,
            maPhongBan: assetDepartment,
            trangThai: assetStatus,
          }),
          api.assetCategories(),
          api.departments(),
        ]);
        setAssets(assetList.data);
        setAssetCategories(categoryList);
        setDepartments(departmentList);
      }

      if (viewName === 'employees') {
        const [employeeList, departmentList, roleList] = await Promise.all([
          api.employees(employeeSearch),
          api.departments(),
          api.roles(),
        ]);
        setEmployees(employeeList.data);
        setDepartments(departmentList);
        setRoles(roleList);
      }

      if (viewName === 'roles') {
        const [roleList, permissionList] = await Promise.all([
          api.roles(),
          api.permissions(),
        ]);
        setRoles(roleList);
        setPermissions(permissionList);
      }

      if (viewName === 'approvals') {
        setApprovals(await api.approvals());
      }

      if (viewName === 'notifications') {
        setNotifications(await api.notifications());
      }

      if (viewName === 'settings') {
        setSettings(await api.settings());
      }

      if (viewName === 'audit') {
        const logs = await api.auditLogs(auditSearch);
        setAuditLogs(logs.data);
      }

      if (viewName === 'profile') {
        const [profile, departmentList] = await Promise.all([
          api.me(),
          api.profileDepartments(),
        ]);
        setDepartments(departmentList);
      }

      setApiMode('api');
    } catch {
      loadDemoView(viewName);
      setApiMode('demo');
    } finally {
      setLoading(false);
    }
  }

  function loadDemoView(viewName: string) {
    if (viewName === 'dashboard') setDashboard(demo.dashboard);
    if (viewName === 'assets') {
      setAssets(demo.assets);
      setAssetCategories(demo.assetCategories);
      setDepartments(demo.departments);
    }
    if (viewName === 'employees') {
      setEmployees(demo.employees);
      setDepartments(demo.departments);
      setRoles(demo.roles);
    }
    if (viewName === 'roles') {
      setRoles(demo.roles);
      setPermissions(demo.permissions);
    }
    if (viewName === 'approvals') setApprovals(demo.approvals);
    if (viewName === 'notifications') setNotifications(demo.notifications);
    if (viewName === 'settings') setSettings(demo.settings);
    if (viewName === 'audit') setAuditLogs(demo.auditLogs.data);
  }

  function openCreateEmployee() {
    setEditingEmployee(null);
    setEmployeeForm(emptyEmployee);
    setEmployeeModal(true);
  }

  function openEditEmployee(employee: Employee) {
    setEditingEmployee(employee.maNhanVien);
    setEmployeeForm({
      maNhanVien: employee.maNhanVien,
      hoTen: employee.hoTen,
      chucVu: employee.chucVu ?? '',
      email: employee.email,
      soDienThoai: employee.soDienThoai ?? '',
      maPhongBan: employee.maPhongBan,
      maVaiTro: employee.maVaiTro,
      matKhau: '',
      trangThai: employee.trangThai,
    });
    setEmployeeModal(true);
  }

  async function saveEmployee(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      ...employeeForm,
      chucVu: employeeForm.chucVu || undefined,
      soDienThoai: employeeForm.soDienThoai || undefined,
      matKhau: employeeForm.matKhau || undefined,
    };

    try {
      if (editingEmployee) {
        const updated = await api.updateEmployee(editingEmployee, payload);
        setEmployees((current) =>
          current.map((employee) =>
            employee.maNhanVien === editingEmployee ? updated : employee,
          ),
        );
      } else {
        const created = await api.createEmployee({
          ...payload,
          matKhau: employeeForm.matKhau || '123456',
        });
        setEmployees((current) => [created, ...current]);
      }
      setToast('Da luu nhan vien');
    } catch {
      const fallbackEmployee: Employee = {
        maNhanVien: employeeForm.maNhanVien,
        hoTen: employeeForm.hoTen,
        chucVu: employeeForm.chucVu || null,
        email: employeeForm.email,
        soDienThoai: employeeForm.soDienThoai || null,
        maPhongBan: employeeForm.maPhongBan,
        tenPhongBan:
          departments.find(
            (department) => department.maPhongBan === employeeForm.maPhongBan,
          )?.tenPhongBan ?? null,
        maVaiTro: employeeForm.maVaiTro,
        tenVaiTro:
          roles.find((role) => role.maVaiTro === employeeForm.maVaiTro)
            ?.tenVaiTro ?? null,
        trangThai: employeeForm.trangThai,
      };

      setEmployees((current) => {
        if (editingEmployee) {
          return current.map((employee) =>
            employee.maNhanVien === editingEmployee ? fallbackEmployee : employee,
          );
        }
        return [fallbackEmployee, ...current];
      });
      setApiMode('demo');
      setToast('Da cap nhat tren du lieu demo');
    }

    setEmployeeModal(false);
  }

  async function deactivateEmployee(maNhanVien: string) {
    try {
      await api.deleteEmployee(maNhanVien);
      setToast('Da khoa tai khoan nhan vien');
    } catch {
      setApiMode('demo');
      setToast('Da khoa tren du lieu demo');
    }

    setEmployees((current) =>
      current.map((employee) =>
        employee.maNhanVien === maNhanVien
          ? { ...employee, trangThai: 'INACTIVE' }
          : employee,
      ),
    );
  }

  async function saveRolePermissions() {
    if (!selectedRole) return;

    try {
      const updated = await api.assignPermissions(
        selectedRole.maVaiTro,
        selectedPermissionIds,
      );
      setRoles((current) =>
        current.map((role) =>
          role.maVaiTro === updated.maVaiTro ? updated : role,
        ),
      );
      setToast('Da cap nhat quyen');
    } catch {
      setRoles((current) =>
        current.map((role) =>
          role.maVaiTro === selectedRole.maVaiTro
            ? { ...role, permissions: selectedPermissionIds }
            : role,
        ),
      );
      setApiMode('demo');
      setToast('Da cap nhat quyen tren du lieu demo');
    }
  }

  async function signApproval(
    item: ApprovalItem,
    status: 'DA_KY' | 'TU_CHOI',
  ) {
    try {
      await api.signApproval(item, status);
      setToast(status === 'DA_KY' ? 'Da ky duyet' : 'Da tu choi');
    } catch {
      setApiMode('demo');
      setToast(status === 'DA_KY' ? 'Da ky duyet demo' : 'Da tu choi demo');
    }

    setApprovals((current) =>
      current.filter(
        (approval) =>
          approval.maPhieu !== item.maPhieu ||
          approval.loaiPhieu !== item.loaiPhieu,
      ),
    );
  }

  async function saveSettings(nextSettings: SystemSettings) {
    try {
      setSettings(await api.updateSettings(nextSettings));
      setToast('Da luu cau hinh');
    } catch {
      setSettings(nextSettings);
      setApiMode('demo');
      setToast('Da luu cau hinh demo');
    }
  }

  async function saveProfile(payload: ProfileUpdatePayload) {
    try {
      await api.updateProfile(payload);
      setToast('Da cap nhat thong tin ca nhan');
    } catch {
      const department = departments.find(
        (item) => item.maPhongBan === payload.maPhongBan,
      );
      setApiMode('demo');
      setToast('Da cap nhat thong tin demo');
    }
  }

  async function changePassword(oldPassword: string, newPassword: string) {
    try {
      await api.changePassword(oldPassword, newPassword);
      setToast('Da doi mat khau');
    } catch {
      setApiMode('demo');
      setToast('Chua doi duoc mat khau API');
    }
  }

  return (
    <Routes>
      <Route
        element={
          <AppLayout
            apiMode={apiMode}
            loading={loading}
            onLogout={() => {
              clearStoredToken();
              navigate('/login');
            }}
            onReload={() => {
              const path = window.location.pathname.slice(1);
              void loadView(path || 'dashboard');
            }}
            user={user}
          />
        }
      >
        <Route
          path="/dashboard"
          element={
            <Suspense fallback={<div className="loading-screen">Dang tai...</div>}>
              <DashboardPage data={dashboard} onNavigate={(path) => navigate(`/${path}`)} />
            </Suspense>
          }
        />
        <Route
          path="/assets"
          element={
            <Suspense fallback={<div className="loading-screen">Dang tai...</div>}>
              <AssetsPage
                assets={assets}
                categories={assetCategories}
                departments={departments}
                search={assetSearch}
                status={assetStatus}
                category={assetCategory}
                department={assetDepartment}
                onSearch={setAssetSearch}
                onStatus={setAssetStatus}
                onCategory={setAssetCategory}
                onDepartment={setAssetDepartment}
                onRefresh={() => void loadView('assets')}
              />
            </Suspense>
          }
        />
        <Route
          path="/employees"
          element={
            <Suspense fallback={<div className="loading-screen">Dang tai...</div>}>
              <EmployeesPage
                employees={employees}
                search={employeeSearch}
                onSearch={setEmployeeSearch}
                onCreate={openCreateEmployee}
                onEdit={openEditEmployee}
                onDelete={(maNhanVien) => void deactivateEmployee(maNhanVien)}
                onRefresh={() => void loadView('employees')}
              />
            </Suspense>
          }
        />
        <Route
          path="/roles"
          element={
            <Suspense fallback={<div className="loading-screen">Dang tai...</div>}>
              <RolesPage
                roles={roles}
                permissions={permissions}
                selectedRoleId={selectedRoleId}
                selectedPermissionIds={selectedPermissionIds}
                onSelectRole={setSelectedRoleId}
                onTogglePermission={(permissionId) =>
                  setSelectedPermissionIds((current) =>
                    current.includes(permissionId)
                      ? current.filter((id) => id !== permissionId)
                      : [...current, permissionId],
                  )
                }
                onSave={() => void saveRolePermissions()}
              />
            </Suspense>
          }
        />
        <Route
          path="/approvals"
          element={
            <Suspense fallback={<div className="loading-screen">Dang tai...</div>}>
              <ApprovalsPage approvals={approvals} onSign={signApproval} />
            </Suspense>
          }
        />
        <Route
          path="/notifications"
          element={
            <Suspense fallback={<div className="loading-screen">Dang tai...</div>}>
              <NotificationsPage notifications={notifications} />
            </Suspense>
          }
        />
        <Route
          path="/settings"
          element={
            <Suspense fallback={<div className="loading-screen">Dang tai...</div>}>
              <SettingsPage settings={settings} onSave={saveSettings} />
            </Suspense>
          }
        />
        <Route
          path="/audit"
          element={
            <Suspense fallback={<div className="loading-screen">Dang tai...</div>}>
              <AuditPage
                logs={auditLogs}
                search={auditSearch}
                onSearch={setAuditSearch}
                onRefresh={() => void loadView('audit')}
              />
            </Suspense>
          }
        />
        <Route
          path="/profile"
          element={
            <Suspense fallback={<div className="loading-screen">Dang tai...</div>}>
              <ProfilePage
                departments={departments}
                onChangePassword={changePassword}
                onSaveProfile={saveProfile}
                user={user}
              />
            </Suspense>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  const [token, setToken] = useState(getStoredToken());
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    if (token === 'demo-token') {
      setUser(demo.demoUser);
      setLoading(false);
      return;
    }

    api
      .me()
      .then((profile) => {
        setUser(profile);
      })
      .catch(() => {
        clearStoredToken();
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return <div className="loading-screen">Dang tai...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            token ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Suspense fallback={<div className="loading-screen">Dang tai...</div>}>
                <LoginScreen
                  onSuccess={(result) => {
                    setStoredToken(result.token);
                    setToken(result.token);
                    setUser(result.user);
                  }}
                />
              </Suspense>
            )
          }
        />
        <Route
          path="/*"
          element={
            !token ? (
              <Navigate to="/login" replace />
            ) : (
              <AppContent user={user!} />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
