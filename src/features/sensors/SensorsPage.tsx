import { useId, useMemo, useState } from 'react';
import { ListFilter, Plus } from 'lucide-react';
import type { StationInput, StationStatus } from '@/types';
import { useNow } from '@/hooks/useNow';
import { formatInteger } from '@/lib/formatters';
import { Can } from '@/components/auth/Can';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, Card, CardBody, CardHeader, ErrorState, Menu, Skeleton } from '@/components/ui';
import { useCreateStation, useNetworkHealth, useStations } from './queries';
import { STATUS_META } from './stationStatus';
import { SensorMap } from './components/SensorMap';
import { NetworkHealthCard } from './components/NetworkHealthCard';
import { StationsTable } from './components/StationsTable';
import { AddSensorModal } from './components/AddSensorModal';

const ALL_STATUSES: StationStatus[] = ['ATIVO', 'ATENCAO', 'INATIVO'];

export function SensorsPage() {
  const now = useNow();
  const stations = useStations();
  const health = useNetworkHealth();
  const createStation = useCreateStation();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<Set<StationStatus>>(new Set(ALL_STATUSES));
  const [modalOpen, setModalOpen] = useState(false);
  const mapTitleId = useId();
  const tableTitleId = useId();

  const filtered = useMemo(() => stations.data?.filter((s) => statusFilter.has(s.status)), [stations.data, statusFilter]);
  const activeFilters = ALL_STATUSES.length - statusFilter.size;

  const toggleStatus = (s: StationStatus) =>
    setStatusFilter((prev) => {
      const next = new Set(prev);
      if (next.has(s) && next.size > 1) next.delete(s);
      else next.add(s);
      return next;
    });

  const handleCreate = (input: StationInput) =>
    createStation.mutate(input, {
      onSuccess: (station) => {
        setModalOpen(false);
        setSelectedId(station.id);
      },
    });

  const openModal = () => {
    createStation.reset();
    setModalOpen(true);
  };

  const addButton = (
    <Button variant="primary" leftIcon={<Plus aria-hidden className="h-4 w-4" />} onClick={openModal}>
      Adicionar sensor
    </Button>
  );

  return (
    <>
      <PageHeader
        eyebrow="Monitoramento"
        title="Mapeamento de sensores"
        subtitle="Estações IoT distribuídas entre Petrolina e Juazeiro, sincronizadas via ThingSpeak."
        action={<Can permission="sensors:write">{addButton}</Can>}
      />

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Card aria-labelledby={mapTitleId} className="xl:col-span-2">
            <CardHeader
              titleId={mapTitleId}
              title="Mapa da rede"
              subtitle="Passe o mouse sobre uma estação para ver a última leitura"
            />
            <CardBody>
              {stations.isError ? (
                <ErrorState onRetry={() => stations.refetch()} />
              ) : stations.isLoading || !stations.data ? (
                <div role="status" aria-busy="true">
                  <span className="sr-only">Carregando mapa</span>
                  <Skeleton className="aspect-[4/3] w-full rounded-tile sm:aspect-[1000/560]" />
                </div>
              ) : (
                <SensorMap stations={stations.data} selectedId={selectedId} onSelect={setSelectedId} now={now} />
              )}
            </CardBody>
          </Card>

          <NetworkHealthCard data={health.data} isLoading={health.isLoading} isError={health.isError} onRetry={() => health.refetch()} now={now} />
        </div>

        <Card aria-labelledby={tableTitleId} className="overflow-hidden">
          <CardHeader
            titleId={tableTitleId}
            title="Estações de monitoramento"
            subtitle={filtered ? `${formatInteger(filtered.length)} estações exibidas` : 'Carregando…'}
            className="pb-5"
            action={
              <Menu
                items={ALL_STATUSES.map((s) => ({
                  key: s,
                  label: STATUS_META[s].label,
                  section: 'Status',
                  checked: statusFilter.has(s),
                  onSelect: () => toggleStatus(s),
                }))}
                trigger={(props) => (
                  <Button {...props} size="sm" leftIcon={<ListFilter aria-hidden className="h-3.5 w-3.5" />}>
                    Filtrar
                    {activeFilters > 0 && (
                      <span className="ml-0.5 rounded-full bg-brand px-1.5 text-[11px] font-semibold text-white">{activeFilters}</span>
                    )}
                  </Button>
                )}
              />
            }
          />
          <StationsTable
            stations={filtered}
            isLoading={stations.isLoading}
            isError={stations.isError}
            onRetry={() => stations.refetch()}
            selectedId={selectedId}
            onLocate={setSelectedId}
            now={now}
          />
        </Card>
      </div>

      <AddSensorModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
        isSubmitting={createStation.isPending}
        error={createStation.error?.message ?? null}
      />
    </>
  );
}
