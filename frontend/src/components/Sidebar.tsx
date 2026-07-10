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
          aria-label="Dong menu"
          className="sidebar-backdrop"
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
              <strong>Quan Ly Tai San</strong>
              <span>System Lead</span>
            </div>
          </div>
          <button
            aria-label={isCollapsed ? 'Mo rong sidebar' : 'Thu gon sidebar'}
            aria-pressed={isCollapsed}
            className="icon-button sidebar-toggle desktop-only"
            onClick={onToggleCollapsed}
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
            onClick={onClose}
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
                className={currentView === item.key ? 'nav-item active' : 'nav-item'}
                key={item.key}
                onClick={() => onNavigate(item.key)}
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
