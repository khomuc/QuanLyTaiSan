import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { EmployeeModal } from './EmployeeModal';
import { Toast } from './Toast';
import { useAuth } from '../contexts/AuthContext';
import { api, getStoredToken } from '../lib/api';
import * as demo from '../lib/mockData';
import { getVisibleNavItems } from '../lib/navigation';
import type {
  ApiMode,
  ApprovalItem,
  Asset,
  AssetCategory,
  AuditLog,
  DashboardOverview,
  Department,
  Employee,
  EmployeeForm,
  NotificationItem,
  Permission,
  ProfileUpdatePayload,
  Role,
  SystemSettings,
} from '../lib/types';

const LoginScreen = lazy(() => import('../pages/LoginScreen'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const AssetsPage = lazy(() => import('../pages/AssetsPage'));
const EmployeesPage = lazy(() => import('../pages/EmployeesPage'));
const StaffManagementPage = lazy(() => import('../pages/StaffManagementPage'));
const RolesPage = lazy(() => import('../pages/RolesPage'));
const ApprovalsPage = lazy(() => import('../pages/ApprovalsPage'));
const NotificationsPage = lazy(() => import('../pages/NotificationsPage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));
const AuditPage = lazy(() => import('../pages/AuditPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));

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

const FALLBACK = <div className="loading-screen">Đang tải...</div>;

export function AppContent() {
  const { user, logout, apiMode: authApiMode } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [apiMode, setApiMode] = useState<ApiMode>(authApiMode || 'api');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  const [dashboard, setDashboard] = useState<DashboardOverview>(demo.dashboard);
  const [assets, setAssets] = useState<Asset[]>(demo.assets);
  const [assetCategories, setAssetCategories] = useState<AssetCategory[]>(demo.assetCategories);
  const [employees, setEmployees] = useState<Employee[]>(demo.employees);
  const [departments, setDepartments] = useState<Department[]>(demo.departments);
  const [roles, setRoles] = useState<Role[]>(demo.roles);
  const [permissions, setPermissions] = useState<Permission[]>(demo.permissions);
  const [approvals, setApprovals] = useState<ApprovalItem[]>(demo.approvals);
  const [notifications, setNotifications] = useState<NotificationItem[]>(demo.notifications);
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
  const visibleNavItems = getVisibleNavItems(user);

  useEffect(() => {
    const selected = roles.find((role) => role.maVaiTro === selectedRoleId);
    if (selected) setSelectedPermissionIds(selected.permissions);
  }, [roles, selectedRoleId]);

  // ── Data loading ──────────────────────────────────────────────────────────

  async function loadView(viewName: string) {
    // Demo mode: never hit the real API. Using a fake demo token against the
    // backend returns 401, which triggers the auto-refresh flow with a fake
    // refresh token, fails, and force-redirects back to '/' (login screen).
    if (getStoredToken() === 'demo-token') {
      loadDemoView(viewName);
      setApiMode('demo');
      return;
    }

    setLoading(true);
    try {
      if (viewName === 'dashboard') {
        setDashboard(await api.dashboard());
      }
      if (viewName === 'assets') {
        const [assetList, categoryList, departmentList] = await Promise.all([
          api.assets({ search: assetSearch, maLoai: assetCategory, maPhongBan: assetDepartment, trangThai: assetStatus }),
          api.assetCategories(),
          api.departments(),
        ]);
        setAssets(assetList.data);
        setAssetCategories(categoryList);
        setDepartments(departmentList);
      }
      if (viewName === 'employees' || viewName === 'staff-management') {
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
        const [roleList, permissionList] = await Promise.all([api.roles(), api.permissions()]);
        setRoles(roleList);
        setPermissions(permissionList);
      }
      if (viewName === 'approvals') setApprovals(await api.approvals());
      if (viewName === 'notifications') setNotifications(await api.notifications());
      if (viewName === 'settings') setSettings(await api.settings());
      if (viewName === 'audit') {
        const logs = await api.auditLogs(auditSearch);
        setAuditLogs(logs.data);
      }
      if (viewName === 'profile') {
        const [, departmentList] = await Promise.all([api.me(), api.profileDepartments()]);
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
    if (viewName === 'assets') { setAssets(demo.assets); setAssetCategories(demo.assetCategories); setDepartments(demo.departments); }
    if (viewName === 'employees' || viewName === 'staff-management') { setEmployees(demo.employees); setDepartments(demo.departments); setRoles(demo.roles); }
    if (viewName === 'roles') { setRoles(demo.roles); setPermissions(demo.permissions); }
    if (viewName === 'approvals') setApprovals(demo.approvals);
    if (viewName === 'notifications') setNotifications(demo.notifications);
    if (viewName === 'settings') setSettings(demo.settings);
    if (viewName === 'audit') setAuditLogs(demo.auditLogs.data);
  }

  // Auto-load data whenever the route changes.
  const loadViewRef = useRef(loadView);
  useEffect(() => { loadViewRef.current = loadView; });

  useEffect(() => {
    const view = pathname.replace(/^\//, '') || 'dashboard';
    void loadViewRef.current(view);
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Employee CRUD ────────────────────────────────────────────────────────

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
        setEmployees((cur) => cur.map((e) => (e.maNhanVien === editingEmployee ? updated : e)));
      } else {
        const created = await api.createEmployee({ ...payload, matKhau: employeeForm.matKhau || '123456' });
        setEmployees((cur) => [created, ...cur]);
      }
      setToast('Đã lưu nhân viên');
    } catch {
      const fallback: Employee = {
        maNhanVien: employeeForm.maNhanVien,
        hoTen: employeeForm.hoTen,
        chucVu: employeeForm.chucVu || null,
        email: employeeForm.email,
        soDienThoai: employeeForm.soDienThoai || null,
        maPhongBan: employeeForm.maPhongBan,
        tenPhongBan: departments.find((d) => d.maPhongBan === employeeForm.maPhongBan)?.tenPhongBan ?? null,
        maVaiTro: employeeForm.maVaiTro,
        tenVaiTro: roles.find((r) => r.maVaiTro === employeeForm.maVaiTro)?.tenVaiTro ?? null,
        trangThai: employeeForm.trangThai,
      };
      setEmployees((cur) =>
        editingEmployee ? cur.map((e) => (e.maNhanVien === editingEmployee ? fallback : e)) : [fallback, ...cur],
      );
      setApiMode('demo');
      setToast('Đã cập nhật trên dữ liệu demo');
    }
    setEmployeeModal(false);
  }

  async function deactivateEmployee(maNhanVien: string) {
    try {
      await api.deleteEmployee(maNhanVien);
      setToast('Đã khóa tài khoản nhân viên');
    } catch {
      setApiMode('demo');
      setToast('Đã khóa trên dữ liệu demo');
    }
    setEmployees((cur) => cur.map((e) => (e.maNhanVien === maNhanVien ? { ...e, trangThai: 'INACTIVE' } : e)));
  }

  // ── Other actions ────────────────────────────────────────────────────────

  async function saveRolePermissions() {
    if (!selectedRole) return;
    try {
      const updated = await api.assignPermissions(selectedRole.maVaiTro, selectedPermissionIds);
      setRoles((cur) => cur.map((r) => (r.maVaiTro === updated.maVaiTro ? updated : r)));
      setToast('Đã cập nhật quyền');
    } catch {
      setRoles((cur) => cur.map((r) => (r.maVaiTro === selectedRole.maVaiTro ? { ...r, permissions: selectedPermissionIds } : r)));
      setApiMode('demo');
      setToast('Đã cập nhật quyền trên dữ liệu demo');
    }
  }

  async function signApproval(item: ApprovalItem, status: 'DA_KY' | 'TU_CHOI') {
    try {
      await api.signApproval(item, status);
      setToast(status === 'DA_KY' ? 'Đã ký duyệt' : 'Đã từ chối');
    } catch {
      setApiMode('demo');
      setToast(status === 'DA_KY' ? 'Đã ký duyệt demo' : 'Đã từ chối demo');
    }
    setApprovals((cur) => cur.filter((a) => a.maPhieu !== item.maPhieu || a.loaiPhieu !== item.loaiPhieu));
  }

  async function saveSettings(nextSettings: SystemSettings) {
    try {
      setSettings(await api.updateSettings(nextSettings));
      setToast('Đã lưu cấu hình');
    } catch {
      setSettings(nextSettings);
      setApiMode('demo');
      setToast('Đã lưu cấu hình demo');
    }
  }

  async function saveProfile(payload: ProfileUpdatePayload) {
    try {
      await api.updateProfile(payload);
      setToast('Đã cập nhật thông tin cá nhân');
    } catch {
      setApiMode('demo');
      setToast('Đã cập nhật thông tin demo');
    }
  }

  async function changePassword(oldPassword: string, newPassword: string) {
    try {
      await api.changePassword(oldPassword, newPassword);
      setToast('Đã đổi mật khẩu');
    } catch {
      setApiMode('demo');
      setToast('Chưa đổi được mật khẩu API');
    }
  }

  // ── Render ──────────────────────────────────────────────────────────

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Routes>
        <Route
          element={
            <AppLayout
              apiMode={apiMode}
              loading={loading}
              onLogout={logout}
              onReload={() => {
                const view = pathname.replace(/^\//, '') || 'dashboard';
                void loadView(view);
              }}
              user={user}
              navItems={visibleNavItems}
            />
          }
        >
          <Route
            path="/dashboard"
            element={
              <Suspense fallback={FALLBACK}>
                <DashboardPage data={dashboard} onNavigate={(path) => navigate(`/${path}`)} />
              </Suspense>
            }
          />
          <Route
            path="/assets"
            element={
              <Suspense fallback={FALLBACK}>
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
              <Suspense fallback={FALLBACK}>
                <EmployeesPage
                  employees={employees}
                  departments={departments}
                  roles={roles}
                  search={employeeSearch}
                  onSearch={setEmployeeSearch}
                  onCreate={openCreateEmployee}
                  onEdit={openEditEmployee}
                  onDelete={(id) => void deactivateEmployee(id)}
                  onRefresh={() => void loadView('employees')}
                />
              </Suspense>
            }
          />
          <Route
            path="/staff-management"
            element={
              <Suspense fallback={FALLBACK}>
                <StaffManagementPage />
              </Suspense>
            }
          />
          <Route
            path="/roles"
            element={
              <Suspense fallback={FALLBACK}>
                <RolesPage
                  roles={roles}
                  permissions={permissions}
                  selectedRoleId={selectedRoleId}
                  selectedPermissionIds={selectedPermissionIds}
                  onSelectRole={setSelectedRoleId}
                  onTogglePermission={(id) =>
                    setSelectedPermissionIds((cur) =>
                      cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id],
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
              <Suspense fallback={FALLBACK}>
                <ApprovalsPage approvals={approvals} onSign={signApproval} />
              </Suspense>
            }
          />
          <Route
            path="/notifications"
            element={
              <Suspense fallback={FALLBACK}>
                <NotificationsPage notifications={notifications} />
              </Suspense>
            }
          />
          <Route
            path="/settings"
            element={
              <Suspense fallback={FALLBACK}>
                <SettingsPage settings={settings} onSave={saveSettings} />
              </Suspense>
            }
          />
          <Route
            path="/audit"
            element={
              <Suspense fallback={FALLBACK}>
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
              <Suspense fallback={FALLBACK}>
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

      {employeeModal && (
        <EmployeeModal
          departments={departments}
          isEditing={editingEmployee !== null}
          form={employeeForm}
          onChange={setEmployeeForm}
          onClose={() => setEmployeeModal(false)}
          onSubmit={saveEmployee}
          roles={roles}
        />
      )}
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </>
  );
}
