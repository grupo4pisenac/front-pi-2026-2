import { ShieldCheck, UserCheck, Users } from 'lucide-react';
import type { UsersStats } from '@/types';
import { formatInteger, formatPercent } from '@/lib/formatters';
import { Card, ErrorState, StatCard, StatCardSkeleton } from '@/components/ui';

interface UsersKpisProps {
  data: UsersStats | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

const GRID = 'grid grid-cols-1 gap-5 md:grid-cols-3';

export function UsersKpis({ data, isLoading, isError, onRetry }: UsersKpisProps) {
  if (isError) {
    return (
      <Card>
        <ErrorState onRetry={onRetry} />
      </Card>
    );
  }
  if (isLoading || !data) {
    return (
      <div className={GRID} role="status" aria-busy="true">
        <span className="sr-only">Carregando indicadores de usuários</span>
        {Array.from({ length: 3 }, (_, i) => (
          <StatCardSkeleton key={i} layout="inline" />
        ))}
      </div>
    );
  }
  const activePct = data.total ? (data.active / data.total) * 100 : 0;
  const added = data.addedThisMonth;
  return (
    <div className={GRID}>
      <StatCard
        layout="inline"
        icon={Users}
        label="Total de usuários"
        value={formatInteger(data.total)}
        helperClass={added > 0 ? 'text-brand' : 'text-ink-subtle'}
        helper={added === 0 ? 'Nenhum adicionado este mês' : `${formatInteger(added)} ${added === 1 ? 'adicionado' : 'adicionados'} este mês`}
      />
      <StatCard
        layout="inline"
        icon={UserCheck}
        label="Usuários ativos"
        value={formatInteger(data.active)}
        helper={`${formatPercent(activePct, 1)} do total`}
      />
      <StatCard
        layout="inline"
        icon={ShieldCheck}
        tone="accent"
        label="Administradores"
        value={formatInteger(data.admins)}
        helper="Acesso completo"
      />
    </div>
  );
}
