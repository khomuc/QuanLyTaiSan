import {
  BadgeCheck,
  BarChart3,
  Bell,
  Check,
  ClipboardCheck,
  Edit3,
  Eye,
  EyeOff,
  FileClock,
  Filter,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  PackageSearch,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  QrCode,
  RefreshCw,
  Save,
  Search,
  Settings,
  ShieldCheck,
  Trash2,
  User,
  Users,
  X,
  ArrowRightLeft,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { api, clearStoredToken, getStoredToken, setStoredToken } from './lib/api';
import * as demo from './lib/mockData';
import type {
  ApprovalItem,
  Asset,
  AssetCategory,
  AuditLog,
  AuthUser,
  DashboardOverview,
  Department,
  Employee,
  NotificationItem,
  Permission,
  Role,
  SystemSettings,
  ViewKey,
} from './lib/types';

type ApiMode = 'api' | 'demo';

interface NavItem {
  key: ViewKey;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { key: 'dashboard', label: 'Tong quan', icon: LayoutDashboard },
  { key: 'assets', label: 'Tai san', icon: PackageSearch },
  { key: 'employees', label: 'Nhan vien', icon: Users },
  { key: 'transfer', label: 'Dieu chuyen', icon: ArrowRightLeft },
  { key: 'roles', label: 'Vai tro & quyen', icon: ShieldCheck },
  { key: 'approvals', label: 'Ky duyet', icon: ClipboardCheck },
  { key: 'notifications', label: 'Thong bao', icon: Bell },
  { key: 'settings', label: 'Cau hinh', icon: Settings },
  { key: 'audit', label: 'Giam sat log', icon: FileClock },
  { key: 'profile', label: 'Tai khoan', icon: User },
];

interface EmployeeForm {
  maNhanVien: string;
  hoTen: string;
  chucVu: string;
  email: string;
  soDienThoai: string;
  maPhongBan: string;
  maVaiTro: string;
  matKhau: string;
  trangThai: Employee['trangThai'];
}

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

function App() {
  const [token, setToken] = useState(getStoredToken());
  const [user, setUser] = useState<AuthUser | null>(null);
  const [view, setView] = useState<ViewKey>('dashboard');
  const [apiMode, setApiMode] = useState<ApiMode>('api');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
  const [transferSlips, setTransferSlips] = useState<any[]>([]);
  const [transferHistory, setTransferHistory] = useState<any>({ summary: [], items: [] });

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

  useEffect(() => {
    function closeSidebarWithEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setSidebarOpen(false);
      }
    }

    window.addEventListener('keydown', closeSidebarWithEscape);
    return () => window.removeEventListener('keydown', closeSidebarWithEscape);
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }

    if (token === 'demo-token') {
      setUser(demo.demoUser);
      setApiMode('demo');
      return;
    }

    api
      .me()
      .then((profile) => {
        setUser(profile);
        setApiMode('api');
      })
      .catch(() => {
        clearStoredToken();
        setToken(null);
      });
  }, [token]);

  useEffect(() => {
    if (user) {
      void loadView(view);
    }
  }, [view, user]);

  useEffect(() => {
    const selected = roles.find((role) => role.maVaiTro === selectedRoleId);
    if (selected) {
      setSelectedPermissionIds(selected.permissions);
    }
  }, [roles, selectedRoleId]);

  const filteredEmployees = useMemo(() => {
    const keyword = employeeSearch.trim().toLowerCase();
    if (!keyword) {
      return employees;
    }

    return employees.filter((employee) =>
      [
        employee.maNhanVien,
        employee.hoTen,
        employee.email,
        employee.tenPhongBan ?? '',
        employee.tenVaiTro ?? '',
      ]
        .join(' ')
        .toLowerCase()
        .includes(keyword),
    );
  }, [employees, employeeSearch]);

  const selectedRole = roles.find((role) => role.maVaiTro === selectedRoleId);

  async function loadView(nextView: ViewKey) {
    setLoading(true);
    try {
      if (nextView === 'dashboard') {
        setDashboard(await api.dashboard());
      }

      if (nextView === 'assets') {
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

      if (nextView === 'employees') {
        const [employeeList, departmentList, roleList] = await Promise.all([
          api.employees(employeeSearch),
          api.departments(),
          api.roles(),
        ]);
        setEmployees(employeeList.data);
        setDepartments(departmentList);
        setRoles(roleList);
      }

      if (nextView === 'roles') {
        const [roleList, permissionList] = await Promise.all([
          api.roles(),
          api.permissions(),
        ]);
        setRoles(roleList);
        setPermissions(permissionList);
      }

      if (nextView === 'approvals') {
        setApprovals(await api.approvals());
      }

      if (nextView === 'notifications') {
        setNotifications(await api.notifications());
      }

      if (nextView === 'settings') {
        setSettings(await api.settings());
      }

      if (nextView === 'audit') {
        const logs = await api.auditLogs(auditSearch);
        setAuditLogs(logs.data);
      }

      if (nextView === 'profile') {
        setUser(await api.me());
      }

      if (nextView === 'transfer') {
        const [deptList, empList, slipsList, historyData, assetList] = await Promise.all([
          api.departments(),
          api.employees(),
          api.listTransferSlips(),
          api.historyReport(),
          api.assets(),
        ]);
        setDepartments(deptList);
        setEmployees(empList.data);
        setTransferSlips(slipsList);
        setTransferHistory(historyData);
        setAssets(assetList.data);
      }

      setApiMode('api');
    } catch {
      loadDemoView(nextView);
      setApiMode('demo');
    } finally {
      setLoading(false);
    }
  }

  function loadDemoView(nextView: ViewKey) {
    if (nextView === 'dashboard') setDashboard(demo.dashboard);
    if (nextView === 'transfer') {
      setDepartments(demo.departments);
      setEmployees(demo.employees);
      setTransferSlips([]);
      setTransferHistory({ summary: [], items: [] });
    }
    if (nextView === 'assets') {
      setAssets(demo.assets);
      setAssetCategories(demo.assetCategories);
      setDepartments(demo.departments);
    }
    if (nextView === 'employees') {
      setEmployees(demo.employees);
      setDepartments(demo.departments);
      setRoles(demo.roles);
    }
    if (nextView === 'roles') {
      setRoles(demo.roles);
      setPermissions(demo.permissions);
    }
    if (nextView === 'approvals') setApprovals(demo.approvals);
    if (nextView === 'notifications') setNotifications(demo.notifications);
    if (nextView === 'settings') setSettings(demo.settings);
    if (nextView === 'audit') setAuditLogs(demo.auditLogs.data);
  }

  function handleLoginSuccess(result: { token: string; user: AuthUser }) {
    setStoredToken(result.token);
    setToken(result.token);
    setUser(result.user);
    setView('dashboard');
  }

  function logout() {
    clearStoredToken();
    setToken(null);
    setUser(null);
    setApiMode('api');
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

  if (!user) {
    return <LoginScreen onSuccess={handleLoginSuccess} />;
  }

  return (
    <div className={`app-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {sidebarOpen && (
        <button
          aria-label="Dong menu"
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          type="button"
        />
      )}
      <aside
        className={`sidebar ${sidebarOpen ? 'is-open' : ''} ${
          sidebarCollapsed ? 'is-collapsed' : ''
        }`}
      >
        <div className="sidebar-head">
          <div className="brand">
            <div className="brand-mark">QL</div>
            <div className="brand-copy">
              <strong>Quan Ly Tai San</strong>
              <span>System Lead</span>
            </div>
          </div>
          <button
            aria-label={sidebarCollapsed ? 'Mo rong sidebar' : 'Thu gon sidebar'}
            aria-pressed={sidebarCollapsed}
            className="icon-button sidebar-toggle desktop-only"
            onClick={() => setSidebarCollapsed((current) => !current)}
            title={sidebarCollapsed ? 'Mo rong sidebar' : 'Thu gon sidebar'}
            type="button"
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen size={18} />
            ) : (
              <PanelLeftClose size={18} />
            )}
          </button>
          <button
            aria-label="Dong menu"
            className="icon-button sidebar-toggle mobile-sidebar-close"
            onClick={() => setSidebarOpen(false)}
            title="Dong menu"
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                className={view === item.key ? 'nav-item active' : 'nav-item'}
                key={item.key}
                onClick={() => {
                  setView(item.key);
                  setSidebarOpen(false);
                }}
                title={item.label}
                type="button"
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <button
            aria-expanded={sidebarOpen}
            aria-label={sidebarOpen ? 'Dong menu' : 'Mo menu'}
            className="icon-button mobile-only"
            onClick={() => setSidebarOpen((current) => !current)}
            title={sidebarOpen ? 'Dong menu' : 'Mo menu'}
            type="button"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div>
            <p className="eyebrow">Phan he System Lead</p>
            <h1>{navItems.find((item) => item.key === view)?.label}</h1>
          </div>
          <div className="topbar-actions">
            <span className={`mode-pill ${apiMode}`}>{apiMode.toUpperCase()}</span>
            <button
              className="icon-button"
              onClick={() => void loadView(view)}
              title="Tai lai"
              type="button"
            >
              <RefreshCw size={18} />
            </button>
            <button
              className="profile-button"
              onClick={() => setView('profile')}
              type="button"
            >
              <span>{user.hoTen}</span>
              <User size={18} />
            </button>
            <button
              className="icon-button danger"
              onClick={logout}
              title="Dang xuat"
              type="button"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <main className="content">
          {loading && <div className="loading-bar" />}
          {view === 'dashboard' && (
            <DashboardPage data={dashboard} onNavigate={setView} />
          )}
          {view === 'assets' && (
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
          )}
          {view === 'employees' && (
            <EmployeesPage
              employees={filteredEmployees}
              search={employeeSearch}
              onSearch={setEmployeeSearch}
              onCreate={openCreateEmployee}
              onEdit={openEditEmployee}
              onDelete={(maNhanVien) => void deactivateEmployee(maNhanVien)}
              onRefresh={() => void loadView('employees')}
            />
          )}
          {view === 'transfer' && (
            <TransferPage
              departments={departments}
              employees={employees}
              assets={assets}
              slips={transferSlips}
              history={transferHistory}
              onRefresh={() => void loadView('transfer')}
              setToast={setToast}
            />
          )}
          {view === 'roles' && (
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
          )}
          {view === 'approvals' && (
            <ApprovalsPage approvals={approvals} onSign={signApproval} />
          )}
          {view === 'notifications' && (
            <NotificationsPage notifications={notifications} />
          )}
          {view === 'settings' && (
            <SettingsPage settings={settings} onSave={saveSettings} />
          )}
          {view === 'audit' && (
            <AuditPage
              logs={auditLogs}
              search={auditSearch}
              onSearch={setAuditSearch}
              onRefresh={() => void loadView('audit')}
            />
          )}
          {view === 'profile' && <ProfilePage user={user} setToast={setToast} />}
        </main>

        <footer className="footer">
          <span>Quan ly tai san QR</span>
          <span>Nguyen Thi Huynh Nhu - B2204960</span>
        </footer>
      </div>

      {employeeModal && (
        <EmployeeModal
          form={employeeForm}
          departments={departments}
          roles={roles}
          isEditing={Boolean(editingEmployee)}
          onChange={setEmployeeForm}
          onClose={() => setEmployeeModal(false)}
          onSubmit={saveEmployee}
        />
      )}

      {toast && (
        <div className="toast">
          <BadgeCheck size={18} />
          <span>{toast}</span>
          <button onClick={() => setToast('')} title="Dong" type="button">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

function LoginScreen({
  onSuccess,
}: {
  onSuccess: (result: { token: string; user: AuthUser }) => void;
}) {
  const [email, setEmail] = useState('hieutruong@ctu.edu.vn');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await api.login(email, password);
      onSuccess({ token: result.accessToken, user: result.user });
    } catch {
      setError('Khong dang nhap duoc API hien tai');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="brand large">
          <div className="brand-mark">QL</div>
          <div>
            <strong>Quan Ly Tai San</strong>
            <span>System Lead console</span>
          </div>
        </div>

        <form onSubmit={submit} className="login-form">
          <label>
            Email
            <input
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              value={email}
            />
          </label>
          <label>
            Mat khau
            <div className="password-field">
              <input
                autoComplete="current-password"
                onChange={(event) => setPassword(event.target.value)}
                type={showPassword ? 'text' : 'password'}
                value={password}
              />
              <button
                aria-label={showPassword ? 'An mat khau' : 'Hien mat khau'}
                onClick={() => setShowPassword((current) => !current)}
                title={showPassword ? 'An mat khau' : 'Hien mat khau'}
                type="button"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="primary-button" disabled={loading} type="submit">
            <KeyRound size={18} />
            Dang nhap
          </button>
          <button
            className="secondary-button"
            onClick={() => onSuccess({ token: 'demo-token', user: demo.demoUser })}
            type="button"
          >
            Mo giao dien demo
          </button>
        </form>
      </section>
    </main>
  );
}

function DashboardPage({
  data,
  onNavigate,
}: {
  data: DashboardOverview;
  onNavigate: (view: ViewKey) => void;
}) {
  return (
    <div className="page-grid">
      <KpiTile
        icon={Users}
        label="Nhan vien"
        onClick={() => onNavigate('employees')}
        tone="green"
        value={data.employees.total}
      />
      <KpiTile
        icon={BarChart3}
        label="Tai san"
        onClick={() => onNavigate('assets')}
        tone="amber"
        value={data.assets.total}
      />
      <KpiTile
        icon={ClipboardCheck}
        label="Cho ky duyet"
        onClick={() => onNavigate('approvals')}
        tone="red"
        value={data.approvals.totalPending}
      />

      <section className="panel span-2">
        <div className="panel-header">
          <h2>Trang thai tai san</h2>
        </div>
        <div className="status-grid">
          {data.assets.byStatus.map((item) => (
            <div className="status-row" key={item.name}>
              <span>{item.name}</span>
              <strong>{item.total}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Log gan day</h2>
        </div>
        <div className="compact-list">
          {data.recentLogs.map((log) => (
            <div className="compact-item" key={log.maLog}>
              <strong>{log.hanhDong}</strong>
              <span>{log.hoTen ?? log.maNhanVien ?? 'He thong'}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function KpiTile({
  icon: Icon,
  label,
  onClick,
  value,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  value: number;
  tone: 'green' | 'amber' | 'red';
}) {
  const Component = onClick ? 'button' : 'section';

  return (
    <Component
      className={`kpi-tile ${tone} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
      title={onClick ? `Mo ${label}` : undefined}
      type={onClick ? 'button' : undefined}
    >
      <div className="kpi-icon">
        <Icon size={22} />
      </div>
      <span>{label}</span>
      <strong>{value}</strong>
    </Component>
  );
}

function AssetsPage({
  assets,
  categories,
  departments,
  search,
  status,
  category,
  department,
  onSearch,
  onStatus,
  onCategory,
  onDepartment,
  onRefresh,
}: {
  assets: Asset[];
  categories: AssetCategory[];
  departments: Department[];
  search: string;
  status: string;
  category: string;
  department: string;
  onSearch: (value: string) => void;
  onStatus: (value: string) => void;
  onCategory: (value: string) => void;
  onDepartment: (value: string) => void;
  onRefresh: () => void;
}) {
  const totalValue = assets.reduce((sum, asset) => sum + asset.giaTriConLai, 0);

  return (
    <div className="assets-layout">
      <section className="asset-toolbar panel">
        <div className="search-box">
          <Search size={18} />
          <input
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Tim ma tai san, QR, ten, serial"
            value={search}
          />
        </div>
        <select
          aria-label="Loc loai tai san"
          onChange={(event) => onCategory(event.target.value)}
          value={category}
        >
          <option value="">Tat ca loai</option>
          {categories.map((item) => (
            <option key={item.maLoai} value={item.maLoai}>
              {item.tenLoai}
            </option>
          ))}
        </select>
        <select
          aria-label="Loc phong ban"
          onChange={(event) => onDepartment(event.target.value)}
          value={department}
        >
          <option value="">Tat ca phong ban</option>
          {departments.map((item) => (
            <option key={item.maPhongBan} value={item.maPhongBan}>
              {item.tenPhongBan}
            </option>
          ))}
        </select>
        <select
          aria-label="Loc trang thai"
          onChange={(event) => onStatus(event.target.value)}
          value={status}
        >
          <option value="">Tat ca trang thai</option>
          <option value="HOAT_DONG">Hoat dong</option>
          <option value="BAO_TRI">Bao tri</option>
          <option value="HONG">Hong</option>
        </select>
        <button className="primary-button" onClick={onRefresh} type="button">
          <Filter size={18} />
          Ap dung
        </button>
      </section>

      <div className="asset-summary">
        <KpiTile
          icon={PackageSearch}
          label="Tai san dang xem"
          tone="green"
          value={assets.length}
        />
        <KpiTile
          icon={QrCode}
          label="Co ma QR"
          tone="amber"
          value={assets.filter((asset) => Boolean(asset.maQR)).length}
        />
        <section className="kpi-tile red">
          <div className="kpi-icon">
            <BarChart3 size={22} />
          </div>
          <span>Gia tri con lai</span>
          <strong>{formatCurrencyShort(totalValue)}</strong>
        </section>
      </div>

      <section className="panel full">
        <div className="panel-header">
          <h2>Danh muc tai san</h2>
          <button className="icon-button" onClick={onRefresh} title="Tai lai">
            <RefreshCw size={18} />
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Ma / QR</th>
                <th>Ten tai san</th>
                <th>Loai</th>
                <th>Phong ban</th>
                <th>Gia tri con lai</th>
                <th>Trang thai</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset.maTaiSan}>
                  <td>
                    <strong>{asset.maTaiSan}</strong>
                    <span>{asset.maQR ?? asset.soHieuTSCD ?? 'Chua gan QR'}</span>
                  </td>
                  <td>
                    <strong>{asset.tenTaiSan}</strong>
                    <span>{[asset.model, asset.serial].filter(Boolean).join(' - ')}</span>
                  </td>
                  <td>{asset.tenLoai ?? asset.maLoai}</td>
                  <td>{asset.tenPhongBan ?? asset.maPhongBanHienTai}</td>
                  <td>{formatCurrency(asset.giaTriConLai)}</td>
                  <td>
                    <StatusPill value={asset.trangThai} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!assets.length && <EmptyState text="Khong tim thay tai san phu hop" />}
      </section>
    </div>
  );
}

