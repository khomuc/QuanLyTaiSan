import { Menu, X, PanelLeftOpen, PanelLeftClose } from 'lucide-react';
import type { AuthUser } from '../lib/types';

export interface NavItem {
  key: string;
  label: string;
  icon: any;
}

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  navItems: NavItem[];
  currentView: string;
  user: AuthUser;
  onNavigate: (view: string) => void;
  onToggleSidebar: (open: boolean) => void;
  onToggleCollapse: (collapsed: boolean) => void;
}

export function Sidebar({
  isOpen,
  isCollapsed,
  navItems,
  currentView,
  user,
  onNavigate,
  onToggleSidebar,
  onToggleCollapse,
}: SidebarProps) {
  return (
    <>
      {isOpen && (
        <button
          aria-label="Dong menu"
          className="sidebar-backdrop"
          onClick={() => onToggleSidebar(false)}
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
              <strong>Quan Ly Tai San</strong>
              <span>System Lead</span>
            </div>
          </div>
          <button
            aria-label={
              isCollapsed ? 'Mo rong sidebar' : 'Thu gon sidebar'
            }
            aria-pressed={isCollapsed}
            className="icon-button sidebar-toggle desktop-only"
            onClick={() => onToggleCollapse(!isCollapsed)}
            title={isCollapsed ? 'Mo rong sidebar' : 'Thu gon sidebar'}
            type="button"
          >
            {isCollapsed ? (
              <PanelLeftOpen size={18} />
            ) : (
              <PanelLeftClose size={18} />
            )}
          </button>
          <button
            aria-label="Dong menu"
            className="icon-button sidebar-toggle mobile-sidebar-close"
            onClick={() => onToggleSidebar(false)}
            title="Dong menu"
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                className={
                  currentView === item.key ? 'nav-item active' : 'nav-item'
                }
                key={item.key}
                onClick={() => {
                  onNavigate(item.key);
                  onToggleSidebar(false);
                }}
                title={item.label}
                type="button"
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
