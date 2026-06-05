import { Menu, RefreshCw, User, LogOut } from 'lucide-react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import React, { useMemo } from 'react';
import { Sidebar, type NavItem } from './Sidebar';
import type { AuthUser } from '../lib/types';
import { getVisibleNavItems } from '../lib/navigation';

interface AppLayoutProps {
  user: AuthUser | null;
  apiMode: 'api' | 'demo';
  loading: boolean;
  onLogout: () => void;
  onReload: () => void;
}

const routeToKeyMap: Record<string, string> = {
  '/dashboard': 'dashboard',
  '/assets': 'assets',
  '/employees': 'employees',
  '/roles': 'roles',
  '/approvals': 'approvals',
  '/notifications': 'notifications',
  '/settings': 'settings',
  '/audit': 'audit',
  '/profile': 'profile',
};

export function AppLayout({
  user,
  apiMode,
  loading,
  onLogout,
  onReload,
}: AppLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  const visibleNavItems = useMemo(
    () => (user ? getVisibleNavItems(user) : []),
    [user],
  );

  const currentView = routeToKeyMap[location.pathname] || 'dashboard';
  const currentViewLabel = visibleNavItems.find((item) => item.key === currentView)?.label || 'Dashboard';

  React.useEffect(() => {
    function closeSidebarWithEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setSidebarOpen(false);
      }
    }

    function handleResize() {
      if (window.innerWidth > 768 && sidebarOpen) {
        setSidebarOpen(false);
      }
    }

    window.addEventListener('keydown', closeSidebarWithEscape);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('keydown', closeSidebarWithEscape);
      window.removeEventListener('resize', handleResize);
    };
  }, [sidebarOpen]);

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
      <Sidebar
        isOpen={sidebarOpen}
        isCollapsed={sidebarCollapsed}
        navItems={visibleNavItems}
        currentView={currentView}
        user={user}
        onNavigate={handleNavigate}
        onToggleSidebar={setSidebarOpen}
        onToggleCollapse={setSidebarCollapsed}
      />

      <div className="workspace">
        <header className="topbar">
          <button
            aria-expanded={sidebarOpen}
            aria-label={sidebarOpen ? 'Dong menu' : 'Mo menu'}
            className="icon-button mobile-only"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? 'Dong menu' : 'Mo menu'}
            type="button"
          >
            <Menu size={20} />
          </button>
          <div>
            <p className="eyebrow">Phan he System Lead</p>
            <h1>{currentViewLabel}</h1>
          </div>
          <div className="topbar-actions">
            <span className={`mode-pill ${apiMode}`}>
              {apiMode.toUpperCase()}
            </span>
            <button
              className="icon-button"
              onClick={onReload}
              title="Tai lai"
              type="button"
            >
              <RefreshCw size={18} />
            </button>
            <button
              className="profile-button"
              onClick={() => handleNavigate('profile')}
              type="button"
            >
              <span>{user?.hoTen}</span>
              <User size={18} />
            </button>
            <button
              className="icon-button danger"
              onClick={onLogout}
              title="Dang xuat"
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

        <footer className="footer">
          <span>Quan ly tai san QR</span>
          <span>Nguyen Thi Huynh Nhu - B2204960</span>
        </footer>
      </div>
    </div>
  );
}
