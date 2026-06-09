import { useState, useEffect, useMemo } from 'react';
import {
  RefreshCw,
  Search,
  Save,
  ShieldCheck,
  UserX,
  ChevronRight,
  Building2,
  Shield,
  Info,
} from 'lucide-react';
import { api } from '../lib/api';
import * as demo from '../lib/mockData';
import type { Employee, Role, Permission, Department } from '../lib/types';

// ─── helpers ────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name
    .split(' ')
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

/** Map a permission code prefix → friendly module name */
const MODULE_LABELS: Record<string, string> = {
  ASSET:    'Tài sản',
  STAFF:    'Nhân viên',
  ROLE:     'Vai trò & quyền',
  APPROVAL: 'Ký duyệt',
  SETTINGS: 'Cấu hình hệ thống',
  AUDIT:    'Giám sát & log',
};

/** Colours for module header accent */
const MODULE_COLORS: Record<string, { bg: string; text: string }> = {
  ASSET:    { bg: '#dbeafe', text: '#1e40af' },
  STAFF:    { bg: '#d1fae5', text: '#065f46' },
  ROLE:     { bg: '#ede9fe', text: '#4c1d95' },
  APPROVAL: { bg: '#fef3c7', text: '#78350f' },
  SETTINGS: { bg: '#fee2e2', text: '#991b1b' },
  AUDIT:    { bg: '#f3f4f6', text: '#374151' },
};

function getModule(code: string) {
  const prefix = code.split('_')[0] ?? 'OTHER';
  return {
    key: prefix,
    label: MODULE_LABELS[prefix] ?? prefix,
    color: MODULE_COLORS[prefix] ?? { bg: '#f3f4f6', text: '#374151' },
  };
}

function groupPermissions(permissions: Permission[]) {
  const map = new Map<string, { label: string; color: { bg: string; text: string }; items: Permission[] }>();
  for (const p of permissions) {
    const { key, label, color } = getModule(p.maQuyen);
    if (!map.has(key)) map.set(key, { label, color, items: [] });
    map.get(key)!.items.push(p);
  }
  return [...map.entries()].map(([key, val]) => ({ key, ...val }));
}

// ─── component ──────────────────────────────────────────────────────────────

