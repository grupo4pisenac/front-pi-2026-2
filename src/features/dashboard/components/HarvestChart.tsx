import { useId, useMemo } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from 'recharts';
import type { HarvestForecastPoint } from '@/types';
import { chartColors } from '@/theme/tokens';
import { formatCelsius, formatInteger, formatTons } from '@/lib/formatters';
import { TooltipRow, TooltipShell } from '@/components/charts/ChartParts';
import { activeDot, crosshair, gridProps, tickStyle } from '@/components/charts/chartTheme';

interface HarvestChartProps {
  points: HarvestForecastPoint[];
}

interface Point extends HarvestForecastPoint {
  /** Produção dos meses já ocorridos (inclui o mês atual) */
  realized: number | null;
  /** Produção projetada (começa no mês atual para a linha não ter lacuna) */
  forecast: number | null;
}

function Readout({ active, payload }: TooltipProps<number, string>) {
  const p = payload?.[0]?.payload as Point | undefined;
  if (!active || !p) return null;
  return (
    <TooltipShell title={`${p.period}${p.projected ? ' · projetado' : ''}`}>
      <TooltipRow color={chartColors.production} shape={p.projected ? 'dashed' : 'line'} label="Produção" value={formatTons(p.productionT)} />
      {p.measuredTemperatureC !== null && (
        <TooltipRow color={chartColors.temperature} shape="dot" label="Temp. medida" value={formatCelsius(p.measuredTemperatureC, 1)} />
      )}
      <TooltipRow color={chartColors.reference} label="Normal climatológica" value={formatCelsius(p.avgTemperatureC, 1)} />
    </TooltipShell>
  );
}

function PanelTitle({ children }: { children: string }) {
  return <p className="mb-1 text-xs font-medium text-ink-muted">{children}</p>;
}

/**
 * Pequenos múltiplos com o mesmo eixo de meses: produção (t) em cima, temperatura (°C) embaixo.
 * Realizado em linha sólida, projetado tracejado; a temperatura medida pela estação é destacada
 * sobre a normal climatológica em cinza.
 */
export function HarvestChart({ points }: HarvestChartProps) {
  const syncId = useId();
  const gradientId = useId().replace(/:/g, '');
  const data = useMemo<Point[]>(() => {
    const current = points.findIndex((p) => p.projected) - 1;
    const lastRealized = current < 0 ? points.length - 1 : current;
    return points.map((p, i) => ({
      ...p,
      realized: i <= lastRealized ? p.productionT : null,
      forecast: i >= lastRealized ? p.productionT : null,
    }));
  }, [points]);
  const currentPeriod = data.find((d) => d.realized !== null && d.forecast !== null)?.period;
  const temps = data.flatMap((d) => [d.avgTemperatureC, d.measuredTemperatureC ?? d.avgTemperatureC]);
  const tempDomain: [number, number] = [Math.floor(Math.min(...temps) - 1), Math.ceil(Math.max(...temps) + 1)];

  return (
    <div className="flex h-full flex-col">
      <PanelTitle>Produção (t)</PanelTitle>
      <div className="min-h-0 flex-[1.5]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} syncId={syncId} margin={{ top: 6, right: 12, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColors.production} stopOpacity={0.14} />
                <stop offset="100%" stopColor={chartColors.production} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="period" axisLine={false} tickLine={false} tick={false} height={4} />
            {/* Área = magnitude: a base é sempre zero */}
            <YAxis axisLine={false} tickLine={false} tick={tickStyle} width={52} domain={[0, 'auto']} tickFormatter={(v: number) => `${formatInteger(v)} t`} />
            {currentPeriod && (
              <ReferenceLine
                x={currentPeriod}
                stroke={chartColors.axis}
                strokeOpacity={0.5}
                label={{ value: 'Hoje', position: 'insideTopRight', fill: chartColors.axis, fontSize: 11, fontWeight: 600 }}
              />
            )}
            <Tooltip content={<Readout />} cursor={crosshair} isAnimationActive={false} />
            <Area
              type="monotone"
              dataKey="realized"
              stroke={chartColors.production}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={{ r: 3.5, fill: chartColors.production, stroke: chartColors.surface, strokeWidth: 2 }}
              activeDot={activeDot(chartColors.production)}
              connectNulls={false}
              animationDuration={500}
            />
            <Line
              type="monotone"
              dataKey="forecast"
              stroke={chartColors.production}
              strokeWidth={2}
              strokeDasharray="6 5"
              dot={{ r: 3.5, fill: chartColors.surface, stroke: chartColors.production, strokeWidth: 2, strokeDasharray: '0' }}
              activeDot={{ ...activeDot(chartColors.production), strokeDasharray: '0' }}
              connectNulls={false}
              animationDuration={500}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <PanelTitle>Temperatura média do mês (°C)</PanelTitle>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} syncId={syncId} margin={{ top: 6, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="period" axisLine={false} tickLine={false} tick={tickStyle} height={28} dy={6} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={tickStyle}
              width={52}
              domain={tempDomain}
              allowDecimals={false}
              tickFormatter={(v: number) => `${formatInteger(v)}°`}
            />
            <Tooltip content={() => null} cursor={crosshair} isAnimationActive={false} />
            <Line
              type="monotone"
              dataKey="avgTemperatureC"
              stroke={chartColors.reference}
              strokeWidth={2}
              dot={false}
              activeDot={activeDot(chartColors.reference)}
              animationDuration={500}
            />
            <Line
              type="monotone"
              dataKey="measuredTemperatureC"
              stroke={chartColors.temperature}
              strokeWidth={2}
              dot={{ r: 4, fill: chartColors.temperature, stroke: chartColors.surface, strokeWidth: 2 }}
              activeDot={activeDot(chartColors.temperature)}
              connectNulls={false}
              animationDuration={500}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export const HARVEST_LEGEND = [
  { label: 'Produção realizada', color: chartColors.production, shape: 'line' as const },
  { label: 'Produção projetada', color: chartColors.production, shape: 'dashed' as const },
  { label: 'Temperatura medida', color: chartColors.temperature, shape: 'dot' as const },
  { label: 'Normal climatológica', color: chartColors.reference, shape: 'line' as const },
];

