import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import type { Permission } from '@/types';
import { useSession } from '@/app/session';
import { usePermission } from '@/hooks/usePermission';
import { Card, EmptyState, Skeleton } from '@/components/ui';

export function RequirePermission({ permission, children }: { permission: Permission; children: ReactNode }) {
  const { isLoading } = useSession();
  const allowed = usePermission(permission);

  if (isLoading) return <Skeleton className="h-10 w-72" />;
  if (!allowed) {
    return (
      <Card>
        <EmptyState
          size="lg"
          icon={Lock}
          title="Acesso restrito"
          description="Seu perfil não tem permissão para esta área. Fale com um administrador se precisar de acesso."
          action={
            <Link
              to="/"
              className="inline-flex h-9 items-center rounded-tile border border-border bg-surface px-3.5 text-[13px] font-semibold text-ink transition-colors duration-150 hover:bg-canvas"
            >
              Voltar ao painel
            </Link>
          }
        />
      </Card>
    );
  }
  return <>{children}</>;
}
