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
import { api } from '../lib/api';
import { assetsApi } from '../lib/apis/assetsApi';
import * as demo from '../lib/mockData';
import { toDepreciationPercent } from '../lib/format';
import { useAuth } from '../contexts/AuthContext';
import { AssetDetailModal } from './assets/AssetDetailModal';
import { AssetModal } from './assets/AssetModal';
import { EmployeeModal } from './EmployeeModal';
import { Sidebar } from './Sidebar';
import { Toast } from './Toast';
import { DashboardPage } from '../pages/DashboardPage';
import { AssetReportPage } from '../pages/assets/AssetReportPage';
import { AssetsPage } from '../pages/assets/AssetsPage';
import { EmployeesPage } from '../pages/EmployeesPage';
import { RolesPage } from '../pages/RolesPage';
import { ApprovalsPage } from '../pages/ApprovalsPage';
import { NotificationsPage } from '../pages/NotificationsPage';
import { SettingsPage } from '../pages/SettingsPage';
import { AuditPage } from '../pages/AuditPage';
import { ProfilePage } from '../pages/ProfilePage';
import type {
  ApprovalItem,
  Asset,
  AssetCategory,
  AssetForm,
  AssetHistoryItem,
  AssetReport,
  AuditLog,
  AuthUser,
  DashboardOverview,
  Department,
  Employee,
  EmployeeForm,
  NotificationItem,
  Permission,
  Role,
  SystemSettings,
  ViewKey,
} from '../lib/types';

type ApiMode = 'api' | 'demo';

