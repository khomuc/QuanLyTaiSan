import { Menu, RefreshCw, User, LogOut } from 'lucide-react';
import type { ReactNode } from 'react';
import React from 'react';
import { Sidebar, type NavItem } from './Sidebar';
import type { AuthUser } from '../lib/types';

interface AppLayoutProps {
  children: ReactNode;
  navItems: NavItem[];
  currentView: string;
  user: AuthUser;
  apiMode: 'api' | 'demo';
  loading: boolean;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  onReload: () => void;
}

export function AppLayout({
  children,
  navItems,
  currentView,
  user,
  apiMode,
  loading,
  onNavigate,
  onLogout,
  onReload,
}: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  React.useEffect(() => {
    function closeSidebarWithEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setSidebarOpen(false);
      }
    }

    // Close sidebar on window resize (desktop view)
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

  return (
    <div className={`app-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${sidebarOpen ? 'sidebar-open-mobile' : ''}`}>
      <Sidebar
        isOpen={sidebarOpen}
        isCollapsed={sidebarCollapsed}
        navItems={navItems}
        currentView={currentView}
        user={user}
        onNavigate={onNavigate}
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
            <h1>{navItems.find((item) => item.key === currentView)?.label}</h1>
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
              onClick={() => onNavigate('profile')}
              type="button"
            >
              <span>{user.hoTen}</span>
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
          {children}
        </main>

        <footer className="footer">
          <span>Quan ly tai san QR</span>
          <span>Nguyen Thi Huynh Nhu - B2204960</span>
        </footer>
      </div>
    </div>
  );
}