export default function StaffManagementPage() {
  const [employees, setEmployees]   = useState<Employee[]>(demo.employees);
  const [roles, setRoles]           = useState<Role[]>(demo.roles);
  const [permissions, setPermissions] = useState<Permission[]>(demo.permissions);
  const [departments, setDepartments] = useState<Department[]>(demo.departments);

  const [search, setSearch]                 = useState('');
  const [filterDept, setFilterDept]         = useState('');
  const [filterRole, setFilterRole]         = useState('');
  const [filterStatus, setFilterStatus]     = useState('');

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedPerms, setSelectedPerms]       = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => { void loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [empList, roleList, permList, deptList] = await Promise.all([
        api.employees(),
        api.roles(),
        api.permissions(),
        api.departments(),
      ]);
      setEmployees(empList.data);
      setRoles(roleList);
      setPermissions(permList);
      setDepartments(deptList);
    } catch {
      setEmployees(demo.employees);
      setRoles(demo.roles);
      setPermissions(demo.permissions);
      setDepartments(demo.departments);
    } finally {
      setLoading(false);
    }
  }

  // ── derived data ────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return employees.filter((e) => {
      const matchSearch =
        e.maNhanVien.toLowerCase().includes(q) ||
        e.hoTen.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q);
      const matchDept   = !filterDept   || e.maPhongBan === filterDept;
      const matchRole   = !filterRole   || e.maVaiTro   === filterRole;
      const matchStatus = !filterStatus || e.trangThai  === filterStatus;
      return matchSearch && matchDept && matchRole && matchStatus;
    });
  }, [employees, search, filterDept, filterRole, filterStatus]);

  const permissionGroups = useMemo(() => groupPermissions(permissions), [permissions]);

  const grantedCount = selectedPerms.length;
  const totalCount   = permissions.length;
  const pct          = totalCount ? Math.round((grantedCount / totalCount) * 100) : 0;

  // ── actions ─────────────────────────────────────────────────────────────

  function handleSelectEmployee(emp: Employee) {
    setSelectedEmployee(emp);
    const role = roles.find((r) => r.maVaiTro === emp.maVaiTro);
    setSelectedPerms(role?.permissions ?? []);
  }

  function togglePerm(id: string) {
    setSelectedPerms((cur) =>
      cur.includes(id) ? cur.filter((p) => p !== id) : [...cur, id],
    );
  }

  async function handleSave() {
    if (!selectedEmployee) return;
    setSaving(true);
    try {
      await api.overrideEmployeePermissions(
        selectedEmployee.maNhanVien,
        selectedPerms,
      );
      showToast('Đã cập nhật quyền hạn thành công!', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      showToast(`Lỗi: Không thể cập nhật quyền hạn — ${msg}`, 'error');
    } finally {
      setSaving(false);
    }
  }

  function showToast(msg: string, type: 'success' | 'error') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  // ── render ───────────────────────────────────────────────────────────────

  return (
    <section className="panel full" style={{ padding: 0, overflow: 'hidden' }}>

      {/* ── Page header ─────────────────────────────────────────── */}
      <div className="panel-header" style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', margin: 0 }}>
        <div>
          <p className="eyebrow">Quản trị hệ thống</p>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShieldCheck size={22} color="#3498db" />
            Quản Lý Nhân Viên &amp; Phân Quyền
          </h1>
        </div>
        <button
          className="secondary-button"
          onClick={() => void loadData()}
          disabled={loading}
          title="Tải lại dữ liệu"
        >
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          {loading ? 'Đang tải...' : 'Tải lại'}
        </button>
      </div>

      {/* ── Two-column body ─────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px minmax(0, 1fr)', minHeight: 'calc(100vh - 160px)' }}>

        {/* ══ LEFT: Employee list ══════════════════════════════════ */}
        <div style={{ borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>

          {/* Search & filters */}
          <div style={{ padding: '16px', borderBottom: '1px solid #f3f4f6', background: '#fafafa' }}>
            <div className="search-box" style={{ marginBottom: 10 }}>
              <Search size={16} color="#9ca3af" />
              <input
                type="text"
                placeholder="Tìm mã, tên, email nhân viên..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ border: 0, outline: 0, background: 'transparent', flex: 1 }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
              <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} style={{ fontSize: 13, minHeight: 36 }}>
                <option value="">Tất cả phòng ban</option>
                {departments.map((d) => (
                  <option key={d.maPhongBan} value={d.maPhongBan}>{d.tenPhongBan}</option>
                ))}
              </select>
              <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} style={{ fontSize: 13, minHeight: 36 }}>
                <option value="">Tất cả vai trò</option>
                {roles.map((r) => (
                  <option key={r.maVaiTro} value={r.maVaiTro}>{r.tenVaiTro}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ fontSize: 13, minHeight: 36, width: 160 }}>
                <option value="">Tất cả trạng thái</option>
                <option value="ACTIVE">Đang hoạt động</option>
                <option value="INACTIVE">Đã khóa</option>
              </select>
              <span style={{ fontSize: 12, color: '#9ca3af' }}>
                {filtered.length} / {employees.length} nhân viên
              </span>
            </div>
          </div>

          {/* Employee list */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
                <UserX size={36} style={{ marginBottom: 12, opacity: 0.4 }} />
                <p style={{ margin: 0, fontSize: 14 }}>Không tìm thấy nhân viên</p>
              </div>
            ) : (
              filtered.map((emp) => {
                const isActive  = emp.trangThai === 'ACTIVE';
                const isSelected = selectedEmployee?.maNhanVien === emp.maNhanVien;
                return (
                  <button
                    key={emp.maNhanVien}
                    onClick={() => handleSelectEmployee(emp)}
                    style={{
                      width: '100%',
                      display: 'grid',
                      gridTemplateColumns: '44px minmax(0,1fr) auto',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 16px',
                      border: 0,
                      borderBottom: '1px solid #f3f4f6',
                      background: isSelected ? '#ecf7ff' : 'white',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.15s',
                      borderLeft: isSelected ? '3px solid #3498db' : '3px solid transparent',
                    }}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = '#f9fafb'; }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'white'; }}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                      display: 'grid', placeItems: 'center',
                      background: isActive
                        ? 'linear-gradient(135deg, #3498db, #2980b9)'
                        : '#e5e7eb',
                      color: isActive ? 'white' : '#9ca3af',
                      fontWeight: 700, fontSize: 14,
                    }}>
                      {initials(emp.hoTen)}
                    </div>

                    {/* Info */}
                    <div style={{ minWidth: 0 }}>
                      <strong style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#1f2933', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {emp.hoTen}
                      </strong>
                      <span style={{ display: 'block', fontSize: 12, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {emp.email}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                        <Building2 size={10} />
                        {emp.tenPhongBan ?? emp.maPhongBan}
                      </span>
                    </div>

                    {/* Status + chevron */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                      <span className={`status-pill ${isActive ? 'active' : 'inactive'}`} style={{ fontSize: 10 }}>
                        {isActive ? 'Active' : 'Khóa'}
                      </span>
                      <ChevronRight size={14} color="#d1d5db" />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ══ RIGHT: Permission editor ═════════════════════════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', background: '#fafafa' }}>

          {!selectedEmployee ? (
            /* Empty state */
            <div className="no-selection" style={{ minHeight: 'calc(100vh - 160px)' }}>
              <div className="no-selection-icon">
                <Shield size={56} color="#d1d5db" />
              </div>
              <h3>Chọn một nhân viên</h3>
              <p>Bấm vào tên nhân viên bên trái để xem và chỉnh sửa quyền hạn được cấp.</p>
            </div>
          ) : (
            <>
              {/* ── Employee info card ── */}
              <div style={{ padding: '20px 24px', background: 'white', borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '52px minmax(0,1fr) auto', alignItems: 'center', gap: 16 }}>
                  {/* Avatar */}
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%',
                    display: 'grid', placeItems: 'center', flexShrink: 0,
                    background: selectedEmployee.trangThai === 'ACTIVE'
                      ? 'linear-gradient(135deg, #3498db, #2980b9)'
                      : '#e5e7eb',
                    color: selectedEmployee.trangThai === 'ACTIVE' ? 'white' : '#9ca3af',
                    fontWeight: 700, fontSize: 16,
                  }}>
                    {initials(selectedEmployee.hoTen)}
                  </div>

                  {/* Details */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{selectedEmployee.hoTen}</h2>
                      <span className={`status-pill ${selectedEmployee.trangThai === 'ACTIVE' ? 'active' : 'inactive'}`}>
                        {selectedEmployee.trangThai === 'ACTIVE' ? 'Đang hoạt động' : 'Đã khóa'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 20px' }}>
                      {[
                        { label: 'Mã NV', value: selectedEmployee.maNhanVien },
                        { label: 'Email', value: selectedEmployee.email },
                        { label: 'Phòng ban', value: selectedEmployee.tenPhongBan ?? selectedEmployee.maPhongBan },
                        { label: 'Vai trò', value: selectedEmployee.tenVaiTro ?? selectedEmployee.maVaiTro },
                      ].map(({ label, value }) => (
                        <span key={label} style={{ fontSize: 13, color: '#6b7280' }}>
                          <strong style={{ color: '#374151', marginRight: 4 }}>{label}:</strong>
                          {value}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Save button */}
                  <button
                    className="primary-button"
                    onClick={() => void handleSave()}
                    disabled={saving}
                    style={{ alignSelf: 'flex-start', minWidth: 130, opacity: saving ? 0.7 : 1 }}
                  >
                    <Save size={16} />
                    {saving ? 'Đang lưu...' : 'Lưu quyền hạn'}
                  </button>
                </div>
              </div>

              {/* ── Permission stats bar ── */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr auto',
                alignItems: 'center', gap: 16,
                padding: '12px 24px',
                background: 'white',
                borderBottom: '1px solid #f3f4f6',
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 600 }}>
                      Quyền hạn được cấp
                    </span>
                    <span className="badge-count">{grantedCount}/{totalCount}</span>
                  </div>
                  <div className="stat-progress">
                    <div className="stat-bar" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#3498db' }}>{pct}%</div>
              </div>

              {/* ── Permission tip ── */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 24px',
                background: '#fffbeb',
                borderBottom: '1px solid #fef08a',
                fontSize: 12, color: '#78350f',
              }}>
                <Info size={14} style={{ flexShrink: 0 }} />
                Quyền hiển thị bên dưới được kế thừa từ vai trò của nhân viên.
                Bỏ chọn để thu hồi từng quyền riêng lẻ, sau đó nhấn&nbsp;<strong>Lưu quyền hạn</strong>.
              </div>

              {/* ── Grouped permission list ── */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'grid', gap: 20 }}>
                {permissionGroups.map((group) => (
                  <div key={group.key} className="permission-module">
                    {/* Module header */}
                    <div className="module-header">
                      <h3 style={{ margin: 0 }}>
                        <span
                          style={{
                            display: 'inline-flex', alignItems: 'center',
                            gap: 8, padding: '4px 12px', borderRadius: 20,
                            background: group.color.bg, color: group.color.text,
                            fontSize: 13, fontWeight: 700,
                          }}
                        >
                          {group.label}
                        </span>
                      </h3>
                      <span className="module-count">
                        {group.items.filter((p) => selectedPerms.includes(p.maQuyen)).length} / {group.items.length}
                      </span>
                    </div>

                    {/* Permission items */}
                    <div className="module-permissions">
                      {group.items.map((perm) => {
                        const checked = selectedPerms.includes(perm.maQuyen);
                        return (
                          <label
                            key={perm.maQuyen}
                            className={`permission-item${checked ? ' checked' : ''}`}
                            style={{ cursor: 'pointer' }}
                          >
                            <input
                              type="checkbox"
                              className="permission-checkbox"
                              checked={checked}
                              onChange={() => togglePerm(perm.maQuyen)}
                            />
                            <div className="permission-content">
                              <span className="permission-name">{perm.tenQuyen}</span>
                              {perm.moTa && (
                                <span className="permission-desc">{perm.moTa}</span>
                              )}
                              <span className="permission-code">{perm.maQuyen}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Bottom save bar ── */}
              <div style={{
                padding: '14px 24px',
                background: 'white',
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: 13, color: '#6b7280' }}>
                  {grantedCount} quyền được cấp cho&nbsp;
                  <strong style={{ color: '#1f2933' }}>{selectedEmployee.hoTen}</strong>
                </span>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    className="secondary-button"
                    onClick={() => {
                      const role = roles.find((r) => r.maVaiTro === selectedEmployee.maVaiTro);
                      setSelectedPerms(role?.permissions ?? []);
                    }}
                  >
                    Đặt lại
                  </button>
                  <button
                    className="primary-button"
                    onClick={() => void handleSave()}
                    disabled={saving}
                    style={{ opacity: saving ? 0.7 : 1 }}
                  >
                    <Save size={16} />
                    {saving ? 'Đang lưu...' : 'Lưu quyền hạn'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Toast ─────────────────────────────────────────────────── */}
      {toast && (
        <div
          className="toast"
          style={{ background: toast.type === 'success' ? '#2e795b' : '#dc2626' }}
        >
          {toast.msg}
        </div>
      )}
    </section>
  );
}
