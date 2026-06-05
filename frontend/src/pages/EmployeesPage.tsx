import { useEffect, useState } from 'react';
import { Edit3, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { StatusPill } from '../components/ui';
import { api } from '../lib/api';
import * as demo from '../lib/mockData';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { EmployeeModal } from '../components/EmployeeModal';
import { hasPermission } from '../lib/navigation';
import type { Employee, EmployeeForm } from '../lib/types';

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

export default function EmployeesPage() {
  const { user } = useAuth();
  const { employees, departments, roles, setEmployees, setDepartments, setRoles } = useData();
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [employeeModal, setEmployeeModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<string | null>(null);
  const [employeeForm, setEmployeeForm] = useState(emptyEmployee);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const [employeeList, departmentList, roleList] = await Promise.all([
        api.employees(search),
        api.departments(),
        api.roles(),
      ]);
      setEmployees(employeeList.data);
      setDepartments(departmentList);
      setRoles(roleList);
    } catch {
      setEmployees(demo.employees);
      setDepartments(demo.departments);
      setRoles(demo.roles);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = search.trim()
    ? employees.filter((employee) =>
        [
          employee.maNhanVien,
          employee.hoTen,
          employee.email,
          employee.tenPhongBan ?? '',
          employee.tenVaiTro ?? '',
        ]
          .join(' ')
          .toLowerCase()
          .includes(search.trim().toLowerCase()),
      )
    : employees;

  const openCreateEmployee = () => {
    setEditingEmployee(null);
    setEmployeeForm(emptyEmployee);
    setEmployeeModal(true);
  };

  const openEditEmployee = (employee: Employee) => {
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
  };

  async function saveEmployee(event: React.FormEvent<HTMLFormElement>) {
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
    }

    setEmployeeModal(false);
  }

  async function deactivateEmployee(maNhanVien: string) {
    try {
      await api.deleteEmployee(maNhanVien);
    } catch {
      // Silently fail
    }

    setEmployees((current) =>
      current.map((employee) =>
        employee.maNhanVien === maNhanVien
          ? { ...employee, trangThai: 'INACTIVE' }
          : employee,
      ),
    );
  }

  if (!user) return null;

  return (
    <>
      <section className="panel full">
        <div className="panel-header">
          <div className="search-box">
            <Search size={18} />
            <input
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tim ma, ten, email, phong ban"
              value={search}
            />
          </div>
          <div className="button-row">
            <button className="icon-button" onClick={loadEmployees} title="Tai lai">
              <RefreshCw size={18} />
            </button>
            {hasPermission(user, 'STAFF_CREATE') && (
              <button className="primary-button" onClick={openCreateEmployee} type="button">
                <Plus size={18} />
                Them nhan vien
              </button>
            )}
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
              {filteredEmployees.map((employee) => (
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
                    {hasPermission(user, 'STAFF_EDIT') && (
                      <button
                        className="icon-button"
                        onClick={() => openEditEmployee(employee)}
                        title="Sua"
                        type="button"
                      >
                        <Edit3 size={16} />
                      </button>
                    )}
                    {hasPermission(user, 'STAFF_DELETE') && (
                      <button
                        className="icon-button danger"
                        onClick={() => deactivateEmployee(employee.maNhanVien)}
                        title="Khoa tai khoan"
                        type="button"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {employeeModal &&
        user &&
        hasPermission(user, editingEmployee ? 'STAFF_EDIT' : 'STAFF_CREATE') && (
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
    </>
  );
}
