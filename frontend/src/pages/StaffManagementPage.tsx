import { useState, useEffect } from 'react';
import { Edit3, RefreshCw, Search, Save } from 'lucide-react';
import { api } from '../lib/api';
import { StatusPill } from '../components/ui';
import type { Employee, Role, Permission, Department } from '../lib/types';

export default function StaffManagementPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [search, setSearch] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

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
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }

  // Filter employees based on search, department, role, status
  const filteredEmployees = employees.filter((emp) => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      emp.maNhanVien.toLowerCase().includes(searchLower) ||
      emp.hoTen.toLowerCase().includes(searchLower) ||
      emp.email.toLowerCase().includes(searchLower);

    const matchesDepartment = !filterDepartment || emp.maPhongBan === filterDepartment;
    const matchesRole = !filterRole || emp.maVaiTro === filterRole;
    const matchesStatus = !filterStatus || emp.trangThai === filterStatus;

    return matchesSearch && matchesDepartment && matchesRole && matchesStatus;
  });

  function handleSelectEmployee(emp: Employee) {
    setSelectedEmployee(emp);
    const role = roles.find((r) => r.maVaiTro === emp.maVaiTro);
    setSelectedPermissions(role?.permissions ?? []);
  }

  async function savePermissionOverride() {
    if (!selectedEmployee) return;

    setSaving(true);
    try {
      // TODO: Replace with actual API endpoint for permission override
      // await api.overrideEmployeePermissions(selectedEmployee.maNhanVien, selectedPermissions);
      console.log(`Saving override for ${selectedEmployee.maNhanVien}:`, selectedPermissions);
      alert('Quyền hạn đã được cập nhật thành công (chế độ demo)');
    } catch (error) {
      console.error('Failed to save override:', error);
      alert('Lỗi: Không thể cập nhật quyền hạn');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="panel full">
      <div className="panel-header">
        <h1>Quản Lý Nhân Viên & Quyền Hạn</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '20px' }}>
        {/* Left: Employee List */}
        <div>
          <div style={{ marginBottom: '15px' }}>
            <h2 style={{ marginBottom: '10px' }}>Danh Sách Nhân Viên</h2>
            
            {/* Search */}
            <div style={{ marginBottom: '10px' }}>
              <div className="search-box">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Tìm mã, tên, email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="">Tất cả phòng ban</option>
                {departments.map((dept) => (
                  <option key={dept.maPhongBan} value={dept.maPhongBan}>
                    {dept.tenPhongBan}
                  </option>
                ))}
              </select>

              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="">Tất cả vai trò</option>
                {roles.map((role) => (
                  <option key={role.maVaiTro} value={role.maVaiTro}>
                    {role.tenVaiTro}
                  </option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>

            {/* Refresh Button */}
            <button
              onClick={loadData}
              disabled={loading}
              style={{
                marginBottom: '10px',
                padding: '8px 12px',
                backgroundColor: '#f5f5f5',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              <RefreshCw size={16} style={{ marginRight: '5px' }} />
              Tải lại ({filteredEmployees.length})
            </button>
          </div>

          {/* Employee List */}
          <div
            style={{
              border: '1px solid #ddd',
              borderRadius: '4px',
              maxHeight: '600px',
              overflowY: 'auto',
            }}
          >
            {filteredEmployees.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                Không tìm thấy nhân viên
              </div>
            ) : (
              filteredEmployees.map((emp) => (
                <div
                  key={emp.maNhanVien}
                  onClick={() => handleSelectEmployee(emp)}
                  style={{
                    padding: '12px',
                    borderBottom: '1px solid #eee',
                    cursor: 'pointer',
                    backgroundColor: selectedEmployee?.maNhanVien === emp.maNhanVien ? '#e3f2fd' : 'white',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedEmployee?.maNhanVien !== emp.maNhanVien) {
                      e.currentTarget.style.backgroundColor = '#f9f9f9';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedEmployee?.maNhanVien !== emp.maNhanVien) {
                      e.currentTarget.style.backgroundColor = 'white';
                    }
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{emp.hoTen}</div>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                        {emp.maNhanVien}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>{emp.email}</div>
                    </div>
                    <div style={{ fontSize: '11px', color: '#999', textAlign: 'right' }}>
                      <div>{emp.tenPhongBan}</div>
                      <div>{emp.tenVaiTro}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Permission Management */}
        <div>
          {selectedEmployee ? (
            <div>
              <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                <h2 style={{ marginBottom: '10px' }}>{selectedEmployee.hoTen}</h2>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  <div>
                    <strong>Mã nhân viên:</strong> {selectedEmployee.maNhanVien}
                  </div>
                  <div>
                    <strong>Email:</strong> {selectedEmployee.email}
                  </div>
                  <div>
                    <strong>Phòng ban:</strong> {selectedEmployee.tenPhongBan || selectedEmployee.maPhongBan}
                  </div>
                  <div>
                    <strong>Vai trò:</strong> {selectedEmployee.tenVaiTro || selectedEmployee.maVaiTro}
                  </div>
                  <div>
                    <strong>Trạng thái:</strong> <StatusPill value={selectedEmployee.trangThai} />
                  </div>
                </div>
              </div>

              <div>
                <h3 style={{ marginBottom: '10px' }}>Quyền Hạn Được Cấp</h3>
                <div
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    padding: '12px',
                    maxHeight: '400px',
                    overflowY: 'auto',
                  }}
                >
                  {permissions.length === 0 ? (
                    <div style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
                      Không có quyền hạn
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {permissions.map((perm) => (
                        <label
                          key={perm.maQuyen}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            padding: '8px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f5f5f5';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedPermissions.includes(perm.maQuyen)}
                            onChange={(e) =>
                              setSelectedPermissions((cur) =>
                                e.target.checked
                                  ? [...cur, perm.maQuyen]
                                  : cur.filter((p) => p !== perm.maQuyen),
                              )
                            }
                            style={{ marginRight: '8px', marginTop: '2px', cursor: 'pointer' }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '500', fontSize: '14px' }}>
                              {perm.tenQuyen}
                            </div>
                            <div style={{ fontSize: '12px', color: '#999' }}>
                              {perm.maQuyen}
                              {perm.moTa && ` - ${perm.moTa}`}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={savePermissionOverride}
                  disabled={saving}
                  style={{
                    marginTop: '15px',
                    padding: '10px 16px',
                    backgroundColor: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Save size={16} />
                  {saving ? 'Đang lưu...' : 'Lưu Quyền Hạn'}
                </button>
              </div>
            </div>
          ) : (
            <div
              style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: '#999',
                backgroundColor: '#f9f9f9',
                borderRadius: '4px',
                marginTop: '20px',
              }}
            >
              <Edit3 size={48} style={{ marginBottom: '10px', opacity: 0.5 }} />
              <div>Chọn một nhân viên từ danh sách bên trái</div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
