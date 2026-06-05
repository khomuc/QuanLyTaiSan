import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import type { AuthUser } from './lib/types';

const LoginScreen = lazy(() => import('./pages/LoginScreen'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const AssetsPage = lazy(() => import('./pages/AssetsPage'));
const EmployeesPage = lazy(() => import('./pages/EmployeesPage'));
const RolesPage = lazy(() => import('./pages/RolesPage'));
const ApprovalsPage = lazy(() => import('./pages/ApprovalsPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const AuditPage = lazy(() => import('./pages/AuditPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

export const publicRoutes: RouteObject[] = [
  {
    path: '/login',
    element: <LoginScreen />,
  },
];

export const protectedRoutes: RouteObject[] = [
  {
    path: '/dashboard',
    element: <DashboardPage />,
  },
  {
    path: '/assets',
    element: <AssetsPage />,
  },
  {
    path: '/employees',
    element: <EmployeesPage />,
  },
  {
    path: '/roles',
    element: <RolesPage />,
  },
  {
    path: '/approvals',
    element: <ApprovalsPage />,
  },
  {
    path: '/notifications',
    element: <NotificationsPage />,
  },
  {
    path: '/settings',
    element: <SettingsPage />,
  },
  {
    path: '/audit',
    element: <AuditPage />,
  },
  {
    path: '/profile',
    element: <ProfilePage />,
  },
];
