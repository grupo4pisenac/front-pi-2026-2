import { useMemo, useState } from 'react';
import { CloudFog, Droplets, Gauge, Info, Thermometer } from 'lucide-react';
import type { ClimateRange } from '@/types';
import { useNow } from '@/hooks/useNow';
import { BAND_TEXT_CLASS, vpdLevel } from '@/lib/agronomy';
import { formatCelsius, formatDecimal, formatKpa, formatPercent, formatTime } from '@/lib/formatters';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, ErrorState, StatCard, StatCardSkeleton } from '@/components/ui';
import { useClimateAggregates, useClimateSeries, useDashboardSummary } from '@/features/dashboard/queries';
import { LiveIndicator } from '@/features/dashboard/components/LiveIndicator';
import { RangeFilter } from '@/features/climate/components/RangeFilter';
import { VpdChartCard } from './components/VpdChartCard';
import { IrrigationWindowCard } from './components/IrrigationWindowCard';
import { toVpdSeries, type VpdPoint } from './vpd';

const PROFILE_DAYS = 7;
const RANGES: ClimateRange[] = ['today', '24h', '7d'];

/** Margem (°C) entre a temperatura e o ponto de orvalho abaixo da qual há orvalho/molhamento foliar */
const DEW_MARGIN_C = 2;

function NowKpis({ latest, isLoading, isError, onRetry }: { latest: VpdPoint | undefined; isLoading: boolean; isError: boolean; onRetry: () => void }) {
  const grid = 'grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4';
  if (isError) {
    return (
      <Card>
        <ErrorState message="Não foi possível carregar as leituras atuais." onRetry={onRetry} />
      </Card>
    );
  }
  if (isLoading) {
    return (
      <div className={grid} role="status" aria-busy="true">
        <span className="sr-only">Carregando indicadores</span>
        {Array.from({ length: 4 }, (_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }
  if (!latest) {
    return (
      <div className={grid}>
        <StatCard label="Demanda evaporativa" icon={Gauge} value="—" helper="Aguardando a primeira leitura" />
        <StatCard label="Ponto de orvalho" icon={CloudFog} tone="neutral" value="—" helper="Aguardando a primeira leitura" />
        <StatCard label="Temperatura" icon={Thermometer} tone="accent" value="—" helper="Aguardando a primeira leitura" />
        <StatCard label="Umidade do ar" icon={Droplets} value="—" helper="Aguardando a primeira leitura" />
      </div>
    );
  }
  const level = vpdLevel(latest.vpd);
  const dewMargin = latest.temperature - latest.dewPoint;
  return (
    <div className={grid}>
      <StatCard
        label="Demanda evaporativa (VPD)"
        icon={Gauge}
        value={formatKpa(latest.vpd)}
        helperClass={BAND_TEXT_CLASS[level.band]}
        helper={`${level.label} · ${formatTime(new Date(latest.t).toISOString())}`}
      />
      <StatCard
        label="Ponto de orvalho"
        icon={CloudFog}
        tone="neutral"
        value={formatCelsius(latest.dewPoint, 1)}
        helperClass={dewMargin < DEW_MARGIN_C ? BAND_TEXT_CLASS.atencao : undefined}
        helper={dewMargin < DEW_MARGIN_C ? 'Orvalho provável: folhas molhadas' : `${formatDecimal(dewMargin)} °C abaixo do ar`}
      />
      <StatCard label="Temperatura" icon={Thermometer} tone="accent" value={formatCelsius(latest.temperature, 1)} helper="Última leitura" />
      <StatCard label="Umidade do ar" icon={Droplets} value={formatPercent(latest.airHumidity)} helper="Última leitura" />
    </div>
  );
}

export function IrrigationPage() {
  const now = useNow();
  const [range, setRange] = useState<ClimateRange>('24h');
  const summary = useDashboardSummary();
  const series = useClimateSeries(range);
  // "Agora" vem sempre da série de 24 h (a de 7 dias chega agregada em janelas)
  const recent = useClimateSeries('24h');
  const hourly = useClimateAggregates('hour', PROFILE_DAYS);
  const vpdSeries = useMemo(() => (series.data ? toVpdSeries(series.data) : undefined), [series.data]);
  const latest = useMemo(() => {
    const last = recent.data?.[recent.data.length - 1];
    return last ? toVpdSeries([last])[0] : undefined;
  }, [recent.data]);
  const level = latest ? vpdLevel(latest.vpd) : null;

  return (
    <>
      <PageHeader
        eyebrow="Manejo"
        title="Irrigação"
        subtitle={<LiveIndicator lastReadingAt={summary.data?.lastReadingAt} now={now} />}
      />

      <div className="space-y-6">
        <NowKpis latest={latest} isLoading={recent.isLoading} isError={recent.isError} onRetry={() => recent.refetch()} />

        {level && (
          <p className="flex items-start gap-2 rounded-tile border border-border bg-surface px-4 py-3 text-[13px] text-ink-muted">
            <Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-ink-subtle" />
            <span>
              <strong className={`font-semibold ${BAND_TEXT_CLASS[level.band]}`}>Agora: {level.label.toLowerCase()}.</strong> {level.advice}
            </span>
          </p>
        )}

        <div className="pt-4">
          <RangeFilter value={range} onChange={setRange} options={RANGES} label="Período do gráfico" />
        </div>
        <VpdChartCard
          range={range}
          now={now}
          series={vpdSeries}
          isLoading={series.isLoading}
          isRefreshing={series.isPlaceholderData}
          isError={series.isError}
          onRetry={() => series.refetch()}
        />

        <IrrigationWindowCard
          days={PROFILE_DAYS}
          data={hourly.data}
          isLoading={hourly.isLoading}
          isRefreshing={hourly.isPlaceholderData}
          isError={hourly.isError}
          onRetry={() => hourly.refetch()}
        />

        <p className="text-xs leading-relaxed text-ink-subtle">
          A estação mede temperatura e umidade do ar. As recomendações usam o déficit de pressão de vapor (VPD), que indica quanta água o ar
          retira das plantas. Com um sensor de umidade do solo no canal (field3), a lâmina recomendada poderá considerar também a água disponível nas raízes.
        </p>
      </div>
    </>
  );
}
