import { Save, X } from 'lucide-react';
import type { FormEvent } from 'react';
import type { Department, EmployeeForm, Role } from '../lib/types';

export function EmployeeModal({
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
