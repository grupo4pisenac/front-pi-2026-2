import { useId } from 'react';
import { CloudSun, Download } from 'lucide-react';
import type { ClimateReading } from '@/types';
import { soilMoistureBand } from '@/lib/agronomy';
import { formatCelsius, formatMm, formatPercent, formatTime } from '@/lib/formatters';
import { Badge, Button, Card, CardHeader, DataTable, EmptyState, type Column } from '@/components/ui';

interface ClimateHistoryCardProps {
  readings: ClimateReading[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onExport: () => void;
}

const BAND_BADGE = {
  ideal: { tone: 'success', label: 'Ideal' },
  atencao: { tone: 'warning', label: 'Atenção' },
  critico: { tone: 'danger', label: 'Crítico' },
  neutro: { tone: 'neutral', label: '—' },
} as const;

const COLUMNS: Column<ClimateReading>[] = [
  {
    key: 'time',
    header: 'Horário',
    mobile: 'title',
    render: (r) => <span className="font-semibold tabular-nums">{formatTime(r.timestamp)}</span>,
  },
  { key: 'temp', header: 'Temperatura', render: (r) => <span className="tabular-nums">{formatCelsius(r.temperature, 1)}</span> },
  { key: 'air', header: 'Umidade do ar', render: (r) => <span className="tabular-nums">{formatPercent(r.airHumidity)}</span> },
  { key: 'soil', header: 'Umidade do solo', render: (r) => <span className="tabular-nums">{formatPercent(r.soilMoisture)}</span> },
  { key: 'rain', header: 'Chuva', render: (r) => <span className="tabular-nums">{formatMm(r.rainfall, 1)}</span> },
  {
    key: 'status',
    header: 'Condição',
    align: 'right',
    render: (r) => {
      const b = BAND_BADGE[soilMoistureBand(r.soilMoisture)];
      return (
        <Badge tone={b.tone} dot>
          {b.label}
        </Badge>
      );
    },
  },
];

export function ClimateHistoryCard({ readings, isLoading, isError, onRetry, onExport }: ClimateHistoryCardProps) {
  const titleId = useId();
  return (
    <Card aria-labelledby={titleId} className="overflow-hidden">
      <CardHeader
        titleId={titleId}
        title="Histórico climático"
        subtitle="Leituras de hoje · Estação Fazenda Santa Clara"
        className="pb-5"
        action={
          <Button size="sm" leftIcon={<Download aria-hidden className="h-3.5 w-3.5" />} onClick={onExport} disabled={!readings?.length}>
            Exportar
          </Button>
        }
      />
      <DataTable
        caption="Leituras climáticas de hoje"
        columns={COLUMNS}
        rows={readings ? [...readings].reverse() : undefined}
        getRowId={(r) => r.id}
        isLoading={isLoading}
        isError={isError}
        onRetry={onRetry}
        empty={<EmptyState icon={CloudSun} title="Sem leituras hoje" description="As estações ainda não publicaram dados no ThingSpeak hoje." />}
      />
    </Card>
  );
}
