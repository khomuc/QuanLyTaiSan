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
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { api, clearStoredToken, getStoredToken, setStoredToken } from './lib/api';
import * as demo from './lib/mockData';
import type {
  ApprovalItem,
  Asset,
  AssetCategory,
  AssetReport,
  AssetReportGroup,
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
  { key: 'assetReport', label: 'Bao cao tai san', icon: BarChart3 },
  { key: 'employees', label: 'Nhan vien', icon: Users },
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

interface AssetForm {
  maTaiSan: string;
  maQR: string;
  tenTaiSan: string;
  serial: string;
  model: string;
  maLoai: string;
  nguyenGia: string;
  haoMonLuyKe: string;
  giaTriConLai: string;
  ngayNhap: string;
  maPhongBanHienTai: string;
  trangThai: Asset['trangThai'];
  soHieuTSCD: string;
  ghiChu: string;
}

interface AssetHistoryItem {
  maLog: number;
  maNhanVien: string | null;
  hoTen: string | null;
  thoiGian: string;
  hanhDong: string;
  trangThai: string | null;
  chiTiet: string | null;
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

const emptyAsset: AssetForm = {
  maTaiSan: '',
  maQR: '',
  tenTaiSan: '',
  serial: '',
  model: '',
  maLoai: '',
  nguyenGia: '0',
  haoMonLuyKe: '0',
  giaTriConLai: '',
  ngayNhap: new Date().toISOString().slice(0, 10),
  maPhongBanHienTai: '',
  trangThai: 'HOAT_DONG',
  soHieuTSCD: '',
  ghiChu: '',
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
  const [assetReport, setAssetReport] = useState<AssetReport>(
    demo.assetReport,
  );
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
  const [assetModal, setAssetModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<string | null>(null);
  const [assetForm, setAssetForm] = useState(emptyAsset);
  const [assetDetail, setAssetDetail] = useState<Asset | null>(null);
  const [assetHistory, setAssetHistory] = useState<AssetHistoryItem[]>([]);
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

      if (nextView === 'assetReport') {
        const [report, categoryList, departmentList] = await Promise.all([
          api.assetReport({
            search: assetSearch,
            maLoai: assetCategory,
            maPhongBan: assetDepartment,
            trangThai: assetStatus,
          }),
          api.assetCategories(),
          api.departments(),
        ]);
        setAssetReport(report);
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
    if (nextView === 'assets') {
      setAssets(demo.assets);
      setAssetCategories(demo.assetCategories);
      setDepartments(demo.departments);
    }
    if (nextView === 'assetReport') {
      setAssetReport(demo.assetReport);
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

  function openCreateAsset() {
    setEditingAsset(null);
    setAssetForm({
      ...emptyAsset,
      maLoai: assetCategories[0]?.maLoai ?? '',
      maPhongBanHienTai: departments[0]?.maPhongBan ?? '',
    });
    setAssetModal(true);
  }

  function openEditAsset(asset: Asset) {
    setEditingAsset(asset.maTaiSan);
    setAssetForm({
      maTaiSan: asset.maTaiSan,
      maQR: asset.maQR ?? '',
      tenTaiSan: asset.tenTaiSan,
      serial: asset.serial ?? '',
      model: asset.model ?? '',
      maLoai: asset.maLoai,
      nguyenGia: String(asset.nguyenGia),
      haoMonLuyKe: String(toDepreciationPercent(asset)),
      giaTriConLai: String(asset.giaTriConLai),
      ngayNhap: String(asset.ngayNhap).slice(0, 10),
      maPhongBanHienTai: asset.maPhongBanHienTai,
      trangThai: asset.trangThai,
      soHieuTSCD: asset.soHieuTSCD ?? '',
      ghiChu: asset.ghiChu ?? '',
    });
    setAssetModal(true);
  }

  async function openAssetDetail(asset: Asset) {
    setAssetDetail(asset);
    try {
      setAssetHistory(await api.assetHistory(asset.maTaiSan));
    } catch {
      setAssetHistory([]);
      setToast('Chua tai duoc lich su thay doi');
    }
  }

  function buildAssetPayload() {
    const nguyenGia = Number(assetForm.nguyenGia || 0);
    const haoMonPercent = Math.min(
      100,
      Math.max(0, Number(assetForm.haoMonLuyKe || 0)),
    );
    const haoMonLuyKe = Math.round((nguyenGia * haoMonPercent) / 100);

    return {
      maTaiSan: assetForm.maTaiSan.trim(),
      maQR: assetForm.maQR || undefined,
      tenTaiSan: assetForm.tenTaiSan.trim(),
      serial: assetForm.serial || undefined,
      model: assetForm.model || undefined,
      maLoai: assetForm.maLoai,
      nguyenGia,
      haoMonLuyKe,
      giaTriConLai: Math.max(0, nguyenGia - haoMonLuyKe),
      ngayNhap: assetForm.ngayNhap,
      maPhongBanHienTai: assetForm.maPhongBanHienTai,
      trangThai: assetForm.trangThai,
      soHieuTSCD: assetForm.soHieuTSCD || undefined,
      ghiChu: assetForm.ghiChu || undefined,
    };
  }

  async function saveAsset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = buildAssetPayload();

    try {
      if (editingAsset) {
        const { maTaiSan: _maTaiSan, ...updatePayload } = payload;
        const updated = await api.updateAsset(editingAsset, updatePayload);
        setAssets((current) =>
          current.map((asset) =>
            asset.maTaiSan === editingAsset ? updated : asset,
          ),
        );
      } else {
        const created = await api.createAsset(payload);
        setAssets((current) => [created, ...current]);
      }
      setToast('Da luu tai san');
      setAssetModal(false);
    } catch (error) {
      setToast(error instanceof Error ? error.message : 'Chua luu duoc tai san');
    }
  }

  async function deleteAsset(maTaiSan: string) {
    try {
      await api.deleteAsset(maTaiSan);
      setToast('Da dua tai san vao muc thanh ly');
      setAssets((current) =>
        current.map((asset) =>
          asset.maTaiSan === maTaiSan ? { ...asset, trangThai: 'HONG' } : asset,
        ),
      );
    } catch {
      setToast('Chua dua duoc tai san vao muc thanh ly');
    }
  }

  async function finalizeAsset(maTaiSan: string) {
    try {
      await api.finalizeAsset(maTaiSan);
      setToast('Da xoa tai san sau khi thanh ly');
      setAssets((current) =>
        current.filter((asset) => asset.maTaiSan !== maTaiSan),
      );
    } catch {
      setToast('Chua xoa duoc tai san sau thanh ly');
    }
  }

  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function downloadAssetTemplate() {
    try {
      const blob = await api.assetImportTemplate();
      downloadBlob(blob, 'mau-import-tai-san.xlsx');
      setToast('Da tai file mau');
    } catch {
      setToast('Khong tai duoc file mau');
    }
  }

  async function exportAssetsExcel() {
    try {
      const blob = await api.exportAssets({
        search: assetSearch,
        maLoai: assetCategory,
        maPhongBan: assetDepartment,
        trangThai: assetStatus,
      });
      downloadBlob(blob, 'danh-sach-tai-san.xlsx');
      setToast('Da export danh sach tai san');
    } catch {
      setToast('Khong export duoc Excel');
    }
  }

  async function importAssetsExcel(file: File) {
    try {
      const result = await api.importAssets(file);
      setToast(`Import thanh cong ${result.success}, loi ${result.failed}`);
      await loadView('assets');
    } catch {
      setToast('Khong import duoc Excel');
    }
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
              onCreate={openCreateAsset}
              onView={openAssetDetail}
              onEdit={openEditAsset}
              onDelete={(maTaiSan) => void deleteAsset(maTaiSan)}
              onFinalize={(maTaiSan) => void finalizeAsset(maTaiSan)}
              onDownloadTemplate={() => void downloadAssetTemplate()}
              onExport={() => void exportAssetsExcel()}
              onImport={(file) => void importAssetsExcel(file)}
              onRefresh={() => void loadView('assets')}
            />
          )}
          {view === 'assetReport' && (
            <AssetReportPage
              report={assetReport}
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
              onRefresh={() => void loadView('assetReport')}
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

      {assetModal && (
        <AssetModal
          form={assetForm}
          categories={assetCategories}
          departments={departments}
          isEditing={Boolean(editingAsset)}
          onChange={setAssetForm}
          onClose={() => setAssetModal(false)}
          onSubmit={saveAsset}
        />
      )}

      {assetDetail && (
        <AssetDetailModal
          asset={assetDetail}
          history={assetHistory}
          onClose={() => {
            setAssetDetail(null);
            setAssetHistory([]);
          }}
          onEdit={() => {
            openEditAsset(assetDetail);
            setAssetDetail(null);
          }}
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

function AssetReportPage({
  report,
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
  report: AssetReport;
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
  return (
    <div className="assets-layout">
      <section className="asset-toolbar panel">
        <div className="search-box">
          <Search size={18} />
          <input
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Loc bao cao theo ma, QR, ten, serial"
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
          <option value="HONG">Thanh ly</option>
        </select>
        <button className="primary-button" onClick={onRefresh} type="button">
          <Filter size={18} />
          Ap dung
        </button>
      </section>

      <div className="report-summary">
        <ReportMetric label="Tong tai san" value={report.summary.totalAssets} />
        <ReportMetric label="Dang su dung" value={report.summary.activeAssets} />
        <ReportMetric label="Thanh ly" value={report.summary.liquidatedAssets} />
        <ReportMetric
          label="Tong nguyen gia"
          value={formatCurrencyShort(report.summary.totalOriginalValue)}
        />
        <ReportMetric
          label="Tong hao mon"
          value={formatCurrencyShort(report.summary.totalDepreciationValue)}
        />
        <ReportMetric
          label="Gia tri con lai"
          value={formatCurrencyShort(report.summary.totalRemainingValue)}
        />
      </div>

      <div className="report-grid">
        <ReportGroupPanel
          groups={report.byCategory}
          title="Thong ke theo loai tai san"
        />
        <ReportGroupPanel
          groups={report.byDepartment}
          title="Thong ke theo phong ban"
        />
        <ReportGroupPanel groups={report.byStatus} title="Thong ke theo trang thai" />
      </div>
    </div>
  );
}

function ReportMetric({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <section className="report-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </section>
  );
}

function ReportGroupPanel({
  title,
  groups,
}: {
  title: string;
  groups: AssetReportGroup[];
}) {
  const maxTotal = Math.max(...groups.map((group) => group.total), 1);

  return (
    <section className="panel report-panel">
      <div className="panel-header">
        <h2>{title}</h2>
      </div>
      <div className="report-bars">
        {groups.map((group) => (
          <div className="report-bar-row" key={`${title}-${group.id}`}>
            <div className="report-bar-head">
              <strong>{group.name}</strong>
              <span>{group.total} tai san</span>
            </div>
            <div className="report-bar-track">
              <div
                className="report-bar-fill"
                style={{ width: `${Math.max(8, (group.total / maxTotal) * 100)}%` }}
              />
            </div>
            <div className="report-bar-values">
              <span>Nguyen gia: {formatCurrency(group.originalValue)}</span>
              <span>Con lai: {formatCurrency(group.remainingValue)}</span>
            </div>
          </div>
        ))}
      </div>
      {!groups.length && <EmptyState text="Khong co du lieu bao cao" />}
    </section>
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
  onCreate,
  onView,
  onEdit,
  onDelete,
  onFinalize,
  onDownloadTemplate,
  onExport,
  onImport,
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
  onCreate: () => void;
  onView: (asset: Asset) => void;
  onEdit: (asset: Asset) => void;
  onDelete: (maTaiSan: string) => void;
  onFinalize: (maTaiSan: string) => void;
  onDownloadTemplate: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onRefresh: () => void;
}) {
  const activeAssets = assets.filter((asset) => asset.trangThai !== 'HONG');
  const liquidatedAssets = assets.filter((asset) => asset.trangThai === 'HONG');
  const visibleActiveAssets = activeAssets;
  const totalValue = activeAssets.reduce(
    (sum, asset) => sum + asset.giaTriConLai,
    0,
  );

  function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
      event.target.value = '';
    }
  }

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
        <button className="primary-button" onClick={onCreate} type="button">
          <Plus size={18} />
          Them tai san
        </button>
        <button
          className="secondary-button"
          onClick={onDownloadTemplate}
          type="button"
        >
          Tai mau Excel
        </button>
        <label className="secondary-button file-button">
          Import Excel
          <input accept=".xlsx" onChange={handleImport} type="file" />
        </label>
        <button className="secondary-button" onClick={onExport} type="button">
          Export Excel
        </button>
      </section>

      <div className="asset-summary">
        <KpiTile
          icon={PackageSearch}
          label="Tai san dang xem"
          tone="green"
          value={activeAssets.length}
        />
        <KpiTile
          icon={QrCode}
          label="Co ma QR"
          tone="amber"
          value={activeAssets.filter((asset) => Boolean(asset.maQR)).length}
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
          <div className="button-row">
            <button className="icon-button" onClick={onRefresh} title="Tai lai">
              <RefreshCw size={18} />
            </button>
            <button className="primary-button" onClick={onCreate} type="button">
              <Plus size={18} />
              Them
            </button>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Ma / QR</th>
                <th>Ten tai san</th>
                <th>Loai</th>
                <th>Phong ban</th>
                <th>Nguyen gia</th>
                <th>Hao mon</th>
                <th>Gia tri con lai</th>
                <th>Trang thai</th>
                <th>Thao tac</th>
              </tr>
            </thead>
            <tbody>
              {visibleActiveAssets.map((asset) => (
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
                  <td>{formatCurrency(asset.nguyenGia)}</td>
                  <td>{toDepreciationPercent(asset)}%</td>
                  <td>{formatCurrency(asset.giaTriConLai)}</td>
                  <td>
                    <StatusPill value={asset.trangThai} />
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="icon-button"
                        onClick={() => onView(asset)}
                        title="Xem chi tiet"
                        type="button"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="icon-button"
                        onClick={() => onEdit(asset)}
                        title="Sua tai san"
                        type="button"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        className="icon-button danger"
                        onClick={() => onDelete(asset.maTaiSan)}
                        title="Dua vao muc thanh ly"
                        type="button"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!visibleActiveAssets.length && (
          <EmptyState text="Khong tim thay tai san phu hop" />
        )}
      </section>

      <section className="panel full">
        <div className="panel-header">
          <h2>Tai san thanh ly</h2>
          <span className="mode-pill demo">{liquidatedAssets.length}</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Ma / QR</th>
                <th>Ten tai san</th>
                <th>Loai</th>
                <th>Phong ban</th>
                <th>Nguyen gia</th>
                <th>Hao mon</th>
                <th>Gia tri con lai</th>
                <th>Thao tac</th>
              </tr>
            </thead>
            <tbody>
              {liquidatedAssets.map((asset) => (
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
                  <td>{formatCurrency(asset.nguyenGia)}</td>
                  <td>{toDepreciationPercent(asset)}%</td>
                  <td>{formatCurrency(asset.giaTriConLai)}</td>
                  <td>
                    <button
                      className="secondary-button danger-text"
                      onClick={() => onFinalize(asset.maTaiSan)}
                      type="button"
                    >
                      Da ban / Xoa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!liquidatedAssets.length && (
          <EmptyState text="Chua co tai san nao trong muc thanh ly" />
        )}
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

function AssetDetailModal({
  asset,
  history,
  onClose,
  onEdit,
}: {
  asset: Asset;
  history: AssetHistoryItem[];
  onClose: () => void;
  onEdit: () => void;
}) {
  const qrValue = asset.maQR ?? asset.maTaiSan;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrValue)}`;

  return (
    <div className="modal-backdrop">
      <section className="modal asset-detail-modal">
        <div className="panel-header">
          <div>
            <h2>Chi tiet tai san</h2>
            <p className="muted-text">{asset.maTaiSan}</p>
          </div>
          <button
            className="icon-button"
            onClick={onClose}
            title="Dong"
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <div className="detail-grid">
          <div className="detail-main">
            <DetailRow label="Ten tai san" value={asset.tenTaiSan} />
            <DetailRow label="Loai" value={asset.tenLoai ?? asset.maLoai} />
            <DetailRow
              label="Phong ban"
              value={asset.tenPhongBan ?? asset.maPhongBanHienTai}
            />
            <DetailRow label="Ma QR" value={asset.maQR ?? 'Chua gan QR'} />
            <DetailRow label="Serial" value={asset.serial ?? 'Chua cap nhat'} />
            <DetailRow label="Model" value={asset.model ?? 'Chua cap nhat'} />
            <DetailRow label="So hieu TSCD" value={asset.soHieuTSCD ?? 'Chua cap nhat'} />
            <DetailRow label="Ngay nhap" value={formatDate(asset.ngayNhap)} />
            <DetailRow label="Nguyen gia" value={formatCurrency(asset.nguyenGia)} />
            <DetailRow label="Hao mon" value={`${toDepreciationPercent(asset)}%`} />
            <DetailRow
              label="Gia tri con lai"
              value={formatCurrency(asset.giaTriConLai)}
            />
            <DetailRow label="Trang thai" value={asset.trangThai} />
            <DetailRow label="Ghi chu" value={asset.ghiChu ?? 'Khong co'} />
          </div>

          <aside className="qr-panel">
            <img alt={`QR ${asset.maTaiSan}`} src={qrUrl} />
            <strong>{qrValue}</strong>
          </aside>
        </div>

        <section className="history-panel">
          <div className="panel-header compact">
            <h3>Lich su thay doi</h3>
          </div>
          <div className="compact-list">
            {history.map((item) => (
              <div className="compact-item" key={item.maLog}>
                <strong>{item.hanhDong}</strong>
                <span>
                  {formatDate(item.thoiGian)} - {item.hoTen ?? item.maNhanVien ?? 'He thong'}
                </span>
              </div>
            ))}
          </div>
          {!history.length && <EmptyState text="Chua co lich su thay doi" />}
        </section>

        <div className="modal-actions">
          <button className="secondary-button" onClick={onClose} type="button">
            Dong
          </button>
          <button className="primary-button" onClick={onEdit} type="button">
            <Edit3 size={18} />
            Sua tai san
          </button>
        </div>
      </section>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function AssetModal({
  form,
  categories,
  departments,
  isEditing,
  onChange,
  onClose,
  onSubmit,
}: {
  form: AssetForm;
  categories: AssetCategory[];
  departments: Department[];
  isEditing: boolean;
  onChange: (form: AssetForm) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const nguyenGia = Number(form.nguyenGia || 0);
  const haoMonPercent = Math.min(100, Math.max(0, Number(form.haoMonLuyKe || 0)));
  const giaTriConLai = Math.max(
    0,
    nguyenGia - Math.round((nguyenGia * haoMonPercent) / 100),
  );

  return (
    <div className="modal-backdrop">
      <form className="modal" onSubmit={onSubmit}>
        <div className="panel-header">
          <h2>{isEditing ? 'Sua tai san' : 'Them tai san'}</h2>
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
            Ma tai san
            <input
              disabled={isEditing}
              onChange={(event) =>
                onChange({ ...form, maTaiSan: event.target.value })
              }
              required
              value={form.maTaiSan}
            />
          </label>
          <label>
            Ten tai san
            <input
              onChange={(event) =>
                onChange({ ...form, tenTaiSan: event.target.value })
              }
              required
              value={form.tenTaiSan}
            />
          </label>
          <label>
            Ma QR
            <input
              onChange={(event) => onChange({ ...form, maQR: event.target.value })}
              value={form.maQR}
            />
          </label>
          <label>
            So hieu TSCD
            <input
              onChange={(event) =>
                onChange({ ...form, soHieuTSCD: event.target.value })
              }
              value={form.soHieuTSCD}
            />
          </label>
          <label>
            Loai tai san
            <select
              onChange={(event) =>
                onChange({ ...form, maLoai: event.target.value })
              }
              required
              value={form.maLoai}
            >
              <option value="">Chon loai</option>
              {categories.map((item) => (
                <option key={item.maLoai} value={item.maLoai}>
                  {item.tenLoai}
                </option>
              ))}
            </select>
          </label>
          <label>
            Phong ban
            <select
              onChange={(event) =>
                onChange({ ...form, maPhongBanHienTai: event.target.value })
              }
              required
              value={form.maPhongBanHienTai}
            >
              <option value="">Chon phong ban</option>
              {departments.map((item) => (
                <option key={item.maPhongBan} value={item.maPhongBan}>
                  {item.tenPhongBan}
                </option>
              ))}
            </select>
          </label>
          <label>
            Serial
            <input
              onChange={(event) =>
                onChange({ ...form, serial: event.target.value })
              }
              value={form.serial}
            />
          </label>
          <label>
            Model
            <input
              onChange={(event) => onChange({ ...form, model: event.target.value })}
              value={form.model}
            />
          </label>
          <label>
            Nguyen gia
            <input
              min="0"
              onChange={(event) =>
                onChange({ ...form, nguyenGia: event.target.value })
              }
              required
              type="number"
              value={form.nguyenGia}
            />
          </label>
          <label>
            Hao mon luy ke (%)
            <input
              max="100"
              min="0"
              onChange={(event) =>
                onChange({ ...form, haoMonLuyKe: event.target.value })
              }
              step="0.01"
              type="number"
              value={form.haoMonLuyKe}
            />
          </label>
          <label>
            Gia tri con lai
            <input
              min="0"
              readOnly
              type="number"
              value={giaTriConLai}
            />
          </label>
          <label>
            Ngay nhap
            <input
              onChange={(event) =>
                onChange({ ...form, ngayNhap: event.target.value })
              }
              required
              type="date"
              value={form.ngayNhap}
            />
          </label>
          <label>
            Trang thai
            <select
              onChange={(event) =>
                onChange({
                  ...form,
                  trangThai: event.target.value as Asset['trangThai'],
                })
              }
              value={form.trangThai}
            >
              <option value="HOAT_DONG">Hoat dong</option>
              <option value="BAO_TRI">Bao tri</option>
              <option value="HONG">Hong</option>
            </select>
          </label>
          <label className="span-2">
            Ghi chu
            <textarea
              onChange={(event) =>
                onChange({ ...form, ghiChu: event.target.value })
              }
              rows={3}
              value={form.ghiChu}
            />
          </label>
        </div>

        <div className="modal-actions">
          <button className="secondary-button" onClick={onClose} type="button">
            Huy
          </button>
          <button className="primary-button" type="submit">
            <Save size={18} />
            Luu tai san
          </button>
        </div>
      </form>
    </div>
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

function toDepreciationPercent(asset: Asset) {
  if (!asset.nguyenGia) return 0;
  return Number(((asset.haoMonLuyKe / asset.nguyenGia) * 100).toFixed(2));
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

export default App;
