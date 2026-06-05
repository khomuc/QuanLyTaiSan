import { lazy, ReactNode } from 'react';
import { Navigate, RouteObject } from 'react-router-dom';
import type { AuthUser } from '../lib/types';
import { canAccessView } from '../lib/navigation';

const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const AssetsPage = lazy(() => import('../pages/AssetsPage'));
const EmployeesPage = lazy(() => import('../pages/EmployeesPage'));
const RolesPage = lazy(() => import('../pages/RolesPage'));
const ApprovalsPage = lazy(() => import('../pages/ApprovalsPage'));
const NotificationsPage = lazy(() => import('../pages/NotificationsPage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));
const AuditPage = lazy(() => import('../pages/AuditPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const LoginScreen = lazy(() => import('../pages/LoginScreen'));

interface ProtectedRouteProps {
  children: ReactNode;
  user: AuthUser | null;
  requiredView: string;
}

export function ProtectedRoute({ children, user, requiredView }: ProtectedRouteProps) {
  if (!user || !canAccessView(user, requiredView as any)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

export function createAppRoutes(user: AuthUser | null): RouteObject[] {
  return [
    {
      path: '/',
      children: [
        {
          index: true,
          element: <Navigate to="/dashboard" replace />,
        },
        {
          path: 'dashboard',
          element: (
            <ProtectedRoute user={user} requiredView="dashboard">
              <DashboardPage />
            </ProtectedRoute>
          ),
        },
        {
          path: 'assets',
          element: (
            <ProtectedRoute user={user} requiredView="assets">
              <AssetsPage />
            </ProtectedRoute>
          ),
        },
        {
          path: 'employees',
          element: (
            <ProtectedRoute user={user} requiredView="employees">
              <EmployeesPage />
            </ProtectedRoute>
          ),
        },
        {
          path: 'roles',
          element: (
            <ProtectedRoute user={user} requiredView="roles">
              <RolesPage />
            </ProtectedRoute>
          ),
        },
        {
          path: 'approvals',
          element: (
            <ProtectedRoute user={user} requiredView="approvals">
              <ApprovalsPage />
            </ProtectedRoute>
          ),
        },
        {
          path: 'notifications',
          element: (
            <ProtectedRoute user={user} requiredView="notifications">
              <NotificationsPage />
            </ProtectedRoute>
          ),
        },
        {
          path: 'settings',
          element: (
            <ProtectedRoute user={user} requiredView="settings">
              <SettingsPage />
            </ProtectedRoute>
          ),
        },
        {
          path: 'audit',
          element: (
            <ProtectedRoute user={user} requiredView="audit">
              <AuditPage />
            </ProtectedRoute>
          ),
        },
        {
          path: 'profile',
          element: (
            <ProtectedRoute user={user} requiredView="profile">
              <ProfilePage />
            </ProtectedRoute>
          ),
        },
      ],
    },
    {
      path: '/login',
      element: <LoginScreen />,
    },
    {
      path: '*',
      element: <Navigate to="/dashboard" replace />,
    },
  ];
}