interface NavItem {
  key: ViewKey;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { key: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { key: 'assets', label: 'Tài sản', icon: PackageSearch },
  { key: 'assetReport', label: 'Báo cáo tài sản', icon: BarChart3 },
  { key: 'employees', label: 'Nhân viên', icon: Users },
  { key: 'roles', label: 'Vai trò & quyền', icon: ShieldCheck },
  { key: 'approvals', label: 'Ký duyệt', icon: ClipboardCheck },
  { key: 'notifications', label: 'Thông báo', icon: Bell },
  { key: 'settings', label: 'Cấu hình', icon: Settings },
  { key: 'audit', label: 'Giám sát log', icon: FileClock },
  { key: 'profile', label: 'Tài khoản', icon: User },
];

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

function buildAssetQrCode(maTaiSan: string) {
  return maTaiSan.trim() ? `QR-${maTaiSan.trim()}` : '';
}

export function AppContent() {
  const { user, logout } = useAuth();
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
          assetsApi.list({
            search: assetSearch,
            maLoai: assetCategory,
            maPhongBan: assetDepartment,
            trangThai: assetStatus,
          }),
          assetsApi.categories(),
          api.departments(),
        ]);
        setAssets(assetList.data);
        setAssetCategories(categoryList);
        setDepartments(departmentList);
      }

      if (nextView === 'assetReport') {
        const [report, categoryList, departmentList] = await Promise.all([
          assetsApi.report({
            search: assetSearch,
            maLoai: assetCategory,
            maPhongBan: assetDepartment,
            trangThai: assetStatus,
          }),
          assetsApi.categories(),
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
      setAssetHistory(await assetsApi.history(asset.maTaiSan));
    } catch {
      setAssetHistory([]);
      setToast('Chua tai duoc lich su thay doi');
    }
  }

  async function scanAssetByCode(decodedText: string) {
    const keyword = decodedText.trim();
    if (!keyword) {
      setToast('Ma QR khong hop le');
      return false;
    }

    const findLocalAsset = () => {
      const normalizedKeyword = keyword.toLowerCase();
      const assetCode = normalizedKeyword.startsWith('qr-')
        ? normalizedKeyword.slice(3)
        : normalizedKeyword;

      return assets.find(
        (asset) =>
          asset.maTaiSan.toLowerCase() === normalizedKeyword ||
          asset.maTaiSan.toLowerCase() === assetCode ||
          asset.maQR?.toLowerCase() === normalizedKeyword ||
          asset.soHieuTSCD?.toLowerCase() === normalizedKeyword,
      );
    };

    try {
      const matchedAsset = await assetsApi.lookup(keyword);
      setAssets((current) => {
        const exists = current.some(
          (asset) => asset.maTaiSan === matchedAsset.maTaiSan,
        );

        if (exists) {
          return current.map((asset) =>
            asset.maTaiSan === matchedAsset.maTaiSan ? matchedAsset : asset,
          );
        }

        return [matchedAsset, ...current];
      });
      setAssetSearch(keyword);

      await openAssetDetail(matchedAsset);
      setToast(`Da quet ma: ${keyword}`);
      return true;
    } catch {
      const localAsset = findLocalAsset();
      if (localAsset) {
        setAssetSearch(keyword);
        await openAssetDetail(localAsset);
        setToast(`Da quet ma: ${keyword}`);
        return true;
      }

      setToast(`Da doc ma ${keyword}, nhung khong tim thay tai san`);
      return false;
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
      maQR: assetForm.maQR || buildAssetQrCode(assetForm.maTaiSan) || undefined,
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
        const updated = await assetsApi.update(editingAsset, updatePayload);
        setAssets((current) =>
          current.map((asset) =>
            asset.maTaiSan === editingAsset ? updated : asset,
          ),
        );
      } else {
        const created = await assetsApi.create(payload);
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
      await assetsApi.liquidate(maTaiSan);
      setToast('Da dua tai san vao muc thanh ly');
      setAssets((current) =>
        current.map((asset) =>
          asset.maTaiSan === maTaiSan
            ? { ...asset, trangThai: 'THANH_LY' }
            : asset,
        ),
      );
    } catch {
      setToast('Chua dua duoc tai san vao muc thanh ly');
    }
  }

  async function finalizeAsset(maTaiSan: string) {
    try {
      await assetsApi.finalize(maTaiSan);
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
      const blob = await assetsApi.importTemplate();
      downloadBlob(blob, 'mau-import-tai-san.xlsx');
      setToast('Da tai file mau');
    } catch {
      setToast('Khong tai duoc file mau');
    }
  }

  async function exportAssetsExcel() {
    try {
      const blob = await assetsApi.exportExcel({
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
      const result = await assetsApi.importExcel(file);
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
    return null;
  }

  return (
    <div
      className={`app-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${
        sidebarOpen ? 'sidebar-open-mobile' : ''
      }`}
    >
      <Sidebar
        currentView={view}
        isCollapsed={sidebarCollapsed}
        isOpen={sidebarOpen}
        navItems={navItems}
        onClose={() => setSidebarOpen(false)}
        onNavigate={(nextView) => {
          setView(nextView);
          setSidebarOpen(false);
        }}
        onToggleCollapsed={() => setSidebarCollapsed((current) => !current)}
      />

      <div className="workspace">
        <header className="topbar">
          <button
            aria-expanded={sidebarOpen}
            aria-label={sidebarOpen ? 'Đóng menu' : 'Mở menu'}
            className="icon-button mobile-only"
            onClick={() => setSidebarOpen((current) => !current)}
            title={sidebarOpen ? 'Đóng menu' : 'Mở menu'}
            type="button"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div>
            <p className="eyebrow">Phân hệ System Lead</p>
            <h1>{navItems.find((item) => item.key === view)?.label}</h1>
          </div>
          <div className="topbar-actions">
            <span className={`mode-pill ${apiMode}`}>{apiMode.toUpperCase()}</span>
            <button
              className="icon-button"
              onClick={() => void loadView(view)}
              title="Tải lại"
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
              title="Đăng xuất"
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
              onScanAsset={scanAssetByCode}
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
          <span>Quản lý tài sản QR</span>
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

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  );
}
