import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { AppContent } from './components/AppContent';

const LoginScreen = lazy(() => import('./pages/LoginScreen'));

const FALLBACK = <div className="loading-screen">Đang tải...</div>;

function AppRoutes() {
  const { user, loading, initialized, loginSuccess } = useAuth();

  if (!initialized || loading) {
    return <div className="loading-screen">Đang tải...</div>;
  }

  if (!user) {
    return (
      <Suspense fallback={FALLBACK}>
        <LoginScreen onSuccess={loginSuccess} />
      </Suspense>
    );
  }

  return <AppContent />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/*" element={<AppRoutes />} />
    </Routes>
  );
}
