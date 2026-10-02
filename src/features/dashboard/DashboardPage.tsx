import { useState } from 'react';
import type { ClimateReading, CropId } from '@/types';
import { useSession } from '@/app/session';
import { useNow } from '@/hooks/useNow';
import { greetingFor } from '@/lib/greeting';
import { firstName, formatTime } from '@/lib/formatters';
import { downloadFile, toCsv } from '@/lib/csv';
import { PageHeader } from '@/components/layout/PageHeader';
import { Skeleton } from '@/components/ui';
import { useActivePlots, useDashboardSummary, useHarvestForecast, useTodayReadings } from './queries';
import { LiveIndicator } from './components/LiveIndicator';
import { DashboardKpis } from './components/DashboardKpis';
import { HarvestForecastCard } from './components/HarvestForecastCard';
import { ActivePlotsCard } from './components/ActivePlotsCard';
import { ClimateHistoryCard } from './components/ClimateHistoryCard';

function exportReadings(readings: ClimateReading[]) {
  const csv = toCsv(readings, [
    { header: 'Data/hora', value: (r) => new Date(r.timestamp).toLocaleString('pt-BR') },
    { header: 'Horário', value: (r) => formatTime(r.timestamp) },
    { header: 'Estação', value: (r) => r.stationId },
    { header: 'Temperatura (°C)', value: (r) => r.temperature.toLocaleString('pt-BR') },
    { header: 'Umidade do ar (%)', value: (r) => r.airHumidity },
    { header: 'Umidade do solo (%)', value: (r) => r.soilMoisture },
    { header: 'Chuva (mm)', value: (r) => r.rainfall.toLocaleString('pt-BR') },
  ]);
  downloadFile(csv, `barto-historico-climatico-${new Date().toISOString().slice(0, 10)}.csv`);
}

export function DashboardPage() {
  const now = useNow();
  const { user } = useSession();
  const [cropId, setCropId] = useState<CropId>('UVA_SUGRAONE');

  const summary = useDashboardSummary();
  const forecast = useHarvestForecast(cropId);
  const plots = useActivePlots();
  const readings = useTodayReadings();

  return (
    <>
      <PageHeader
        eyebrow="Visão geral"
        title={user ? `${greetingFor(new Date(now))}, ${firstName(user.name)}` : <Skeleton className="h-10 w-72" />}
        subtitle={<LiveIndicator lastReadingAt={summary.data?.lastReadingAt} now={now} />}
      />

      <div className="space-y-6">
        <DashboardKpis data={summary.data} isLoading={summary.isLoading} isError={summary.isError} onRetry={() => summary.refetch()} />

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
          <ActivePlotsCard plots={plots.data} isLoading={plots.isLoading} isError={plots.isError} onRetry={() => plots.refetch()} />
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
