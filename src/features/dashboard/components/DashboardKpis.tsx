import { ArrowDownRight, ArrowUpRight, CloudRain, Droplets, Sprout, Thermometer } from 'lucide-react';
import type { ClimateReading, DashboardSummary } from '@/types';
import { BAND_TEXT_CLASS, productionChangeBand, soilMoistureBand, temperatureDeltaBand } from '@/lib/agronomy';
import { formatCelsius, formatInteger, formatMm, formatOr, formatPercent, formatSignedPercent, THIN } from '@/lib/formatters';
import { chartColors } from '@/theme/tokens';
import { Card, ErrorState, StatCard, StatCardSkeleton } from '@/components/ui';
import { Sparkline } from '@/components/charts/Sparkline';

interface DashboardKpisProps {
  data: DashboardSummary | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  /** Leituras das últimas 24 h para os minigráficos de tendência */
  trend?: ClimateReading[];
}

const GRID = 'grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4';

const SOIL_COPY = { ideal: 'Dentro do ideal', atencao: 'Fora da faixa ideal', critico: 'Nível crítico', neutro: '' } as const;

function trendLabel(name: string, values: number[], format: (n: number) => string): string {
  return `Tendência de ${name} nas últimas 24 h: de ${format(values[0]!)} a ${format(values[values.length - 1]!)}, ` +
    `mínima ${format(Math.min(...values))} e máxima ${format(Math.max(...values))}.`;
}

export function DashboardKpis({ data, isLoading, isError, onRetry, trend }: DashboardKpisProps) {
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
  const tempBand = data.temperatureDeltaC === null ? 'neutro' : temperatureDeltaBand(data.temperatureDeltaC);
  const soilBand = data.soilMoisturePct === null ? 'neutro' : soilMoistureBand(data.soilMoisturePct);
  const TrendIcon = data.productionChangePct >= 0 ? ArrowUpRight : ArrowDownRight;
  const delta = Math.abs(data.temperatureDeltaC ?? 0);
  // Estação sem sensor de solo (só DHT: temperatura + umidade do ar) → card mostra a umidade do ar
  const showAirHumidity = data.soilMoisturePct === null && data.airHumidityPct !== null;
  const temps = trend?.map((r) => r.temperature) ?? [];
  const hums = trend?.map((r) => r.airHumidity) ?? [];
  const fmtTemp = (n: number) => formatCelsius(n, 1);

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
        value={formatOr(data.avgTemperatureC, formatCelsius)}
        helperClass={BAND_TEXT_CLASS[tempBand]}
        helper={
          data.avgTemperatureC === null
            ? 'Sem leituras nas últimas 24 h'
            : data.temperatureDeltaC === null || delta < 0.5
              ? 'Média das últimas 24 h'
              : `${formatCelsius(delta)} ${data.temperatureDeltaC > 0 ? 'acima' : 'abaixo'} da média de 30 dias`
        }
        trend={temps.length > 1 && <Sparkline values={temps} color={chartColors.temperature} label={trendLabel('temperatura', temps, fmtTemp)} />}
      />
      {showAirHumidity ? (
        <StatCard
          label="Umidade do ar"
          icon={Droplets}
          value={formatOr(data.airHumidityPct, formatPercent)}
          helper="Média das últimas 24 h"
          trend={hums.length > 1 && <Sparkline values={hums} color={chartColors.humidity} label={trendLabel('umidade do ar', hums, (n) => formatPercent(n))} />}
        />
      ) : (
        <StatCard
          label="Umidade do solo"
          icon={Droplets}
          value={formatOr(data.soilMoisturePct, formatPercent)}
          helperClass={BAND_TEXT_CLASS[soilBand]}
          helper={data.soilMoisturePct === null ? 'Sem leituras nas últimas 24 h' : SOIL_COPY[soilBand]}
        />
      )}
      <StatCard
        label="Chuva acumulada"
        icon={CloudRain}
        tone="neutral"
        value={formatOr(data.rainfall7dMm, formatMm)}
        helper={data.rainfall7dMm === null ? 'Sem pluviômetro na estação' : 'Últimos 7 dias'}
      />
    </div>
  );
}
