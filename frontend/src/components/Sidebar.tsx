import {
  X,
  PanelLeftOpen,
  PanelLeftClose,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  key: string;
  label: string;
  icon: LucideIcon;
}

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  navItems: NavItem[];
  currentView: string;
  onNavigate: (view: string) => void;
  onToggleSidebar: (open: boolean) => void;
  onToggleCollapse: (collapsed: boolean) => void;
}

export function Sidebar({
  isOpen,
  isCollapsed,
  navItems,
  currentView,
  onNavigate,
  onToggleSidebar,
  onToggleCollapse,
}: SidebarProps) {
  const sidebarClassName = [
    'sidebar',
    isOpen ? 'is-open' : '',
    isCollapsed ? 'is-collapsed' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const handleNavigate = (view: string) => {
    onNavigate(view);
    onToggleSidebar(false);
  };

  return (
    <aside className={sidebarClassName}>
      <div className="sidebar-head">
        <div className="brand">
          <div className="brand-mark">QL</div>

          <div className="brand-copy">
            <strong>Quản Lý Tài Sản</strong>
            <span>System Lead</span>
          </div>
        </div>

        <button
          aria-label={isCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
          aria-pressed={isCollapsed}
          className="icon-button sidebar-toggle desktop-only"
          onClick={() => onToggleCollapse(!isCollapsed)}
          title={isCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
          type="button"
        >
          {isCollapsed ? (
            <PanelLeftOpen size={18} />
          ) : (
            <PanelLeftClose size={18} />
          )}
        </button>

        <button
          aria-label="Đóng menu"
          className="icon-button sidebar-toggle mobile-sidebar-close"
          onClick={() => onToggleSidebar(false)}
          title="Đóng menu"
          type="button"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="nav-list" aria-label="Điều hướng chính">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.key;

          return (
            <button
              key={item.key}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => handleNavigate(item.key)}
              title={item.label}
              type="button"
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
