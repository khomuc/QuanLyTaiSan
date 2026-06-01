import { Save } from 'lucide-react';
import type { Permission, Role } from '../lib/types';

export default function RolesPage({
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
