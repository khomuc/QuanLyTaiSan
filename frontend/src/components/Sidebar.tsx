import {
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ViewKey } from '../lib/types';

export interface SidebarNavItem {
  key: ViewKey;
  label: string;
  icon: LucideIcon;
}

interface SidebarProps {
  currentView: ViewKey;
  isCollapsed: boolean;
  isOpen: boolean;
  navItems: SidebarNavItem[];
  onClose: () => void;
  onNavigate: (view: ViewKey) => void;
  onToggleCollapsed: () => void;
}

export function Sidebar({
  currentView,
  isCollapsed,
  isOpen,
  navItems,
  onClose,
  onNavigate,
  onToggleCollapsed,
}: SidebarProps) {
  return (
    <>
      {isOpen && (
        <button
          aria-label="Đóng menu"
          className="sidebar-backdrop mobile-only"
          onClick={onClose}
          type="button"
        />
      )}
      <aside
        className={`sidebar ${isOpen ? 'is-open' : ''} ${
          isCollapsed ? 'is-collapsed' : ''
        }`}
      >
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
            onClick={onToggleCollapsed}
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
            onClick={onClose}
            title="Đóng menu"
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="nav-list" aria-label="Điều hướng chính">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                className={currentView === item.key ? 'nav-item active' : 'nav-item'}
                key={item.key}
                onClick={() => onNavigate(item.key)}
                title={item.label}
                type="button"
                aria-current={currentView === item.key ? 'page' : undefined}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
