import { useId, type ReactNode } from 'react';
import type { ClimateRange, ClimateReading } from '@/types';
import { cn } from '@/lib/cn';
import { formatCelsius, formatDateTime, formatPercent, formatTime } from '@/lib/formatters';
import { Card, CardBody, CardHeader } from '@/components/ui';
import { ChartFrame } from '@/components/charts/ChartFrame';
import { InlineStat } from '@/components/charts/ChartParts';
import { ClimateChart } from './ClimateChart';

export const RANGE_OPTIONS: ReadonlyArray<{ value: ClimateRange; label: string; description: string }> = [
  { value: 'today', label: 'Hoje', description: 'desde a meia-noite' },
  { value: '24h', label: '24 h', description: 'nas últimas 24 horas' },
  { value: '7d', label: '7 dias', description: 'nos últimos 7 dias' },
  { value: '30d', label: '30 dias', description: 'nos últimos 30 dias' },
];

const HOUR = 3_600_000;
const SPAN: Record<Exclude<ClimateRange, 'today'>, number> = { '24h': 24 * HOUR, '7d': 7 * 24 * HOUR, '30d': 30 * 24 * HOUR };

/** Janela do eixo X para o período — "Hoje" começa à meia-noite do Vale (UTC−3) */
export function rangeDomain(range: ClimateRange, now: number): [number, number] {
  if (range === 'today') {
    const offset = -3 * HOUR;
    return [Math.floor((now + offset) / (24 * HOUR)) * 24 * HOUR - offset, now];
  }
  return [now - SPAN[range], now];
}

interface SeriesStats {
  last: ClimateReading;
  min: ClimateReading;
  max: ClimateReading;
}

function statsOf(readings: ClimateReading[]): SeriesStats | null {
  const last = readings[readings.length - 1];
  if (!last) return null;
  let min = last;
  let max = last;
  for (const r of readings) {
    if (r.temperature < min.temperature) min = r;
    if (r.temperature > max.temperature) max = r;
  }
  return { last, min, max };
}

function summarize(s: SeriesStats, rangeDescription: string): string {
  return (
    `Gráfico de área em dois painéis: temperatura e umidade do ar ${rangeDescription}. ` +
    `Temperatura entre ${formatCelsius(s.min.temperature, 1)} (${formatDateTime(s.min.timestamp)}) e ` +
    `${formatCelsius(s.max.temperature, 1)} (${formatDateTime(s.max.timestamp)}). ` +
    `Última leitura em ${formatDateTime(s.last.timestamp)}: ${formatCelsius(s.last.temperature, 1)} e umidade do ar de ${formatPercent(s.last.airHumidity)}.`
  );
}

interface ClimateChartCardProps {
  range: ClimateRange;
  now: number;
  readings: ClimateReading[] | undefined;
  isLoading: boolean;
  isRefreshing: boolean;
  isError: boolean;
  onRetry: () => void;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export function ClimateChartCard({
  range,
  now,
  readings,
  isLoading,
  isRefreshing,
  isError,
  onRetry,
  title = 'Temperatura e umidade do ar',
  subtitle,
  action,
  className,
}: ClimateChartCardProps) {
  const titleId = useId();
  const option = RANGE_OPTIONS.find((o) => o.value === range) ?? RANGE_OPTIONS[0]!;
  const stats = readings ? statsOf(readings) : null;
  const short = range === 'today' || range === '24h';
  const at = (r: ClimateReading) => (short ? `às ${formatTime(r.timestamp)}` : formatDateTime(r.timestamp));

  return (
    <Card aria-labelledby={titleId} className={cn('flex flex-col', className)}>
      <CardHeader
        titleId={titleId}
        title={title}
        subtitle={subtitle ?? `Leituras da estação no ThingSpeak ${option.description}`}
        action={action}
      />
      <CardBody className="flex flex-1 flex-col">
        {stats && (
          <dl className="mb-5 grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-5">
            <InlineStat label="Agora" value={formatCelsius(stats.last.temperature, 1)} hint={formatTime(stats.last.timestamp)} />
            <InlineStat label="Mínima" value={formatCelsius(stats.min.temperature, 1)} hint={at(stats.min)} />
            <InlineStat label="Máxima" value={formatCelsius(stats.max.temperature, 1)} hint={at(stats.max)} />
            <InlineStat label="Amplitude" value={formatCelsius(stats.max.temperature - stats.min.temperature, 1)} />
            <InlineStat label="Umidade agora" value={formatPercent(stats.last.airHumidity)} />
          </dl>
        )}
        <ChartFrame
          className="h-[22rem]"
          isLoading={isLoading || !readings}
          isError={isError}
          onRetry={onRetry}
          isEmpty={!stats}
          isRefreshing={isRefreshing}
          summary={stats ? summarize(stats, option.description) : ''}
          emptyDescription="Assim que a estação publicar no canal do ThingSpeak, os dados aparecem aqui automaticamente (atualização a cada 30 s)."
        >
          {readings && <ClimateChart readings={readings} range={range} domain={rangeDomain(range, now)} />}
        </ChartFrame>
      </CardBody>
    </Card>
  );
}
