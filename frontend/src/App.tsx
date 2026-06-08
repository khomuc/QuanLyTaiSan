import { Suspense, lazy, useMemo } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LoginScreen from './pages/LoginScreen';
import { AppLayout } from './components/AppLayout';
import { getVisibleNavItems } from './lib/navigation';
import InventoryPage from './pages/inventory/InventoryPage';
import AssetDetailPage from './pages/AssetDetailPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import InventoryReportPage from './pages/inventory/InventoryReportPage';

const ScannerPage = lazy(() => import('./pages/inventory/ScannerPage'));

function ProtectedLayout() {
  const { user, apiMode, loading, logout, reloadProfile } = useAuth();

  const navItems = useMemo(() => {
    if (!user) return [];
    return getVisibleNavItems(user);
  }, [user]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppLayout
      apiMode={apiMode}
      loading={loading}
      navItems={navItems}
      user={user}
      onLogout={logout}
      onReload={reloadProfile}
    />
  );
}

function AppRoutes() {
  const { user, loading, initialized, loginSuccess } = useAuth();

  if (!initialized || loading) {
    return <div>Dang tai...</div>;
  }

  if (!user) {
    return (
      <Suspense fallback={<div>Dang tai...</div>}>
        <LoginScreen onSuccess={loginSuccess} />
      </Suspense>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProtectedLayout />}>
          <Route index element={<Navigate to="/inventory" />} />

          <Route path="inventory/:maKiemKe/scanner" element={<ScannerPage />} />

          <Route path="inventory" element={<InventoryPage />} />

          <Route path="assets/:maTaiSan" element={<AssetDetailPage />} />

          <Route path="/inventory/:maKiemKe/report" element={<InventoryReportPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
