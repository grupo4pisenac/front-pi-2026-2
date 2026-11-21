import { useId, useMemo } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from 'recharts';
import { Sprout } from 'lucide-react';
import type { ClimateRange, ClimateReading } from '@/types';
import { chartColors } from '@/theme/tokens';
import { cn } from '@/lib/cn';
import { formatDateTime, formatInteger, formatPercent, formatTime } from '@/lib/formatters';
import { Card, CardBody, CardHeader } from '@/components/ui';
import { ChartFrame } from '@/components/charts/ChartFrame';
import { InlineStat, TooltipRow, TooltipShell } from '@/components/charts/ChartParts';
import { activeDot, crosshair, formatDayTick, formatFullDateTime, formatHourTick, gridProps, tickStyle } from '@/components/charts/chartTheme';
import { RANGE_OPTIONS, rangeDomain } from '@/features/dashboard/components/ClimateChartCard';
import { timeTicks } from '@/features/dashboard/components/ClimateChart';

/** Um ponto do gráfico: só leituras em que a estação publicou o field3 */
interface SoilPoint {
  t: number;
  soilMoisture: number;
  timestamp: string;
}

interface SoilStats {
  last: SoilPoint;
  min: SoilPoint;
  max: SoilPoint;
  avg: number;
}

function toPoints(readings: ClimateReading[]): SoilPoint[] {
  return readings
    .filter((r): r is ClimateReading & { soilMoisture: number } => r.soilMoisture !== null)
    .map((r) => ({ t: new Date(r.timestamp).getTime(), soilMoisture: r.soilMoisture, timestamp: r.timestamp }));
}

function statsOf(points: SoilPoint[]): SoilStats | null {
  const last = points[points.length - 1];
  if (!last) return null;
  let min = last;
  let max = last;
  let sum = 0;
  for (const p of points) {
    if (p.soilMoisture < min.soilMoisture) min = p;
    if (p.soilMoisture > max.soilMoisture) max = p;
    sum += p.soilMoisture;
  }
  return { last, min, max, avg: sum / points.length };
}

function summarize(s: SoilStats, rangeDescription: string): string {
  return (
    `Gráfico de área da umidade do solo ${rangeDescription}. ` +
    `Variou entre ${formatPercent(s.min.soilMoisture, 1)} (${formatDateTime(s.min.timestamp)}) e ` +
    `${formatPercent(s.max.soilMoisture, 1)} (${formatDateTime(s.max.timestamp)}), com média de ${formatPercent(s.avg, 1)}. ` +
    `Última leitura em ${formatDateTime(s.last.timestamp)}: ${formatPercent(s.last.soilMoisture, 1)}.`
  );
}

function Readout({ active, payload }: TooltipProps<number, string>) {
  const p = payload?.[0]?.payload as SoilPoint | undefined;
  if (!active || !p) return null;
  return (
    <TooltipShell title={formatFullDateTime(p.t)}>
      <TooltipRow color={chartColors.soilMoisture} label="Umidade do solo" value={formatPercent(p.soilMoisture, 1)} />
    </TooltipShell>
  );
}

interface SoilMoistureChartCardProps {
  range: ClimateRange;
  now: number;
  readings: ClimateReading[] | undefined;
  isLoading: boolean;
  isRefreshing: boolean;
  isError: boolean;
  onRetry: () => void;
  className?: string;
}

/** Umidade do solo (field3 do ThingSpeak) no mesmo período e eixo de tempo do gráfico de temperatura/umidade do ar. */
export function SoilMoistureChartCard({
  range,
  now,
  readings,
  isLoading,
  isRefreshing,
  isError,
  onRetry,
  className,
}: SoilMoistureChartCardProps) {
  const titleId = useId();
  const gradientId = useId().replace(/:/g, '');
  const option = RANGE_OPTIONS.find((o) => o.value === range) ?? RANGE_OPTIONS[0]!;
  const points = useMemo(() => (readings ? toPoints(readings) : []), [readings]);
  const stats = statsOf(points);
  const domain = rangeDomain(range, now);
  const ticks = timeTicks(range, domain);
  const short = range === 'today' || range === '24h';
  const at = (p: SoilPoint) => (short ? `às ${formatTime(p.timestamp)}` : formatDateTime(p.timestamp));

  return (
    <Card aria-labelledby={titleId} className={cn('flex flex-col', className)}>
      <CardHeader
        titleId={titleId}
        title="Umidade do solo"
        subtitle={`Sensor de solo da estação (field3 do ThingSpeak) ${option.description}`}
      />
      <CardBody className="flex flex-1 flex-col">
        {stats && (
          <dl className="mb-5 grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4">
            <InlineStat label="Agora" value={formatPercent(stats.last.soilMoisture, 1)} hint={formatTime(stats.last.timestamp)} />
            <InlineStat label="Mínima" value={formatPercent(stats.min.soilMoisture, 1)} hint={at(stats.min)} />
            <InlineStat label="Máxima" value={formatPercent(stats.max.soilMoisture, 1)} hint={at(stats.max)} />
            <InlineStat label="Média" value={formatPercent(stats.avg, 1)} />
          </dl>
        )}
        <ChartFrame
          className="h-64"
          isLoading={isLoading || !readings}
          isError={isError}
          onRetry={onRetry}
          isEmpty={!stats}
          isRefreshing={isRefreshing}
          summary={stats ? summarize(stats, option.description) : ''}
          emptyIcon={Sprout}
          emptyTitle="Sem leituras de umidade do solo"
          emptyDescription="A estação ainda não publicou o field3 do ThingSpeak neste período. Quando publicar, o gráfico aparece aqui automaticamente."
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={points} margin={{ top: 6, right: 12, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartColors.soilMoisture} stopOpacity={0.14} />
                  <stop offset="100%" stopColor={chartColors.soilMoisture} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridProps} />
              <XAxis
                dataKey="t"
                type="number"
                scale="time"
                domain={domain}
                ticks={ticks}
                tickFormatter={short ? formatHourTick : formatDayTick}
                axisLine={false}
                tickLine={false}
                tick={tickStyle}
                height={28}
                dy={6}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={tickStyle}
                width={44}
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                interval={0}
                tickFormatter={(v: number) => `${formatInteger(v)}%`}
              />
              <Tooltip content={<Readout />} cursor={crosshair} isAnimationActive={false} />
              <Area
                type="monotone"
                dataKey="soilMoisture"
                name="Umidade do solo"
                stroke={chartColors.soilMoisture}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                dot={points.length <= 30 ? activeDot(chartColors.soilMoisture) : false}
                activeDot={activeDot(chartColors.soilMoisture)}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartFrame>
      </CardBody>
    </Card>
  );
}
