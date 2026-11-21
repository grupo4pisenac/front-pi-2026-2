import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import type { Permission } from '@/types';
import { AppShell } from '@/components/layout/AppShell';
import { RequirePermission } from '@/components/auth/RequirePermission';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { LoginPage } from '@/pages/LoginPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { Skeleton } from '@/components/ui';

// Code-splitting por rota
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const ClimatePage = lazy(() => import('@/features/climate/ClimatePage').then((m) => ({ default: m.ClimatePage })));
const IrrigationPage = lazy(() => import('@/features/irrigation/IrrigationPage').then((m) => ({ default: m.IrrigationPage })));
const ForecastPage = lazy(() => import('@/features/forecast/ForecastPage').then((m) => ({ default: m.ForecastPage })));
const SensorsPage = lazy(() => import('@/features/sensors/SensorsPage').then((m) => ({ default: m.SensorsPage })));
const UsersPage = lazy(() => import('@/features/users/UsersPage').then((m) => ({ default: m.UsersPage })));
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));

const guard = (permission: Permission, element: ReactNode) => (
  <RequirePermission permission={permission}>
    <Suspense fallback={<Skeleton className="h-10 w-72" />}>{element}</Suspense>
  </RequirePermission>
);

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/esqueci-senha', element: <ForgotPasswordPage /> },
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: guard('dashboard:read', <DashboardPage />) },
      { path: 'clima', element: guard('climate:read', <ClimatePage />) },
      { path: 'irrigacao', element: guard('irrigation:read', <IrrigationPage />) },
      { path: 'previsao', element: guard('forecast:read', <ForecastPage />) },
      { path: 'mapeamento', element: guard('sensors:read', <SensorsPage />) },
      { path: 'usuarios', element: guard('users:read', <UsersPage />) },
      {
        path: 'perfil',
        element: (
          <Suspense fallback={<Skeleton className="h-10 w-72" />}>
            <ProfilePage />
          </Suspense>
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
