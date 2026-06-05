import { Menu, RefreshCw, User, LogOut } from 'lucide-react';
import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { getVisibleNavItems } from '../lib/navigation';
import type { ViewKey } from '../lib/types';

export function RootLayout() {
  const { user, apiMode, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
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

  if (!user) {
    return <Outlet />;
  }

  const visibleNavItems = getVisibleNavItems(user);
  const currentPath = location.pathname.substring(1) || 'dashboard';

  const handleNavigate = (path: string) => {
    navigate(`/${path}`);
    setSidebarOpen(false);
  };

  const handleProfile = () => {
    navigate('/profile');
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentNavItem = visibleNavItems.find(
    (item) => item.key === currentPath,
  );
  const pageTitle = currentNavItem?.label || 'Dashboard';

  return (
    <div
      className={`app-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${sidebarOpen ? 'sidebar-open-mobile' : ''}`}
    >
      <Sidebar
        isOpen={sidebarOpen}
        isCollapsed={sidebarCollapsed}
        navItems={visibleNavItems}
        currentView={currentPath}
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
            <h1>{pageTitle}</h1>
          </div>
          <div className="topbar-actions">
            <span className={`mode-pill ${apiMode}`}>
              {apiMode.toUpperCase()}
            </span>
            <button
              className="icon-button"
              onClick={() => window.location.reload()}
              title="Tai lai"
              type="button"
            >
              <RefreshCw size={18} />
            </button>
            <button
              className="profile-button"
              onClick={handleProfile}
              type="button"
            >
              <span>{user.hoTen}</span>
              <User size={18} />
            </button>
            <button
              className="icon-button danger"
              onClick={handleLogout}
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