function EmployeesPage({
  employees,
  search,
  onSearch,
  onCreate,
  onEdit,
  onDelete,
  onRefresh,
}: {
  employees: Employee[];
  search: string;
  onSearch: (value: string) => void;
  onCreate: () => void;
  onEdit: (employee: Employee) => void;
  onDelete: (maNhanVien: string) => void;
  onRefresh: () => void;
}) {
  return (
    <section className="panel full">
      <div className="panel-header">
        <div className="search-box">
          <Search size={18} />
          <input
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Tim ma, ten, email, phong ban"
            value={search}
          />
        </div>
        <div className="button-row">
          <button className="icon-button" onClick={onRefresh} title="Tai lai">
            <RefreshCw size={18} />
          </button>
          <button className="primary-button" onClick={onCreate} type="button">
            <Plus size={18} />
            Them nhan vien
          </button>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Ma</th>
              <th>Ho ten</th>
              <th>Email</th>
              <th>Phong ban</th>
              <th>Vai tro</th>
              <th>Trang thai</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.maNhanVien}>
                <td>{employee.maNhanVien}</td>
                <td>
                  <strong>{employee.hoTen}</strong>
                  <span>{employee.chucVu}</span>
                </td>
                <td>{employee.email}</td>
                <td>{employee.tenPhongBan ?? employee.maPhongBan}</td>
                <td>{employee.tenVaiTro ?? employee.maVaiTro}</td>
                <td>
                  <StatusPill value={employee.trangThai} />
                </td>
                <td className="row-actions">
                  <button
                    className="icon-button"
                    onClick={() => onEdit(employee)}
                    title="Sua"
                    type="button"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    className="icon-button danger"
                    onClick={() => onDelete(employee.maNhanVien)}
                    title="Khoa tai khoan"
                    type="button"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function EmployeeModal({
  form,
  departments,
  roles,
  isEditing,
  onChange,
  onClose,
  onSubmit,
}: {
  form: EmployeeForm;
  departments: Department[];
  roles: Role[];
  isEditing: boolean;
  onChange: (form: EmployeeForm) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="modal-backdrop">
      <form className="modal" onSubmit={onSubmit}>
        <div className="panel-header">
          <h2>{isEditing ? 'Sua nhan vien' : 'Them nhan vien'}</h2>
          <button
            className="icon-button"
            onClick={onClose}
            title="Dong"
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <div className="form-grid">
          <label>
            Ma nhan vien
            <input
              disabled={isEditing}
              onChange={(event) =>
                onChange({ ...form, maNhanVien: event.target.value })
              }
              required
              value={form.maNhanVien}
            />
          </label>
          <label>
            Ho ten
            <input
              onChange={(event) =>
                onChange({ ...form, hoTen: event.target.value })
              }
              required
              value={form.hoTen}
            />
          </label>
          <label>
            Email
            <input
              onChange={(event) => onChange({ ...form, email: event.target.value })}
              required
              type="email"
              value={form.email}
            />
          </label>
          <label>
            Chuc vu
            <input
              onChange={(event) =>
                onChange({ ...form, chucVu: event.target.value })
              }
              value={form.chucVu}
            />
          </label>
          <label>
            So dien thoai
            <input
              onChange={(event) =>
                onChange({ ...form, soDienThoai: event.target.value })
              }
              value={form.soDienThoai}
            />
          </label>
          <label>
            Mat khau
            <input
              onChange={(event) =>
                onChange({ ...form, matKhau: event.target.value })
              }
              required={!isEditing}
              type="password"
              value={form.matKhau}
            />
          </label>
          <label>
            Phong ban
            <select
              onChange={(event) =>
                onChange({ ...form, maPhongBan: event.target.value })
              }
              value={form.maPhongBan}
            >
              {departments.map((department) => (
                <option key={department.maPhongBan} value={department.maPhongBan}>
                  {department.tenPhongBan}
                </option>
              ))}
            </select>
          </label>
          <label>
            Vai tro
            <select
              onChange={(event) =>
                onChange({ ...form, maVaiTro: event.target.value })
              }
              value={form.maVaiTro}
            >
              {roles.map((role) => (
                <option key={role.maVaiTro} value={role.maVaiTro}>
                  {role.tenVaiTro}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="modal-actions">
          <button className="secondary-button" onClick={onClose} type="button">
            Huy
          </button>
          <button className="primary-button" type="submit">
            <Save size={18} />
            Luu
          </button>
        </div>
      </form>
    </div>
  );
}

function RolesPage({
  roles,
  permissions,
  selectedRoleId,
  selectedPermissionIds,
  onSelectRole,
  onTogglePermission,
  onSave,
}: {
  roles: Role[];
  permissions: Permission[];
  selectedRoleId: string;
  selectedPermissionIds: string[];
  onSelectRole: (roleId: string) => void;
  onTogglePermission: (permissionId: string) => void;
  onSave: () => void;
}) {
  const modules = Array.from(
    new Set(permissions.map((permission) => permission.module ?? 'OTHER')),
  );

  return (
    <div className="two-column">
      <section className="panel">
        <div className="panel-header">
          <h2>Vai tro</h2>
        </div>
        <div className="role-list">
          {roles.map((role) => (
            <button
              className={
                role.maVaiTro === selectedRoleId ? 'role-row active' : 'role-row'
              }
              key={role.maVaiTro}
              onClick={() => onSelectRole(role.maVaiTro)}
              type="button"
            >
              <strong>{role.tenVaiTro}</strong>
              <span>{role.moTa}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Phan quyen</h2>
          <button className="primary-button" onClick={onSave} type="button">
            <Save size={18} />
            Luu quyen
          </button>
        </div>
        {modules.map((moduleName) => (
          <div className="permission-group" key={moduleName}>
            <h3>{moduleName}</h3>
            {permissions
              .filter((permission) => (permission.module ?? 'OTHER') === moduleName)
              .map((permission) => (
                <label className="checkbox-row" key={permission.maQuyen}>
                  <input
                    checked={selectedPermissionIds.includes(permission.maQuyen)}
                    onChange={() => onTogglePermission(permission.maQuyen)}
                    type="checkbox"
                  />
                  <span>
                    <strong>{permission.tenQuyen}</strong>
                    <small>{permission.maQuyen}</small>
                  </span>
                </label>
              ))}
          </div>
        ))}
      </section>
    </div>
  );
}

function ApprovalsPage({
  approvals,
  onSign,
}: {
  approvals: ApprovalItem[];
  onSign: (item: ApprovalItem, status: 'DA_KY' | 'TU_CHOI') => void;
}) {
  return (
    <section className="panel full">
      <div className="panel-header">
        <h2>Cong viec cho ky</h2>
      </div>
      <div className="work-list">
        {approvals.map((approval) => (
          <div className="work-item" key={`${approval.loaiPhieu}-${approval.maPhieu}`}>
            <div>
              <span className="type-chip">{approval.loaiPhieu}</span>
              <h3>{approval.maPhieu}</h3>
              <p>
                {approval.nguoiLap} · vong {approval.vongKy} ·{' '}
                {approval.ngay ?? 'chua co ngay'}
              </p>
            </div>
            <div className="button-row">
              <button
                className="secondary-button danger-text"
                onClick={() => onSign(approval, 'TU_CHOI')}
                type="button"
              >
                Tu choi
              </button>
              <button
                className="primary-button"
                onClick={() => onSign(approval, 'DA_KY')}
                type="button"
              >
                <Check size={18} />
                Ky duyet
              </button>
            </div>
          </div>
        ))}
        {!approvals.length && <EmptyState text="Khong co phieu dang cho ky" />}
      </div>
    </section>
  );
}

function NotificationsPage({
  notifications,
}: {
  notifications: NotificationItem[];
}) {
  return (
    <section className="panel full">
      <div className="panel-header">
        <h2>Thong bao</h2>
      </div>
      <div className="compact-list">
        {notifications.map((notification) => (
          <div className="compact-item notification" key={notification.id}>
            <Bell size={18} />
            <div>
              <strong>{notification.documentId}</strong>
              <span>{notification.message}</span>
            </div>
            <StatusPill value={notification.status} />
          </div>
        ))}
        {!notifications.length && <EmptyState text="Hop thong bao dang trong" />}
      </div>
    </section>
  );
}

function SettingsPage({
  settings,
  onSave,
}: {
  settings: SystemSettings;
  onSave: (settings: SystemSettings) => void;
}) {
  const [draft, setDraft] = useState(settings);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  return (
    <section className="panel full">
      <div className="panel-header">
        <h2>Cau hinh he thong</h2>
        <button className="primary-button" onClick={() => onSave(draft)}>
          <Save size={18} />
          Luu cau hinh
        </button>
      </div>
      <div className="settings-grid">
        <label>
          Ten ung dung
          <input
            onChange={(event) => setDraft({ ...draft, appName: event.target.value })}
            value={draft.appName}
          />
        </label>
        <label>
          Thoi han JWT
          <input
            onChange={(event) =>
              setDraft({ ...draft, jwtExpiresIn: event.target.value })
            }
            value={draft.jwtExpiresIn}
          />
        </label>
        <Toggle
          checked={draft.emailNotificationsEnabled}
          label="Email ky duyet"
          onChange={(checked) =>
            setDraft({ ...draft, emailNotificationsEnabled: checked })
          }
        />
        <Toggle
          checked={draft.inAppNotificationsEnabled}
          label="Thong bao trong app"
          onChange={(checked) =>
            setDraft({ ...draft, inAppNotificationsEnabled: checked })
          }
        />
      </div>
    </section>
  );
}

function AuditPage({
  logs,
  search,
  onSearch,
  onRefresh,
}: {
  logs: AuditLog[];
  search: string;
  onSearch: (value: string) => void;
  onRefresh: () => void;
}) {
  return (
    <section className="panel full">
      <div className="panel-header">
        <div className="search-box">
          <Search size={18} />
          <input
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Tim hanh dong, doi tuong, chi tiet"
            value={search}
          />
        </div>
        <button className="icon-button" onClick={onRefresh} title="Tai lai">
          <RefreshCw size={18} />
        </button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Thoi gian</th>
              <th>Nguoi dung</th>
              <th>Hanh dong</th>
              <th>Doi tuong</th>
              <th>Trang thai</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.maLog}>
                <td>{formatDate(log.thoiGian)}</td>
                <td>{log.hoTen ?? log.maNhanVien ?? 'He thong'}</td>
                <td>{log.hanhDong}</td>
                <td>{log.doiTuongId ?? log.doiTuong}</td>
                <td>
                  <StatusPill value={log.trangThai ?? 'INFO'} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ProfilePage({
  user,
  setToast,
}: {
  user: AuthUser;
  setToast: (message: string) => void;
}) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await api.changePassword(oldPassword, newPassword);
      setToast('Da doi mat khau');
    } catch {
      setToast('Chua doi duoc mat khau API');
    }
    setOldPassword('');
    setNewPassword('');
  }

  return (
    <div className="two-column">
      <section className="panel">
        <div className="panel-header">
          <h2>Ho so</h2>
        </div>
        <div className="profile-summary">
          <div className="avatar">{user.hoTen.slice(0, 1)}</div>
          <strong>{user.hoTen}</strong>
          <span>{user.email}</span>
          <StatusPill value={user.maVaiTro} />
        </div>
      </section>
      <section className="panel">
        <div className="panel-header">
          <h2>Doi mat khau</h2>
        </div>
        <form className="stack-form" onSubmit={submit}>
          <label>
            Mat khau cu
            <div className="password-field">
              <input
                onChange={(event) => setOldPassword(event.target.value)}
                required
                type={showOldPassword ? 'text' : 'password'}
                value={oldPassword}
              />
              <button
                aria-label={
                  showOldPassword ? 'An mat khau cu' : 'Hien mat khau cu'
                }
                onClick={() => setShowOldPassword((current) => !current)}
                title={showOldPassword ? 'An mat khau cu' : 'Hien mat khau cu'}
                type="button"
              >
                {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
          <label>
            Mat khau moi
            <div className="password-field">
              <input
                minLength={6}
                onChange={(event) => setNewPassword(event.target.value)}
                required
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
              />
              <button
                aria-label={
                  showNewPassword ? 'An mat khau moi' : 'Hien mat khau moi'
                }
                onClick={() => setShowNewPassword((current) => !current)}
                title={
                  showNewPassword ? 'An mat khau moi' : 'Hien mat khau moi'
                }
                type="button"
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
          <button className="primary-button" type="submit">
            <Save size={18} />
            Cap nhat
          </button>
        </form>
      </section>
    </div>
  );
}

function StatusPill({ value }: { value: string }) {
  const normalized = value.toLowerCase();
  return <span className={`status-pill ${normalized}`}>{value}</span>;
}

function Toggle({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="toggle-row">
      <span>{label}</span>
      <button
        aria-pressed={checked}
        className={checked ? 'toggle on' : 'toggle'}
        onClick={() => onChange(!checked)}
        type="button"
      >
        <span />
      </button>
    </label>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="empty-state">{text}</div>;
}

function formatDate(value: string | null) {
  if (!value) return '';
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    currency: 'VND',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(value);
}

function formatCurrencyShort(value: number) {
  if (value >= 1_000_000_000) {
    return `${Math.round(value / 1_000_000_000)} ty`;
  }
  if (value >= 1_000_000) {
    return `${Math.round(value / 1_000_000)} tr`;
  }
  return formatCurrency(value);
}

interface TransferPageProps {
  departments: Department[];
  employees: Employee[];
  assets: Asset[];
  slips: any[];
  history: any;
  onRefresh: () => void;
  setToast: (msg: string) => void;
}

function TransferPage({
  departments,
  employees,
  assets,
  slips,
  history,
  onRefresh,
  setToast,
}: TransferPageProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'history' | 'reports'>('create');
  const [nguoiLap, setNguoiLap] = useState('NV0001');
  const [ghiChu, setGhiChu] = useState('');
  const [sourceDept, setSourceDept] = useState('');
  const [assetRows, setAssetRows] = useState<Array<{ maTaiSan: string; denPhongBan: string; lyDo: string }>>([
    { maTaiSan: '', denPhongBan: '', lyDo: '' }
  ]);
  const [approverRows, setApproverRows] = useState<Array<{ maNhanVien: string; tenVaiTro: string; vongKy: number }>>([
    { maNhanVien: '', tenVaiTro: '', vongKy: 1 }
  ]);
  const [statusFilter, setStatusFilter] = useState('');

  const filteredSourceAssets = useMemo(() => {
    if (!sourceDept) return assets;
    return assets.filter(a => a.maPhongBanHienTai === sourceDept);
  }, [assets, sourceDept]);

  const loadSample = () => {
    setGhiChu('Điều chuyển thiết bị tin học phục vụ giảng dạy');
    setSourceDept('PB01');
    setAssetRows([
      { maTaiSan: 'TS0001', denPhongBan: 'PB02', lyDo: 'Điều phối công tác chuyên môn' },
      { maTaiSan: 'TS0002', denPhongBan: 'PB03', lyDo: 'Hỗ trợ kỹ thuật thực hành' }
    ]);
    setApproverRows([
      { maNhanVien: 'NV0001', tenVaiTro: 'Hiệu trưởng', vongKy: 1 }
    ]);
    setToast('Đã điền dữ liệu mẫu thành công!');
  };

  const addAssetRow = () => {
    setAssetRows([...assetRows, { maTaiSan: '', denPhongBan: '', lyDo: '' }]);
  };

  const removeAssetRow = (index: number) => {
    setAssetRows(assetRows.filter((_, idx) => idx !== index));
  };

  const duplicateAssetRow = (index: number) => {
    const row = assetRows[index];
    setAssetRows([...assetRows, { ...row }]);
  };

  const updateAssetRow = (index: number, field: string, value: any) => {
    setAssetRows(assetRows.map((row, idx) => idx === index ? { ...row, [field]: value } : row));
  };

  const addApproverRow = () => {
    setApproverRows([...approverRows, { maNhanVien: '', tenVaiTro: '', vongKy: approverRows.length + 1 }]);
  };

  const removeApproverRow = (index: number) => {
    setApproverRows(approverRows.filter((_, idx) => idx !== index));
  };

  const updateApproverRow = (index: number, field: string, value: any) => {
    setApproverRows(approverRows.map((row, idx) => idx === index ? { ...row, [field]: value } : row));
  };

  const applyDepartmentToAll = () => {
    const firstDest = assetRows[0]?.denPhongBan;
    if (!firstDest) {
      setToast('Chưa chọn phòng ban nhận ở dòng đầu tiên!');
      return;
    }
    setAssetRows(assetRows.map(row => ({ ...row, denPhongBan: firstDest })));
    setToast('Đã áp dụng phòng ban nhận cho toàn bộ dòng!');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nguoiLap.trim()) {
      setToast('Người lập không được để trống!');
      return;
    }
    const cleanAssets = assetRows.filter(r => r.maTaiSan && r.denPhongBan);
    if (cleanAssets.length === 0) {
      setToast('Cần chọn ít nhất 1 tài sản và phòng ban đến!');
      return;
    }
    const cleanApprovers = approverRows.filter(r => r.maNhanVien);

    try {
      const payload = {
        nguoiLap: nguoiLap.trim(),
        ghiChu: ghiChu.trim() || undefined,
        danhSachTaiSan: cleanAssets.map(a => ({
          maTaiSan: a.maTaiSan,
          denPhongBan: a.denPhongBan,
          lyDo: a.lyDo.trim() || undefined
        })),
        danhSachKyDuyet: cleanApprovers.length ? cleanApprovers : undefined,
      };

      const result = await api.createTransferSlip(payload);
      setToast(`Đã tạo thành công phiếu ${result.SoPhieu}!`);
      setGhiChu('');
      setAssetRows([{ maTaiSan: '', denPhongBan: '', lyDo: '' }]);
      setApproverRows([{ maNhanVien: '', tenVaiTro: '', vongKy: 1 }]);
      setActiveTab('history');
      onRefresh();
    } catch (err: any) {
      setToast(`Lỗi: ${err.message || 'Không thể tạo phiếu'}`);
    }
  };

  const filteredSlips = useMemo(() => {
    if (!statusFilter) return slips;
    return slips.filter(s => s.TrangThaiDuyet === statusFilter);
  }, [slips, statusFilter]);

  return (
    <div className="assets-layout">
      {/* Premium navigation tabs */}
      <div className="transfer-tabs">
        <button
          className={`transfer-tab-btn ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
          type="button"
        >
          <Edit3 size={16} />
          Lập phiếu điều chuyển
        </button>
        <button
          className={`transfer-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
          type="button"
        >
          <FileClock size={16} />
          Lịch sử phiếu ({slips.length})
        </button>
        <button
          className={`transfer-tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
          type="button"
        >
          <BarChart3 size={16} />
          Thống kê luân chuyển
        </button>
      </div>

      {activeTab === 'create' && (
        <div className="two-column" style={{ gridTemplateColumns: '1fr 1.6fr' }}>
          {/* General slip configuration (Left Column) */}
          <div style={{ display: 'grid', gap: '16px', alignContent: 'start' }}>
            <section className="panel">
              <div className="panel-header">
                <h2>Thông tin chung</h2>
                <button className="secondary-button" onClick={loadSample} type="button" style={{ height: '32px', minHeight: '32px' }}>
                  Load mẫu
                </button>
              </div>
              <div className="stack-form">
                <label>
                  Người lập phiếu
                  <select value={nguoiLap} onChange={e => setNguoiLap(e.target.value)}>
                    {employees.map(emp => (
                      <option key={emp.maNhanVien} value={emp.maNhanVien}>
                        {emp.maNhanVien} - {emp.hoTen}
                      </option>
                    ))}
                  </select>
                </label>

                <label style={{ marginTop: '12px' }}>
                  Phòng ban nguồn
                  <select value={sourceDept} onChange={e => {
                    setSourceDept(e.target.value);
                    setAssetRows([{ maTaiSan: '', denPhongBan: '', lyDo: '' }]);
                  }}>
                    <option value="">-- Chọn tất cả phòng ban --</option>
                    {departments.map(d => (
                      <option key={d.maPhongBan} value={d.maPhongBan}>
                        {d.maPhongBan} - {d.tenPhongBan}
                      </option>
                    ))}
                  </select>
                </label>

                <label style={{ marginTop: '12px' }}>
                  Ghi chú tổng thể
                  <input
                    value={ghiChu}
                    onChange={e => setGhiChu(e.target.value)}
                    placeholder="Mô tả mục đích điều chuyển..."
                  />
                </label>
              </div>
            </section>

            {/* Signature workflow (Approvers) */}
            <section className="panel">
              <div className="panel-header">
                <h2>Tuyến ký duyệt</h2>
                <button className="secondary-button" onClick={addApproverRow} type="button" style={{ height: '32px', minHeight: '32px' }}>
                  <Plus size={14} /> Thêm người ký
                </button>
              </div>

              <div className="compact-list">
                {approverRows.map((row, index) => (
                  <div className="transfer-approver-row" key={index}>
                    <label style={{ margin: 0 }}>
                      Người duyệt
                      <select
                        value={row.maNhanVien}
                        onChange={e => {
                          const emp = employees.find(emp => emp.maNhanVien === e.target.value);
                          updateApproverRow(index, 'maNhanVien', e.target.value);
                          if (emp) {
                            updateApproverRow(index, 'tenVaiTro', emp.tenVaiTro || emp.chucVu || '');
                          }
                        }}
                      >
                        <option value="">-- Chọn --</option>
                        {employees.map(emp => (
                          <option key={emp.maNhanVien} value={emp.maNhanVien}>
                            {emp.hoTen} ({emp.maNhanVien})
                          </option>
                        ))}
                      </select>
                    </label>

                    <label style={{ margin: 0 }}>
                      Vai trò ký
                      <input
                        value={row.tenVaiTro}
                        onChange={e => updateApproverRow(index, 'tenVaiTro', e.target.value)}
                        placeholder="Ví dụ: Hiệu trưởng"
                      />
                    </label>

                    <label style={{ margin: 0 }}>
                      Thứ tự
                      <input
                        type="number"
                        value={row.vongKy}
                        onChange={e => updateApproverRow(index, 'vongKy', Number(e.target.value))}
                        min="1"
                      />
                    </label>

                    <div style={{ paddingBottom: '2px' }}>
                      {approverRows.length > 1 && (
                        <button
                          className="icon-button danger"
                          onClick={() => removeApproverRow(index)}
                          type="button"
                          title="Xóa"
                          style={{ height: '40px', width: '40px' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <button className="primary-button" onClick={submit} type="button" style={{ height: '46px' }}>
              <Save size={18} />
              Tạo phiếu điều chuyển
            </button>
          </div>

          {/* Chosen Assets editor (Right Column) */}
          <section className="panel" style={{ display: 'grid', alignContent: 'start' }}>
            <div className="panel-header">
              <h2>Tài sản điều chuyển ({assetRows.filter(r => r.maTaiSan).length})</h2>
              <div className="button-row">
                <button className="secondary-button" onClick={applyDepartmentToAll} type="button" style={{ height: '32px', minHeight: '32px' }}>
                  Áp dụng nhanh phòng nhận
                </button>
                <button className="primary-button" onClick={addAssetRow} type="button" style={{ height: '32px', minHeight: '32px' }}>
                  <Plus size={14} /> Thêm dòng
                </button>
              </div>
            </div>

            <div className="compact-list" style={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto', paddingRight: '4px' }}>
              {assetRows.map((row, index) => (
                <div className="transfer-asset-row" key={index}>
                  <label style={{ margin: 0 }}>
                    Chọn tài sản
                    <select
                      value={row.maTaiSan}
                      onChange={e => updateAssetRow(index, 'maTaiSan', e.target.value)}
                    >
                      <option value="">-- Chọn tài sản nguồn --</option>
                      {filteredSourceAssets.map(a => (
                        <option key={a.maTaiSan} value={a.maTaiSan}>
                          {a.tenTaiSan} ({a.maQR || a.maTaiSan})
                        </option>
                      ))}
                    </select>
                  </label>

                  <label style={{ margin: 0 }}>
                    Phòng ban nhận
                    <select
                      value={row.denPhongBan}
                      onChange={e => updateAssetRow(index, 'denPhongBan', e.target.value)}
                    >
                      <option value="">-- Chọn phòng ban nhận --</option>
                      {departments.map(d => (
                        <option key={d.maPhongBan} value={d.maPhongBan}>
                          {d.maPhongBan} - {d.tenPhongBan}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label style={{ margin: 0 }}>
                    Lý do riêng biệt
                    <input
                      value={row.lyDo}
                      onChange={e => updateAssetRow(index, 'lyDo', e.target.value)}
                      placeholder="Lý do chi tiết dòng..."
                    />
                  </label>

                  <div style={{ display: 'flex', gap: '4px', paddingBottom: '2px' }}>
                    <button
                      className="icon-button"
                      onClick={() => duplicateAssetRow(index)}
                      type="button"
                      title="Nhân bản dòng"
                      style={{ height: '40px', width: '40px' }}
                    >
                      <Plus size={16} />
                    </button>
                    {assetRows.length > 1 && (
                      <button
                        className="icon-button danger"
                        onClick={() => removeAssetRow(index)}
                        type="button"
                        title="Xóa"
                        style={{ height: '40px', width: '40px' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {activeTab === 'history' && (
        <section className="panel full">
          <div className="panel-header">
            <h2>Lịch sử phiếu điều chuyển</h2>
            <div className="panel-actions">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                style={{ width: '180px', height: '36px', minHeight: '36px' }}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="CHO_KY">Chờ ký duyệt</option>
                <option value="DA_DUYET">Đã phê duyệt</option>
                <option value="TU_CHOI">Bị từ chối</option>
              </select>
              <button className="icon-button" onClick={onRefresh} title="Tải lại">
                <RefreshCw size={18} />
              </button>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Số Phiếu</th>
                  <th>Ngày Điều Chuyển</th>
                  <th>Trạng Thái</th>
                  <th>Người Lập</th>
                  <th>Số Tài Sản</th>
                </tr>
              </thead>
              <tbody>
                {filteredSlips.map(slip => (
                  <tr key={slip.SoPhieu}>
                    <td><strong>{slip.SoPhieu}</strong></td>
                    <td>{slip.NgayDieuChuyen ? String(slip.NgayDieuChuyen).slice(0, 10) : ''}</td>
                    <td><StatusPill value={slip.TrangThaiDuyet} /></td>
                    <td>{slip.NguoiLapTen || slip.NguoiLap}</td>
                    <td>{slip.TongTaiSan || 0} tài sản</td>
                  </tr>
                ))}
                {!filteredSlips.length && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '24px' }}>
                      <EmptyState text="Không tìm thấy phiếu điều chuyển nào phù hợp." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'reports' && (
        <div style={{ display: 'grid', gap: '24px' }}>
          {/* Summary flows cards */}
          <section className="panel full">
            <div className="panel-header" style={{ marginBottom: '14px' }}>
              <h2>Dòng điều chuyển tích lũy (Đã duyệt)</h2>
            </div>
            <div className="history-stats-grid">
              {(history.summary || []).map((item: any, idx: number) => (
                <div className="history-stat-card" key={idx}>
                  <div className="history-stat-flow">
                    <div className="history-stat-dept">
                      <span>TỪ PHÒNG</span>
                      <strong>{item.TuPhongBanTen || item.TuPhongBan}</strong>
                    </div>
                    <div className="history-stat-arrow">➜</div>
                    <div className="history-stat-dept">
                      <span>ĐẾN PHÒNG</span>
                      <strong>{item.DenPhongBanTen || item.DenPhongBan}</strong>
                    </div>
                  </div>
                  <div className="history-stat-count">
                    {item.SoLuongTaiSan} <span>tài sản</span>
                  </div>
                </div>
              ))}
              {!(history.summary || []).length && (
                <EmptyState text="Chưa có luồng điều chuyển nào được hoàn tất ký duyệt." />
              )}
            </div>
          </section>

          {/* Slips details log */}
          <section className="panel full">
            <div className="panel-header">
              <h2>Chi tiết nhật ký điều chuyển tài sản</h2>
            </div>
            <div className="compact-list">
              {(history.items || []).map((item: any, idx: number) => (
                <div className="compact-item" key={idx} style={{
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <span style={{ fontSize: '0.74rem', color: '#2e795b', fontWeight: 'bold' }}>{item.SoPhieu}</span>
                    <strong style={{ fontSize: '1rem', marginTop: '2px', color: '#24312f' }}>{item.TenTaiSan}</strong>
                    <div style={{ fontSize: '0.84rem', color: '#6a766f', marginTop: '4px' }}>
                      Luân chuyển: <strong>{item.TuPhongBanTen || item.TuPhongBan}</strong> ➜ <strong>{item.DenPhongBanTen || item.DenPhongBan}</strong>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#8fa099', marginTop: '2px', fontStyle: 'italic' }}>
                      Lý do: {item.LyDo || 'Không có lý do riêng'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.84rem', color: '#24312f' }}>
                      Lập bởi: <strong>{item.NguoiLapTen || item.NguoiLap}</strong>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#8fa099', marginTop: '2px' }}>
                      {item.NgayDieuChuyen ? String(item.NgayDieuChuyen).slice(0, 10) : ''}
                    </div>
                  </div>
                </div>
              ))}
              {!(history.items || []).length && (
                <EmptyState text="Chưa có thông tin chi tiết lịch sử điều chuyển." />
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
