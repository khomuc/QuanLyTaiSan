import React from 'react';
import {
  Menu,
  RefreshCw,
  User,
  LogOut,
} from 'lucide-react';
import {
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { Sidebar, type NavItem } from './Sidebar';
import type { AuthUser } from '../lib/types';

interface AppLayoutProps {
  navItems: NavItem[];
  user: AuthUser;
  apiMode: 'api' | 'demo';
  loading: boolean;
  onLogout: () => void;
  onReload: () => void;
}

function getCurrentView(pathname: string) {
  const firstPath = pathname.split('/')[1];

  return firstPath || 'dashboard';
}

function getPageTitle(
  navItems: NavItem[],
  currentView: string,
  pathname: string,
) {
  if (pathname.includes('/scanner')) {
    return 'Quét kiểm kê tài sản';
  }

  if (pathname.includes('/profile')) {
    return 'Thông tin cá nhân';
  }

  return (
    navItems.find((item) => item.key === currentView)?.label ||
    'Dashboard'
  );
}

export function AppLayout({
  navItems,
  user,
  apiMode,
  loading,
  onLogout,
  onReload,
}: AppLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });

  const currentView = React.useMemo(() => {
    return getCurrentView(location.pathname);
  }, [location.pathname]);

  const pageTitle = React.useMemo(() => {
    return getPageTitle(navItems, currentView, location.pathname);
  }, [navItems, currentView, location.pathname]);

  const shellClassName = React.useMemo(() => {
    return [
      'app-shell',
      sidebarCollapsed ? 'sidebar-collapsed' : '',
      sidebarOpen ? 'sidebar-open-mobile' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }, [sidebarCollapsed, sidebarOpen]);

  const handleToggleMobileSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleToggleCollapse = (value: boolean) => {
    setSidebarCollapsed(value);
    localStorage.setItem('sidebar-collapsed', String(value));
  };

  const handleNavigate = (view: string) => {
    navigate(`/${view}`);
    setSidebarOpen(false);
  };

  const handleGoToProfile = () => {
    navigate('/profile');
    setSidebarOpen(false);
  };

  React.useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

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

  return (
    <div className={shellClassName}>
      {sidebarOpen && (
        <button
          className="sidebar-backdrop mobile-only"
          aria-label="Đóng menu"
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
            onClick={handleToggleMobileSidebar}
            title={sidebarOpen ? 'Đóng menu' : 'Mở menu'}
            type="button"
          >
            <Menu size={20} />
          </button>

          <div className="topbar-title">
            <p className="eyebrow">Phân hệ System Lead</p>
            <h1>{pageTitle}</h1>
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
              onClick={handleGoToProfile}
              type="button"
              title="Thông tin cá nhân"
            >
              <span>{user.hoTen}</span>
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

        <footer className="footer">
          <span>Quản lý tài sản QR</span>
          <span>Nguyen Thi Huynh Nhu - B2204960</span>
        </footer>
      </div>
    </div>
  );
}
