import { ArrowDownRight, ArrowUpRight, CloudRain, Droplets, Sprout, Thermometer } from 'lucide-react';
import type { DashboardSummary } from '@/types';
import { BAND_TEXT_CLASS, productionChangeBand, soilMoistureBand, temperatureDeltaBand } from '@/lib/agronomy';
import { formatCelsius, formatInteger, formatMm, formatPercent, formatSignedPercent, THIN } from '@/lib/formatters';
import { Card, ErrorState, StatCard, StatCardSkeleton } from '@/components/ui';

interface DashboardKpisProps {
  data: DashboardSummary | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

const GRID = 'grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4';

const SOIL_COPY = { ideal: 'Dentro do ideal', atencao: 'Fora da faixa ideal', critico: 'Nível crítico', neutro: '' } as const;

export function DashboardKpis({ data, isLoading, isError, onRetry }: DashboardKpisProps) {
  if (isError) {
    return (
      <Card>
        <ErrorState message="Não foi possível carregar os indicadores." onRetry={onRetry} />
      </Card>
    );
  }
  if (isLoading || !data) {
    return (
      <div className={GRID} role="status" aria-busy="true">
        <span className="sr-only">Carregando indicadores</span>
        {Array.from({ length: 4 }, (_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const prodBand = productionChangeBand(data.productionChangePct);
  const tempBand = temperatureDeltaBand(data.temperatureDeltaC);
  const soilBand = soilMoistureBand(data.soilMoisturePct);
  const TrendIcon = data.productionChangePct >= 0 ? ArrowUpRight : ArrowDownRight;
  const delta = Math.abs(data.temperatureDeltaC);

  return (
    <div className={GRID}>
      <StatCard
        label="Produção projetada"
        icon={Sprout}
        value={<>{formatInteger(data.projectedProductionT)}<span className="text-lg font-medium text-ink-muted">{THIN}t</span></>}
        helperClass={BAND_TEXT_CLASS[prodBand]}
        helper={
          <>
            <TrendIcon aria-hidden className="h-3.5 w-3.5" strokeWidth={2.25} />
            {formatSignedPercent(data.productionChangePct)} este ciclo
          </>
        }
      />
      <StatCard
        label="Temperatura média"
        icon={Thermometer}
        tone="accent"
        value={formatCelsius(data.avgTemperatureC)}
        helperClass={BAND_TEXT_CLASS[tempBand]}
        helper={
          delta < 0.5
            ? 'Na média histórica'
            : `${formatCelsius(delta)} ${data.temperatureDeltaC > 0 ? 'acima' : 'abaixo'} da média`
        }
      />
      <StatCard
        label="Umidade do solo"
        icon={Droplets}
        value={formatPercent(data.soilMoisturePct)}
        helperClass={BAND_TEXT_CLASS[soilBand]}
        helper={SOIL_COPY[soilBand]}
      />
      <StatCard
        label="Chuva acumulada"
        icon={CloudRain}
        tone="neutral"
        value={formatMm(data.rainfall7dMm)}
        helper="Últimos 7 dias"
      />
    </div>
  );
}
