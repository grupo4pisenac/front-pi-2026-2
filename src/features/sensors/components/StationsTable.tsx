import type { ReactNode } from 'react';
import { Battery, BatteryLow, BatteryMedium, BatteryFull, BatteryWarning, ExternalLink, MapPin, MoreHorizontal, RadioTower } from 'lucide-react';
import type { Station } from '@/types';
import { CROPS } from '@/lib/crops';
import { cn } from '@/lib/cn';
import { formatPercent, formatRelative } from '@/lib/formatters';
import { Badge, Button, DataTable, EmptyState, Menu, type Column } from '@/components/ui';
import { LOW_BATTERY, STATUS_META, statusLabel } from '../stationStatus';

interface StationsTableProps {
  stations: Station[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  selectedId: string | null;
  onLocate: (id: string) => void;
  now: number;
  emptyAction?: ReactNode;
}

function BatteryCell({ level }: { level: number }) {
  const low = level < LOW_BATTERY;
  const Icon = level === 0 ? BatteryWarning : low ? BatteryLow : level < 60 ? BatteryMedium : level < 90 ? Battery : BatteryFull;
  return (
    <span className={cn('inline-flex items-center gap-1.5 font-medium tabular-nums', low ? 'text-accent' : 'text-ink')}>
      <Icon aria-hidden className="h-4 w-4" strokeWidth={1.75} />
      {formatPercent(level)}
      {low && <span className="sr-only">(bateria baixa)</span>}
    </span>
  );
}

function buildColumns(onLocate: (id: string) => void, now: number): Column<Station>[] {
  return [
    {
      key: 'station',
      header: 'Estação',
      mobile: 'title',
      render: (s) => (
        <div className="flex items-center gap-3">
          <span aria-hidden className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-tile bg-brand-soft text-brand sm:inline-flex">
            <RadioTower className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-ink">{s.name}</p>
            <p className="text-xs text-ink-subtle">{s.id}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'health',
      header: 'Saúde',
      render: (s) => (
        <Badge tone={STATUS_META[s.status].tone} dot>
          {statusLabel(s)}
        </Badge>
      ),
    },
    {
      key: 'product',
      header: 'Produto',
      render: (s) => {
        const crop = CROPS[s.productId];
        return (
          <span className="inline-flex items-center gap-2">
            <span aria-hidden className={cn('inline-flex h-6 w-6 items-center justify-center rounded-md', crop.softClass, crop.textClass)}>
              <crop.icon className="h-3.5 w-3.5" strokeWidth={2} />
            </span>
            {crop.label}
          </span>
        );
      },
    },
    {
      key: 'last',
      header: 'Última leitura',
      render: (s) => <span className="text-ink-muted">{formatRelative(s.lastReadingAt, now)}</span>,
    },
    { key: 'battery', header: 'Bateria', render: (s) => <BatteryCell level={s.battery} /> },
    {
      key: 'actions',
      header: '',
      align: 'right',
      mobile: 'actions',
      className: 'w-14',
      render: (s) => (
        <Menu
          items={[
            { key: 'map', label: 'Ver no mapa', icon: <MapPin className="h-4 w-4" />, onSelect: () => onLocate(s.id) },
            {
              key: 'ts',
              label: 'Abrir canal no ThingSpeak',
              icon: <ExternalLink className="h-4 w-4" />,
              onSelect: () => window.open(`https://thingspeak.com/channels/${s.thingSpeakChannelId}`, '_blank', 'noopener'),
            },
          ]}
          trigger={(props) => (
            <Button {...props} variant="ghost" size="icon" aria-label={`Ações da estação ${s.name}`}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          )}
        />
      ),
    },
  ];
}

export function StationsTable({ stations, isLoading, isError, onRetry, selectedId, onLocate, now, emptyAction }: StationsTableProps) {
  return (
    <DataTable
      caption="Estações de monitoramento"
      columns={buildColumns(onLocate, now)}
      rows={stations}
      getRowId={(s) => s.id}
      isLoading={isLoading}
      isError={isError}
      onRetry={onRetry}
      highlightedId={selectedId}
      empty={
        <EmptyState
          icon={RadioTower}
          title="Nenhuma estação encontrada"
          description="Ajuste os filtros ou cadastre uma nova estação ESP32."
          action={emptyAction}
        />
      }
    />
  );
}
