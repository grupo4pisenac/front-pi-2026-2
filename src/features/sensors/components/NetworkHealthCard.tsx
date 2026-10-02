import { useId } from 'react';
import { RefreshCw } from 'lucide-react';
import type { NetworkHealth } from '@/types';
import { cn } from '@/lib/cn';
import { formatInteger, formatPercent, formatRelative } from '@/lib/formatters';
import { Card, CardBody, CardHeader, ErrorState, Skeleton } from '@/components/ui';

interface NetworkHealthCardProps {
  data: NetworkHealth | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  now: number;
}

function Ring({ pct, toneClass }: { pct: number; toneClass: string }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 128 128" className="h-32 w-32 -rotate-90" aria-hidden>
      <circle cx="64" cy="64" r={r} fill="none" strokeWidth="10" className="stroke-neutral-soft" />
      <circle
        cx="64"
        cy="64"
        r={r}
        fill="none"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct / 100)}
        className={cn('transition-[stroke-dashoffset] duration-700 ease-out', toneClass)}
      />
    </svg>
  );
}

function healthCopy(pct: number) {
  if (pct >= 80) return { title: 'Rede estável', stroke: 'stroke-brand' };
  if (pct >= 50) return { title: 'Rede instável', stroke: 'stroke-accent-vivid' };
  return { title: 'Rede crítica', stroke: 'stroke-danger' };
}

export function NetworkHealthCard({ data, isLoading, isError, onRetry, now }: NetworkHealthCardProps) {
  const titleId = useId();

  return (
    <Card aria-labelledby={titleId} className="flex h-full flex-col">
      <CardHeader titleId={titleId} title="Saúde da rede" subtitle="Disponibilidade das estações IoT" />
      <CardBody className="flex flex-1 flex-col">
        {isError ? (
          <ErrorState onRetry={onRetry} />
        ) : isLoading || !data ? (
          <div role="status" aria-busy="true" className="flex flex-col items-center gap-5 py-2">
            <span className="sr-only">Carregando saúde da rede</span>
            <Skeleton className="h-32 w-32 rounded-full" />
            <Skeleton className="h-4 w-40" />
            <div className="w-full space-y-3">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ) : (
          (() => {
            const pct = data.total ? (data.online / data.total) * 100 : 0;
            const copy = healthCopy(pct);
            const rows = [
              { label: 'Ativos', value: data.active, dot: 'bg-brand' },
              { label: 'Atenção', value: data.attention, dot: 'bg-accent-vivid' },
              { label: 'Inativos', value: data.inactive, dot: 'bg-neutral' },
            ];
            return (
              <>
                <div className="flex flex-col items-center text-center">
                  <div className="relative" role="img" aria-label={`${formatPercent(pct)} das estações online`}>
                    <Ring pct={pct} toneClass={copy.stroke} />
                    <span className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-semibold tabular-nums text-ink">{formatPercent(pct)}</span>
                      <span className="text-[11px] font-medium text-ink-subtle">online</span>
                    </span>
                  </div>
                  <p className="mt-4 text-sm font-semibold text-ink">{copy.title}</p>
                  <p className="mt-0.5 text-[13px] text-ink-muted">
                    {formatInteger(data.online)} de {formatInteger(data.total)} estações online
                  </p>
                </div>

                <dl className="mt-6 divide-y divide-border border-y border-border">
                  {rows.map((r) => (
                    <div key={r.label} className="flex items-center justify-between py-3">
                      <dt className="flex items-center gap-2.5 text-[13px] text-ink-muted">
                        <span aria-hidden className={cn('h-2 w-2 rounded-full', r.dot)} />
                        {r.label}
                      </dt>
                      <dd className="text-[13px] font-semibold tabular-nums text-ink">{formatInteger(r.value)}</dd>
                    </div>
                  ))}
                </dl>

                <p className="mt-auto flex items-center gap-2 pt-5 text-xs text-ink-subtle">
                  <RefreshCw aria-hidden className="h-3.5 w-3.5" />
                  Última sincronização: {formatRelative(data.lastSyncAt, now).toLowerCase()}
                </p>
              </>
            );
          })()
        )}
      </CardBody>
    </Card>
  );
}
