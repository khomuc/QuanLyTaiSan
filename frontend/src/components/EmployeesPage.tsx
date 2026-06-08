import { FormEvent } from 'react';
import { Edit3, Trash2, Plus, Search, RefreshCw } from 'lucide-react';
import { Employee, Department, Role } from '../lib/types';

export interface EmployeeFormData {
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

function StatusPill({ value }: { value: string }) {
  const statusMap: Record<string, string> = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
  };
  return <span className={`status-pill ${statusMap[value] || ''}`}>{value}</span>;
}

export function EmployeesPage({
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
  // Get first letter of name for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .slice(-2)
      .join('')
      .toUpperCase();
  };

  const filteredEmployees = employees.filter((emp) =>
    search.toLowerCase() === ''
      ? true
      : emp.maNhanVien.toLowerCase().includes(search.toLowerCase()) ||
        emp.hoTen.toLowerCase().includes(search.toLowerCase()) ||
        emp.email.toLowerCase().includes(search.toLowerCase()) ||
        (emp.tenPhongBan?.toLowerCase().includes(search.toLowerCase()) || false),
  );

  return (
    <section className="panel full">
      <div className="employees-container">
        {/* Toolbar */}
        <div className="employees-toolbar">
          <div className="search-box" style={{ flex: 1, minWidth: '280px' }}>
            <Search size={18} />
            <input
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Tìm mã, tên, email, phòng ban..."
              value={search}
            />
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

        {/* Employees List */}
        {filteredEmployees.length > 0 ? (
          <div className="employees-list">
            {filteredEmployees.map((employee) => (
              <div key={employee.maNhanVien} className="employee-item">
                {/* Avatar */}
                <div className="employee-avatar" title={employee.hoTen}>
                  {getInitials(employee.hoTen)}
                </div>

                {/* Info */}
                <div className="employee-info">
                  <strong>{employee.hoTen}</strong>
                  <span>{employee.chucVu || '(Không có chức vụ)'}</span>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                    {employee.maNhanVien}
                  </span>
                </div>

                {/* Meta */}
                <div className="employee-meta">
                  <div className="employee-meta-item">
                    <span>{employee.email}</span>
                  </div>
                  <div className="employee-meta-item">
                    <strong>{employee.tenPhongBan || employee.maPhongBan}</strong>
                  </div>
                  <div className="employee-meta-item">
                    <strong>{employee.tenVaiTro || employee.maVaiTro}</strong>
                  </div>
                  <StatusPill value={employee.trangThai} />
                </div>

                {/* Actions */}
                <div className="employee-actions">
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
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: '#6b7280',
            }}
          >
            <p>Không tìm thấy nhân viên nào</p>
          </div>
        )}
      </div>
    </section>
  );
}

export function EmployeeModal({
  form,
  departments,
  roles,
  isEditing,
  onChange,
  onClose,
  onSubmit,
}: {
  form: EmployeeFormData;
  departments: Department[];
  roles: Role[];
  isEditing: boolean;
  onChange: (form: EmployeeFormData) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="modal-backdrop">
      <form className="modal" onSubmit={onSubmit}>
        <div className="panel-header">
          <h2>{isEditing ? 'Sửa nhân viên' : 'Thêm nhân viên'}</h2>
          <button
            className="icon-button"
            onClick={onClose}
            title="Đóng"
            type="button"
          >
            ✕
          </button>
        </div>

        <div className="form-grid">
          {/* Column 1 - Personal Info */}
          <label>
            <span>Mã nhân viên</span>
            <input
              disabled={isEditing}
              onChange={(event) =>
                onChange({ ...form, maNhanVien: event.target.value })
              }
              placeholder="VD: NV001"
              required
              value={form.maNhanVien}
            />
          </label>
          <label>
            <span>Họ tên</span>
            <input
              onChange={(event) =>
                onChange({ ...form, hoTen: event.target.value })
              }
              placeholder="Nhập họ tên"
              required
              value={form.hoTen}
            />
          </label>
          <label>
            <span>Email</span>
            <input
              onChange={(event) =>
                onChange({ ...form, email: event.target.value })
              }
              placeholder="user@example.com"
              required
              type="email"
              value={form.email}
            />
          </label>
          <label>
            <span>Chức vụ</span>
            <input
              onChange={(event) =>
                onChange({ ...form, chucVu: event.target.value })
              }
              placeholder="VD: Quản lý"
              value={form.chucVu}
            />
          </label>
          <label>
            <span>Số điện thoại</span>
            <input
              onChange={(event) =>
                onChange({ ...form, soDienThoai: event.target.value })
              }
              placeholder="0901234567"
              type="tel"
              value={form.soDienThoai}
            />
          </label>
          <label>
            <span>Mật khẩu {isEditing ? '(để trống nếu không đổi)' : ''}</span>
            <input
              onChange={(event) =>
                onChange({ ...form, matKhau: event.target.value })
              }
              placeholder="Nhập mật khẩu"
              required={!isEditing}
              type="password"
              value={form.matKhau}
            />
          </label>
          <label>
            <span>Phòng ban</span>
            <select
              onChange={(event) =>
                onChange({ ...form, maPhongBan: event.target.value })
              }
              required
              value={form.maPhongBan}
            >
              <option value="">-- Chọn phòng ban --</option>
              {departments.map((dept) => (
                <option key={dept.maPhongBan} value={dept.maPhongBan}>
                  {dept.tenPhongBan}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Vai trò</span>
            <select
              onChange={(event) =>
                onChange({ ...form, maVaiTro: event.target.value })
              }
              required
              value={form.maVaiTro}
            >
              <option value="">-- Chọn vai trò --</option>
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
            Hủy
          </button>
          <button className="primary-button" type="submit">
            💾 Lưu
          </button>
        </div>
      </form>
    </div>
  );
}
