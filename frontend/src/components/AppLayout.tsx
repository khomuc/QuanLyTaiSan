import { Menu, RefreshCw, User, LogOut } from 'lucide-react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import React from 'react';
import { Sidebar, type NavItem } from './Sidebar';
import type { AuthUser } from '../lib/types';

interface AppLayoutProps {
  user: AuthUser | null;
  apiMode: 'api' | 'demo';
  loading: boolean;
  navItems: NavItem[];
  onLogout: () => void;
  onReload: () => void;
}

const routeToKeyMap: Record<string, string> = {
  '/dashboard': 'dashboard',
  '/assets': 'assets',
  '/transfer': 'transfer',
  '/employees': 'employees',
  '/staff-management': 'staff-management',
  '/roles': 'roles',
  '/approvals': 'approvals',
  '/notifications': 'notifications',
  '/settings': 'settings',
  '/audit': 'audit',
  '/profile': 'profile',
  '/reports': 'reports',
};



export function AppLayout({
  user,
  apiMode,
  loading,
  navItems,
  onLogout,
  onReload,
}: AppLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });

  const currentView = routeToKeyMap[location.pathname] || 'dashboard';
  const currentViewLabel = navItems.find((item) => item.key === currentView)?.label || 'Dashboard';

  React.useEffect(() => {
    function closeSidebarWithEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setSidebarOpen(false);
      }
    }

    function closeSidebarOnDesktop() {
      if (window.innerWidth > 768) {
        setSidebarOpen(false);
      }
    }

    window.addEventListener('keydown', closeSidebarWithEscape);
    window.addEventListener('resize', closeSidebarOnDesktop);
    return () => {
      window.removeEventListener('keydown', closeSidebarWithEscape);
      window.removeEventListener('resize', closeSidebarOnDesktop);
    };
  }, []);

  React.useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add('no-scroll-mobile');
    } else {
      document.body.classList.remove('no-scroll-mobile');
    }

    return () => {
      document.body.classList.remove('no-scroll-mobile');
    };
  }, [sidebarOpen]);

  const handleToggleCollapse = (value: boolean) => {
    setSidebarCollapsed(value);
    localStorage.setItem('sidebar-collapsed', String(value));
  };

  const handleNavigate = (path: string) => {
    navigate(`/${path}`);
    setSidebarOpen(false);
  };

  return (
    <div
      className={`app-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${
        sidebarOpen ? 'sidebar-open-mobile' : ''
      }`}
    >
      {sidebarOpen && (
        <button
          aria-label="Đóng menu"
          className="sidebar-backdrop mobile-only"
          onClick={() => setSidebarOpen(false)}
          type="button"
        />
      )}

      <Sidebar
        isOpen={sidebarOpen}
        isCollapsed={sidebarCollapsed}
        navItems={navItems}
        currentView={currentView}
        onNavigate={handleNavigate}
        onToggleSidebar={setSidebarOpen}
        onToggleCollapse={handleToggleCollapse}
      />

      <div className="workspace">
        <header className="topbar">
          <button
            aria-expanded={sidebarOpen}
            aria-label={sidebarOpen ? 'Đóng menu' : 'Mở menu'}
            className="icon-button mobile-only"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? 'Đóng menu' : 'Mở menu'}
            type="button"
          >
            <Menu size={20} />
          </button>
          <div>
            <p className="eyebrow">Phân hệ System Lead</p>
            <h1>{currentViewLabel}</h1>
          </div>
          <div className="topbar-actions">
            <span className={`mode-pill ${apiMode}`}>
              {apiMode.toUpperCase()}
            </span>
            <button
              className={`icon-button ${loading ? 'is-loading' : ''}`}
              onClick={onReload}
              title="Tải lại"
              type="button"
              disabled={loading}
            >
              <RefreshCw size={18} />
            </button>
            <button
              className="profile-button"
              onClick={() => handleNavigate('profile')}
              type="button"
              title="Thông tin cá nhân"
            >
              <span>{user?.hoTen}</span>
              <User size={18} />
            </button>
            <button
              className="icon-button danger"
              onClick={onLogout}
              title="Đăng xuất"
              type="button"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <main className="content">
          {loading && <div className="loading-bar" />}
          <Outlet />
        </main>

      </div>
    </div>
  );
}
