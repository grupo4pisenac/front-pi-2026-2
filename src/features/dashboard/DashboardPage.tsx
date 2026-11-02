import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { CropId } from '@/types';
import { useSession } from '@/app/session';
import { useNow } from '@/hooks/useNow';
import { greetingFor } from '@/lib/greeting';
import { firstName } from '@/lib/formatters';
import { exportReadings } from './exportReadings';
import { useActivePlots, useClimateSeries, useDashboardSummary, useHarvestForecast, useTodayReadings } from './queries';
import { AgroHeroBanner } from './components/AgroHeroBanner';
import { ClimateChartCard } from './components/ClimateChartCard';
import { DashboardKpis } from './components/DashboardKpis';
import { HarvestForecastCard } from './components/HarvestForecastCard';
import { ActivePlotsCard } from './components/ActivePlotsCard';
import { ClimateHistoryCard } from './components/ClimateHistoryCard';

export function DashboardPage() {
  const now = useNow();
  const { user } = useSession();
  const [cropId, setCropId] = useState<CropId>('UVA_SUGRAONE');

  const summary = useDashboardSummary();
  const forecast = useHarvestForecast(cropId);
  const plots = useActivePlots();
  const readings = useTodayReadings();
  const series = useClimateSeries('24h');

  const greeting = user ? `${greetingFor(new Date(now))}, ${firstName(user.name)}` : 'Monitoramento operacional';

  return (
    <>
      <AgroHeroBanner
        greeting={greeting}
        lastReadingAt={summary.data?.lastReadingAt}
        now={now}
        avgTemp={summary.data?.avgTemperatureC}
        airHumidity={summary.data?.airHumidityPct}
        onExport={() => readings.data && exportReadings(readings.data)}
        canExport={!!readings.data?.length}
      />

      <div className="space-y-6">
        <DashboardKpis
          data={summary.data}
          isLoading={summary.isLoading}
          isError={summary.isError}
          onRetry={() => summary.refetch()}
          trend={series.data}
        />

        <ClimateChartCard
          range="24h"
          now={now}
          title="Clima nas últimas 24 horas"
          readings={series.data}
          isLoading={series.isLoading}
          isRefreshing={series.isPlaceholderData}
          isError={series.isError}
          onRetry={() => series.refetch()}
          action={
            <Link
              to="/clima"
              className="inline-flex h-9 items-center gap-1.5 rounded-tile border border-border bg-surface px-3.5 text-[13px] font-semibold text-ink transition-colors duration-150 hover:bg-canvas"
            >
              Ver análise completa
              <ArrowRight aria-hidden className="h-3.5 w-3.5" />
            </Link>
          }
        />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <HarvestForecastCard
              cropId={cropId}
              onCropChange={setCropId}
              data={forecast.data}
              isLoading={forecast.isLoading}
              isFetching={forecast.isFetching && !forecast.isLoading}
              isError={forecast.isError}
              onRetry={() => forecast.refetch()}
            />
          </div>
          <ActivePlotsCard
            plots={plots.data}
            isLoading={plots.isLoading}
            isError={plots.isError}
            onRetry={() => plots.refetch()}
          />
        </div>

        <ClimateHistoryCard
          readings={readings.data}
          isLoading={readings.isLoading}
          isError={readings.isError}
          onRetry={() => readings.refetch()}
          onExport={() => readings.data && exportReadings(readings.data)}
        />
      </div>
    </>
  );
}
