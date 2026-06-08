import { Edit3, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { useState, useMemo } from 'react';
import { StatusPill } from '../components/ui';
import type { Employee, Department, Role } from '../lib/types';

export default function EmployeesPage({
  employees,
  search,
  onSearch,
  onCreate,
  onEdit,
  onDelete,
  onRefresh,
  departments = [],
  roles = [],
}: {
  employees: Employee[];
  search: string;
  onSearch: (value: string) => void;
  onCreate: () => void;
  onEdit: (employee: Employee) => void;
  onDelete: (maNhanVien: string) => void;
  onRefresh: () => void;
  departments?: Department[];
  roles?: Role[];
}) {
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Filter employees based on all criteria
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        emp.maNhanVien.toLowerCase().includes(searchLower) ||
        emp.hoTen.toLowerCase().includes(searchLower) ||
        emp.email.toLowerCase().includes(searchLower) ||
        (emp.tenPhongBan && emp.tenPhongBan.toLowerCase().includes(searchLower));

      const matchesDepartment = !filterDepartment || emp.maPhongBan === filterDepartment;
      const matchesRole = !filterRole || emp.maVaiTro === filterRole;
      const matchesStatus = !filterStatus || emp.trangThai === filterStatus;

      return matchesSearch && matchesDepartment && matchesRole && matchesStatus;
    });
  }, [employees, search, filterDepartment, filterRole, filterStatus]);

  return (
    <section className="panel full">
      <div className="panel-header">
        <div style={{ flex: 1 }}>
          <div className="search-box">
            <Search size={18} />
            <input
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Tìm mã, tên, email, phòng ban"
              value={search}
            />
          </div>
        </div>
        <div className="button-row">
          <button className="icon-button" onClick={onRefresh} title="Tải lại">
            <RefreshCw size={18} />
          </button>
          <button className="primary-button" onClick={onCreate} type="button">
            <Plus size={18} />
            Thêm nhân viên
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        style={{
          padding: '15px 20px',
          backgroundColor: '#f9f9f9',
          borderBottom: '1px solid #ddd',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
        }}
      >
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: '600', color: '#666' }}>
            Phòng ban
          </label>
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontSize: '14px',
            }}
          >
            <option value="">Tất cả phòng ban</option>
            {departments.map((dept) => (
              <option key={dept.maPhongBan} value={dept.maPhongBan}>
                {dept.tenPhongBan}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: '600', color: '#666' }}>
            Vai trò
          </label>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontSize: '14px',
            }}
          >
            <option value="">Tất cả vai trò</option>
            {roles.map((role) => (
              <option key={role.maVaiTro} value={role.maVaiTro}>
                {role.tenVaiTro}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: '600', color: '#666' }}>
            Trạng thái
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontSize: '14px',
            }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <div style={{ padding: '10px 20px', fontSize: '12px', color: '#666' }}>
        Tìm thấy {filteredEmployees.length} kết quả
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Mã</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Phòng ban</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
                  Không tìm thấy nhân viên
                </td>
              </tr>
            ) : (
              filteredEmployees.map((employee) => (
                <tr key={employee.maNhanVien}>
                  <td>{employee.maNhanVien}</td>
                  <td>
                    <strong>{employee.hoTen}</strong>
                    {employee.chucVu && <span style={{ display: 'block', fontSize: '12px', color: '#666' }}>{employee.chucVu}</span>}
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
                      title="Sửa"
                      type="button"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      className="icon-button danger"
                      onClick={() => onDelete(employee.maNhanVien)}
                      title="Khóa tài khoản"
                      type="button"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
