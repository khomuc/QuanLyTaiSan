import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AppContent } from './components/AppContent';
import { useAuth } from './contexts/AuthContext';

const LoginScreen = lazy(() => import('./pages/LoginScreen'));

const fallback = <div className="loading-screen">Dang tai...</div>;

function AppRoutes() {
  const { user, loading, initialized, loginSuccess } = useAuth();

  if (!initialized || loading) {
    return fallback;
  }

  if (!user) {
    return (
      <Suspense fallback={fallback}>
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
