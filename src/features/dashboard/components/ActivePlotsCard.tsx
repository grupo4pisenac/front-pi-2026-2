import { useId } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sprout } from 'lucide-react';
import type { Plot } from '@/types';
import { CROPS } from '@/lib/crops';
import { formatInteger, formatPercent } from '@/lib/formatters';
import { Card, CardBody, CardHeader, EmptyState, ErrorState, IconTile, ProgressBar, Skeleton } from '@/components/ui';

interface ActivePlotsCardProps {
  plots: Plot[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

function PlotRow({ plot }: { plot: Plot }) {
  const crop = CROPS[plot.cropId];
  return (
    <li className="-mx-2 rounded-tile px-2 py-3 transition-colors duration-150 ease-out hover:bg-canvas/70">
      <div className="flex items-center gap-3.5">
        <IconTile icon={crop.icon} size="sm" className={`${crop.softClass} ${crop.textClass}`} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-ink">{plot.name}</p>
          <p className="text-xs text-ink-subtle">
            {plot.code} · {formatInteger(plot.daysToHarvest)} dias para colheita
          </p>
        </div>
        <span className="text-[13px] font-semibold tabular-nums text-ink">{formatPercent(plot.progress)}</span>
      </div>
      <ProgressBar
        value={plot.progress}
        barClass={crop.bgClass}
        label={`${plot.name}: ${formatPercent(plot.progress)} do ciclo`}
        className="mt-2.5"
      />
    </li>
  );
}

export function ActivePlotsCard({ plots, isLoading, isError, onRetry }: ActivePlotsCardProps) {
  const titleId = useId();
  return (
    <Card aria-labelledby={titleId} className="flex flex-col">
      <CardHeader
        titleId={titleId}
        title="Talhões ativos"
        subtitle="Avanço do ciclo até a colheita"
        action={
          <Link to="/previsao" className="group inline-flex items-center gap-1 rounded-md text-[13px] font-semibold text-brand">
            Ver todos
            <ArrowRight aria-hidden className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
          </Link>
        }
      />
      <CardBody className="flex-1 pt-3">
        {isError ? (
          <ErrorState onRetry={onRetry} />
        ) : isLoading || !plots ? (
          <div role="status" aria-busy="true" className="space-y-5 pt-2">
            <span className="sr-only">Carregando talhões</span>
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="space-y-2.5">
                <div className="flex items-center gap-3.5">
                  <Skeleton className="h-9 w-9 rounded-tile" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-2.5 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-1.5 w-full rounded-full" />
              </div>
            ))}
          </div>
        ) : plots.length === 0 ? (
          <EmptyState icon={Sprout} title="Nenhum talhão ativo" description="Cadastre talhões para acompanhar o ciclo até a colheita." />
        ) : (
          <ul>
            {plots.map((p) => (
              <PlotRow key={p.id} plot={p} />
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
