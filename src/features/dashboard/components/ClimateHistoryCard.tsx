import { useId, useMemo, useState } from 'react';
import { CloudSun, Download } from 'lucide-react';
import type { ClimateReading } from '@/types';
import { HEAT_ATTENTION_C, HEAT_CRITICAL_C } from '@/lib/agronomy';
import { formatCelsius, formatInteger, formatMm, formatOr, formatPercent, formatTime } from '@/lib/formatters';
import { Badge, Button, Card, CardHeader, DataTable, EmptyState, type Column } from '@/components/ui';

interface ClimateHistoryCardProps {
  readings: ClimateReading[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onExport: () => void;
}

/** A estação publica a cada ~20 s: a tabela mostra as mais recentes e cresce sob demanda */
const PAGE_SIZE = 12;

function thermalBadge(tempC: number) {
  if (tempC >= HEAT_CRITICAL_C) return { tone: 'danger', label: 'Crítico' } as const;
  if (tempC >= HEAT_ATTENTION_C) return { tone: 'warning', label: 'Estresse' } as const;
  return { tone: 'success', label: 'Normal' } as const;
}

const BASE_COLUMNS: Column<ClimateReading>[] = [
  {
    key: 'time',
    header: 'Horário',
    mobile: 'title',
    render: (r) => <span className="font-semibold tabular-nums">{formatTime(r.timestamp)}</span>,
  },
  { key: 'temp', header: 'Temperatura', render: (r) => <span className="tabular-nums">{formatCelsius(r.temperature, 1)}</span> },
  { key: 'air', header: 'Umidade do ar', render: (r) => <span className="tabular-nums">{formatPercent(r.airHumidity)}</span> },
];

const SOIL_COLUMN: Column<ClimateReading> = {
  key: 'soil',
  header: 'Umidade do solo',
  render: (r) => <span className="tabular-nums">{formatOr(r.soilMoisture, formatPercent)}</span>,
};

const RAIN_COLUMN: Column<ClimateReading> = {
  key: 'rain',
  header: 'Chuva',
  render: (r) => <span className="tabular-nums">{formatOr(r.rainfall, (n) => formatMm(n, 1))}</span>,
};

const CONDITION_COLUMN: Column<ClimateReading> = {
  key: 'status',
  header: 'Condição térmica',
  align: 'right',
  render: (r) => {
    const b = thermalBadge(r.temperature);
    return (
      <Badge tone={b.tone} dot>
        {b.label}
      </Badge>
    );
  },
};

export function ClimateHistoryCard({ readings, isLoading, isError, onRetry, onExport }: ClimateHistoryCardProps) {
  const titleId = useId();
  const [visible, setVisible] = useState(PAGE_SIZE);

  // Colunas de solo e chuva só aparecem se a estação mede essas grandezas
  const columns = useMemo(() => {
    const cols = [...BASE_COLUMNS];
    if (readings?.some((r) => r.soilMoisture !== null)) cols.push(SOIL_COLUMN);
    if (readings?.some((r) => r.rainfall !== null)) cols.push(RAIN_COLUMN);
    return [...cols, CONDITION_COLUMN];
  }, [readings]);

  const latestFirst = useMemo(() => (readings ? [...readings].reverse() : undefined), [readings]);
  const total = latestFirst?.length ?? 0;
  const shown = Math.min(visible, total);

  return (
    <Card aria-labelledby={titleId} className="overflow-hidden">
      <CardHeader
        titleId={titleId}
        title="Histórico climático"
        subtitle={total ? `Leituras de hoje · ${formatInteger(total)} recebidas do ThingSpeak` : 'Leituras de hoje · Estação conectada ao ThingSpeak'}
        className="pb-5"
        action={
          <Button size="sm" leftIcon={<Download aria-hidden className="h-3.5 w-3.5" />} onClick={onExport} disabled={!readings?.length}>
            Exportar CSV
          </Button>
        }
      />
      <DataTable
        caption="Leituras climáticas de hoje, mais recentes primeiro"
        columns={columns}
        rows={latestFirst?.slice(0, visible)}
        getRowId={(r) => r.id}
        isLoading={isLoading}
        isError={isError}
        onRetry={onRetry}
        empty={<EmptyState icon={CloudSun} title="Sem leituras hoje" description="A estação ainda não publicou dados no ThingSpeak hoje." />}
      />
      {total > PAGE_SIZE && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-6 py-3 text-xs text-ink-muted">
          <span aria-live="polite">
            Mostrando {formatInteger(shown)} de {formatInteger(total)} leituras
          </span>
          <div className="flex gap-2">
            {visible > PAGE_SIZE && (
              <Button size="sm" variant="ghost" onClick={() => setVisible(PAGE_SIZE)}>
                Recolher
              </Button>
            )}
            {shown < total && (
              <Button size="sm" variant="secondary" onClick={() => setVisible((v) => v + PAGE_SIZE * 2)}>
                Mostrar mais
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
