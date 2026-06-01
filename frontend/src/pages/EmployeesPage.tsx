import { Edit3, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { StatusPill } from '../components/ui';
import type { Employee } from '../lib/types';

export default function EmployeesPage({
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
