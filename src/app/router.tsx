import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { UserRound } from 'lucide-react';
import type { Permission } from '@/types';
import { AppShell } from '@/components/layout/AppShell';
import { NAV_ITEMS } from '@/components/layout/navigation';
import { RequirePermission } from '@/components/auth/RequirePermission';
import { PlaceholderPage } from '@/pages/PlaceholderPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { Skeleton } from '@/components/ui';

// Code-splitting por rota: Recharts só é baixado quando o Painel abre
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const SensorsPage = lazy(() => import('@/features/sensors/SensorsPage').then((m) => ({ default: m.SensorsPage })));
const UsersPage = lazy(() => import('@/features/users/UsersPage').then((m) => ({ default: m.UsersPage })));

const guard = (permission: Permission, element: ReactNode) => (
  <RequirePermission permission={permission}>
    <Suspense fallback={<Skeleton className="h-10 w-72" />}>{element}</Suspense>
  </RequirePermission>
);

const PLACEHOLDER_COPY: Record<string, { eyebrow: string; description: string }> = {
  '/previsao': { eyebrow: 'Safra', description: 'Projeções detalhadas por talhão, com cenários climáticos e janelas ideais de colheita para exportação.' },
  '/clima': { eyebrow: 'Monitoramento', description: 'Séries históricas, alertas meteorológicos e comparativos entre estações do Vale.' },
  '/irrigacao': { eyebrow: 'Manejo', description: 'Recomendações de lâmina e turnos de rega com base na evapotranspiração e na umidade do solo.' },
  '/relatorios': { eyebrow: 'Exportação', description: 'Relatórios prontos para certificadoras e importadores, em PDF e planilha.' },
  '/analises': { eyebrow: 'Inteligência', description: 'Cruzamentos entre clima, fenologia e produtividade para apoiar decisões de safra.' },
};

const placeholderRoutes = NAV_ITEMS.filter((i) => i.to in PLACEHOLDER_COPY).map((i) => {
  const copy = PLACEHOLDER_COPY[i.to]!;
  return {
    path: i.to.slice(1),
    element: guard(i.permission, <PlaceholderPage eyebrow={copy.eyebrow} title={i.label} description={copy.description} icon={i.icon} />),
  };
});

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: guard('dashboard:read', <DashboardPage />) },
      { path: 'mapeamento', element: guard('sensors:read', <SensorsPage />) },
      { path: 'usuarios', element: guard('users:read', <UsersPage />) },
      ...placeholderRoutes,
      {
        path: 'perfil',
        element: <PlaceholderPage eyebrow="Conta" title="Meu perfil" icon={UserRound} description="Preferências de notificação, idioma e segurança da conta." />,
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
