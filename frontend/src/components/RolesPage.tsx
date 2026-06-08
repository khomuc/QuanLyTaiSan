import { Save } from 'lucide-react';
import { Permission, Role } from '../lib/types';

export function RolesPage({
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
  ).sort();

  const selectedRole = roles.find((role) => role.maVaiTro === selectedRoleId);
  const selectedPermissionCount = selectedPermissionIds.length;
  const totalPermissions = permissions.length;

  return (
    <div className="roles-container">
      {/* Roles List - Left Panel */}
      <section className="roles-panel">
        <div className="panel-header">
          <h2>Vai trò</h2>
          <span className="badge-count">{roles.length}</span>
        </div>
        <div className="roles-list">
          {roles.map((role) => (
            <button
              key={role.maVaiTro}
              className={`role-button ${role.maVaiTro === selectedRoleId ? 'active' : ''}`}
              onClick={() => onSelectRole(role.maVaiTro)}
              type="button"
              title={role.moTa || role.tenVaiTro}
            >
              <div className="role-info">
                <strong>{role.tenVaiTro}</strong>
                {role.moTa && <span className="role-desc">{role.moTa}</span>}
              </div>
              <div className="role-indicator">
                {role.maVaiTro === selectedRoleId && <div className="indicator-dot" />}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Permissions - Right Panel */}
      <section className="permissions-panel">
        {selectedRole ? (
          <>
            {/* Header with Title and Save Button */}
            <div className="permissions-header">
              <div className="permissions-title">
                <h2>Phân quyền - {selectedRole.tenVaiTro}</h2>
                <p className="permissions-desc">
                  Chọn những quyền được phép cho vai trò này
                </p>
              </div>
              <button
                className="primary-button"
                onClick={onSave}
                type="button"
                title="Lưu phân quyền"
              >
                <Save size={18} />
                Lưu phân quyền
              </button>
            </div>

            {/* Permission Stats */}
            <div className="permissions-stats">
              <div className="stat-item">
                <span className="stat-label">Quyền được cấp</span>
                <strong className="stat-value">
                  {selectedPermissionCount}/{totalPermissions}
                </strong>
              </div>
              <div className="stat-progress">
                <div
                  className="stat-bar"
                  style={{
                    width: `${(selectedPermissionCount / totalPermissions) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Permissions by Module */}
            <div className="permissions-list">
              {modules.map((moduleName) => {
                const modulePermissions = permissions.filter(
                  (permission) => (permission.module ?? 'OTHER') === moduleName,
                );
                const moduleCheckedCount = modulePermissions.filter((p) =>
                  selectedPermissionIds.includes(p.maQuyen),
                ).length;

                return (
                  <div key={moduleName} className="permission-module">
                    {/* Module Header */}
                    <div className="module-header">
                      <h3>
                        <span className="module-icon">📦</span>
                        {moduleName}
                      </h3>
                      <span className="module-count">
                        {moduleCheckedCount}/{modulePermissions.length}
                      </span>
                    </div>

                    {/* Module Permissions */}
                    <div className="module-permissions">
                      {modulePermissions.map((permission) => {
                        const isChecked = selectedPermissionIds.includes(
                          permission.maQuyen,
                        );

                        return (
                          <label
                            key={permission.maQuyen}
                            className={`permission-item ${
                              isChecked ? 'checked' : ''
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() =>
                                onTogglePermission(permission.maQuyen)
                              }
                              className="permission-checkbox"
                            />
                            <div className="permission-content">
                              <span className="permission-name">
                                {permission.tenQuyen}
                              </span>
                              {permission.moTa && (
                                <span className="permission-desc">
                                  {permission.moTa}
                                </span>
                              )}
                              <span className="permission-code">
                                {permission.maQuyen}
                              </span>
                            </div>
                            {isChecked && (
                              <div className="permission-check">✓</div>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="no-selection">
            <div className="no-selection-icon">👈</div>
            <h3>Chọn vai trò</h3>
            <p>Vui lòng chọn một vai trò từ bên trái để quản lý quyền</p>
          </div>
        )}
      </section>
    </div>
  );
}
