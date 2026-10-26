import { useId, useMemo } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from 'recharts';
import type { ClimateRange } from '@/types';
import { chartColors } from '@/theme/tokens';
import { VPD_CRITICAL_KPA, VPD_HIGH_KPA, VPD_LOW_KPA, vpdLevel } from '@/lib/agronomy';
import { formatCelsius, formatDecimal, formatKpa, formatPercent } from '@/lib/formatters';
import { Card, CardBody, CardHeader } from '@/components/ui';
import { ChartFrame } from '@/components/charts/ChartFrame';
import { ChartLegend, InlineStat, TooltipRow, TooltipShell } from '@/components/charts/ChartParts';
import { activeDot, crosshair, formatDayTick, formatFullDateTime, formatHourTick, gridProps, niceTicks, tickStyle } from '@/components/charts/chartTheme';
import { timeTicks } from '@/features/dashboard/components/ClimateChart';
import { RANGE_OPTIONS, rangeDomain } from '@/features/dashboard/components/ClimateChartCard';
import { hoursWhere, type VpdPoint } from '../vpd';

interface VpdChartCardProps {
  range: ClimateRange;
  now: number;
  series: VpdPoint[] | undefined;
  isLoading: boolean;
  isRefreshing: boolean;
  isError: boolean;
  onRetry: () => void;
}

function Readout({ active, payload }: TooltipProps<number, string>) {
  const p = payload?.[0]?.payload as VpdPoint | undefined;
  if (!active || !p) return null;
  return (
    <TooltipShell title={formatFullDateTime(p.t)}>
      <TooltipRow color={chartColors.vpd} label={`VPD · ${vpdLevel(p.vpd).label.toLowerCase()}`} value={formatKpa(p.vpd)} />
      <TooltipRow label="Temperatura" value={formatCelsius(p.temperature, 1)} />
      <TooltipRow label="Umidade do ar" value={formatPercent(p.airHumidity)} />
      <TooltipRow label="Ponto de orvalho" value={formatCelsius(p.dewPoint, 1)} />
    </TooltipShell>
  );
}

const formatHours = (h: number) => (h < 1 ? `${Math.round(h * 60)} min` : `${formatDecimal(h)} h`);

export function VpdChartCard({ range, now, series, isLoading, isRefreshing, isError, onRetry }: VpdChartCardProps) {
  const titleId = useId();
  const gradientId = useId().replace(/:/g, '');
  const domain = useMemo(() => rangeDomain(range, now), [range, now]);
  const ticks = useMemo(() => timeTicks(range, domain), [range, domain]);
  const option = RANGE_OPTIONS.find((o) => o.value === range)!;
  const hasData = !!series?.length;
  const peak = hasData ? series.reduce((a, b) => (b.vpd > a.vpd ? b : a)) : null;
  const yTicks = niceTicks(0, Math.max(VPD_CRITICAL_KPA + 0.5, (peak?.vpd ?? 0) + 0.2));
  const short = range === 'today' || range === '24h';

  const summary =
    hasData && peak
      ? `Gráfico de área do déficit de pressão de vapor ${option.description}. Pico de ${formatKpa(peak.vpd)} em ${formatFullDateTime(peak.t)}. ` +
        `${formatHours(hoursWhere(series, (v) => v > VPD_CRITICAL_KPA))} acima de ${formatKpa(VPD_CRITICAL_KPA)}.`
      : '';

  return (
    <Card aria-labelledby={titleId}>
      <CardHeader
        titleId={titleId}
        title="Demanda evaporativa (VPD, kPa)"
        subtitle={`Déficit de pressão de vapor ${option.description}, calculado da temperatura e da umidade do ar`}
        action={
          <ChartLegend
            items={[
              { label: 'Baixo < 0,4', color: chartColors.humidity, shape: 'dashed' },
              { label: 'Alto > 1,5', color: chartColors.threshold, shape: 'dashed' },
              { label: 'Muito alto > 2,5', color: chartColors.critical, shape: 'dashed' },
            ]}
          />
        }
      />
      <CardBody>
        {hasData && peak && (
          <dl className="mb-5 grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4">
            <InlineStat label="Pico" value={formatKpa(peak.vpd)} hint={short ? formatHourTick(peak.t) : formatFullDateTime(peak.t)} />
            <InlineStat label="Acima de 2,5 kPa" value={formatHours(hoursWhere(series, (v) => v > VPD_CRITICAL_KPA))} />
            <InlineStat label="Faixa adequada" value={formatHours(hoursWhere(series, (v) => v >= VPD_LOW_KPA && v <= VPD_HIGH_KPA))} />
            <InlineStat label="Abaixo de 0,4 kPa" value={formatHours(hoursWhere(series, (v) => v < VPD_LOW_KPA))} />
          </dl>
        )}
        <ChartFrame
          className="h-72"
          isLoading={isLoading || !series}
          isError={isError}
          onRetry={onRetry}
          isEmpty={!hasData}
          isRefreshing={isRefreshing}
          summary={summary}
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={series} margin={{ top: 6, right: 12, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartColors.vpd} stopOpacity={0.14} />
                  <stop offset="100%" stopColor={chartColors.vpd} stopOpacity={0.02} />
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
                width={52}
                domain={[0, yTicks[yTicks.length - 1]!]}
                ticks={yTicks}
                interval={0}
                tickFormatter={(v: number) => formatDecimal(v)}
              />
              <ReferenceLine y={VPD_LOW_KPA} stroke={chartColors.humidity} strokeDasharray="4 4" />
              <ReferenceLine y={VPD_HIGH_KPA} stroke={chartColors.threshold} strokeDasharray="4 4" />
              <ReferenceLine y={VPD_CRITICAL_KPA} stroke={chartColors.critical} strokeDasharray="4 4" />
              <Tooltip content={<Readout />} cursor={crosshair} isAnimationActive={false} />
              <Area
                type="monotone"
                dataKey="vpd"
                stroke={chartColors.vpd}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                dot={series && series.length <= 30 ? activeDot(chartColors.vpd) : false}
                activeDot={activeDot(chartColors.vpd)}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartFrame>
      </CardBody>
    </Card>
  );
}
