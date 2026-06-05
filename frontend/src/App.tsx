import { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RootLayout } from './components/RootLayout';
import { Toast } from './components/Toast';
import { EmptyState } from './components/ui';
import { publicRoutes, protectedRoutes } from './router';
import { useState } from 'react';

function AppRoutes() {
  const { user, loading } = useAuth();
  const [toast, setToast] = useState('');

  if (loading) {
    return <div className="loading-screen">Dang tai...</div>;
  }

  return (
    <>
      <Routes>
        {/* Public routes */}
        {publicRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}

        {/* Protected routes with layout */}
        <Route element={<RootLayout />}>
          {protectedRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                <ProtectedRoute>
                  <Suspense fallback={<div className="loading-screen">Dang tai...</div>}>
                    {route.element}
                  </Suspense>
                </ProtectedRoute>
              }
            />
          ))}
        </Route>

        {/* Catch-all redirect */}
        <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
        <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
      </Routes>
      <Toast message={toast} onClose={() => setToast('')} />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppRoutes />
      </DataProvider>
    </AuthProvider>
  );
}
