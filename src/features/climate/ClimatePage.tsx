import { useState, type ReactNode } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import type { ClimateRange } from '@/types';
import { useNow } from '@/hooks/useNow';
import { ApiError } from '@/services/apiClient';
import { ingestionService, type IngestionResult } from '@/services/ingestionService';
import { PageHeader } from '@/components/layout/PageHeader';
import { ThermalAlertCard } from '@/components/layout/ThermalAlertCard';
import { Can } from '@/components/auth/Can';
import { Button } from '@/components/ui';
import { useActiveAlert, useClimateAggregates, useClimateSeries, useDashboardSummary, useTodayReadings } from '@/features/dashboard/queries';
import { ClimateChartCard } from '@/features/dashboard/components/ClimateChartCard';
import { ClimateHistoryCard } from '@/features/dashboard/components/ClimateHistoryCard';
import { LiveIndicator } from '@/features/dashboard/components/LiveIndicator';
import { exportReadings } from '@/features/dashboard/exportReadings';
import { DailyClimateCard } from './components/DailyClimateCard';
import { HourlyHeatmapCard } from './components/HourlyHeatmapCard';
import { RangeFilter } from './components/RangeFilter';

function describeSync(r: IngestionResult): string {
  if (r.fetched === 0) return 'O canal do ThingSpeak ainda não tem leituras.';
  if (r.saved === 0) return `Tudo em dia: ${r.fetched} leituras conferidas, nenhuma nova.`;
  return `${r.saved} leitura(s) nova(s) importada(s) do ThingSpeak.`;
}

/** Sincronização manual (ADMIN). A ingestão automática do back já roda a cada ~20 s. */
function SyncButton() {
  const qc = useQueryClient();
  const [feedback, setFeedback] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);
  const sync = useMutation({
    mutationFn: () => ingestionService.syncNow(),
    onSuccess: (r) => {
      setFeedback({ tone: 'ok', text: describeSync(r) });
      qc.invalidateQueries({ queryKey: ['climate'] });
      qc.invalidateQueries({ queryKey: ['dashboard', 'summary'] });
      qc.invalidateQueries({ queryKey: ['alerts'] });
      qc.invalidateQueries({ queryKey: ['stations'] });
    },
    onError: (err) =>
      setFeedback({ tone: 'error', text: err instanceof ApiError ? err.message : 'Falha ao sincronizar com o ThingSpeak.' }),
  });

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <Button
        size="sm"
        leftIcon={<RefreshCw aria-hidden className="h-3.5 w-3.5" />}
        loading={sync.isPending}
        onClick={() => {
          setFeedback(null);
          sync.mutate();
        }}
      >
        Sincronizar agora
      </Button>
      {feedback && (
        <p role="status" className={feedback.tone === 'ok' ? 'text-xs text-ink-muted' : 'text-xs text-danger'}>
          {feedback.text}
        </p>
      )}
    </div>
  );
}

/** Janelas fixas dos gráficos de padrão (independentes do período da série) */
const DAILY_DAYS = 14;
const HEATMAP_DAYS = 7;

function SectionTitle({ id, title, description, action }: { id: string; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 id={id} className="text-lg font-semibold tracking-tight text-ink">
          {title}
        </h2>
        <p className="mt-0.5 text-[13px] text-ink-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function ClimatePage() {
  const now = useNow();
  const [range, setRange] = useState<ClimateRange>('24h');
  const summary = useDashboardSummary();
  const series = useClimateSeries(range);
  const daily = useClimateAggregates('day', DAILY_DAYS);
  const hourly = useClimateAggregates('hour', HEATMAP_DAYS);
  const today = useTodayReadings();
  const { data: alert } = useActiveAlert();

  return (
    <>
      <PageHeader
        eyebrow="Monitoramento"
        title="Clima"
        subtitle={<LiveIndicator lastReadingAt={summary.data?.lastReadingAt} now={now} />}
        action={
          <Can permission="sensors:write">
            <SyncButton />
          </Can>
        }
      />

      <div className="space-y-10">
        {alert && <ThermalAlertCard alert={alert} />}

        <section aria-labelledby="clima-serie">
          <SectionTitle
            id="clima-serie"
            title="Leituras da estação"
            description="Temperatura e umidade do ar ao longo do período escolhido."
            action={<RangeFilter value={range} onChange={setRange} />}
          />
          <ClimateChartCard
            range={range}
            now={now}
            readings={series.data}
            isLoading={series.isLoading}
            isRefreshing={series.isPlaceholderData}
            isError={series.isError}
            onRetry={() => series.refetch()}
          />
        </section>

        <section aria-labelledby="clima-padroes" className="space-y-6">
          <SectionTitle
            id="clima-padroes"
            title="Padrões e estresse térmico"
            description="Como o calor se distribui entre os dias e ao longo das horas — base para planejar irrigação e colheita."
          />
          <DailyClimateCard
            days={DAILY_DAYS}
            data={daily.data}
            isLoading={daily.isLoading}
            isRefreshing={daily.isPlaceholderData}
            isError={daily.isError}
            onRetry={() => daily.refetch()}
          />
          <HourlyHeatmapCard
            days={HEATMAP_DAYS}
            data={hourly.data}
            isLoading={hourly.isLoading}
            isRefreshing={hourly.isPlaceholderData}
            isError={hourly.isError}
            onRetry={() => hourly.refetch()}
          />
        </section>

        <ClimateHistoryCard
          readings={today.data}
          isLoading={today.isLoading}
          isError={today.isError}
          onRetry={() => today.refetch()}
          onExport={() => today.data && exportReadings(today.data)}
        />
      </div>
    </>
  );
}
