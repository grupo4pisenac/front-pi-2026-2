import { useId } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from 'recharts';
import type { HarvestForecastPoint } from '@/types';
import { chartColors } from '@/theme/tokens';
import { formatCelsius, formatInteger, formatTons } from '@/lib/formatters';

interface HarvestChartProps {
  points: HarvestForecastPoint[];
}

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload as HarvestForecastPoint | undefined;
  if (!point) return null;
  return (
    <div className="rounded-tile border border-border bg-surface px-3.5 py-2.5 shadow-pop">
      <p className="text-xs font-semibold text-ink">
        {label} {point.projected && <span className="font-medium text-ink-subtle">· projetado</span>}
      </p>
      <dl className="mt-1.5 space-y-1 text-xs">
        <div className="flex items-center gap-2">
          <span aria-hidden className="h-0.5 w-3 rounded-full bg-brand" />
          <dt className="text-ink-muted">Produção</dt>
          <dd className="ml-auto pl-4 font-semibold tabular-nums text-ink">{formatTons(point.productionT)}</dd>
        </div>
        <div className="flex items-center gap-2">
          <span aria-hidden className="h-0.5 w-3 rounded-full bg-accent-vivid" />
          <dt className="text-ink-muted">Temperatura</dt>
          <dd className="ml-auto pl-4 font-semibold tabular-nums text-ink">{formatCelsius(point.avgTemperatureC, 1)}</dd>
        </div>
      </dl>
    </div>
  );
}

/**
 * Produção (área + linha sólida, eixo esquerdo visível) e temperatura (linha tracejada,
 * eixo direito oculto — escala implícita). Valores reais da temperatura ficam no tooltip
 * e no resumo textual, então nenhuma leitura depende do eixo oculto.
 */
export function HarvestChart({ points }: HarvestChartProps) {
  const gradientId = useId().replace(/:/g, '');
  const tickStyle = { fill: chartColors.axis, fontSize: 12, fontFamily: 'inherit' };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={chartColors.production} stopOpacity={0.18} />
            <stop offset="100%" stopColor={chartColors.production} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={chartColors.grid} strokeDasharray="4 4" />
        <XAxis dataKey="period" axisLine={false} tickLine={false} tick={tickStyle} dy={8} />
        <YAxis
          yAxisId="prod"
          axisLine={false}
          tickLine={false}
          tick={tickStyle}
          width={48}
          tickFormatter={(v: number) => `${formatInteger(v)} t`}
        />
        <YAxis yAxisId="temp" orientation="right" hide domain={['dataMin - 4', 'dataMax + 2']} />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: chartColors.grid, strokeWidth: 1 }} />
        <Area
          yAxisId="prod"
          type="monotone"
          dataKey="productionT"
          name="Produção projetada"
          stroke={chartColors.production}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          dot={{ r: 4, fill: chartColors.surface, stroke: chartColors.production, strokeWidth: 2 }}
          activeDot={{ r: 5, fill: chartColors.production, stroke: chartColors.surface, strokeWidth: 2 }}
          animationDuration={600}
        />
        <Line
          yAxisId="temp"
          type="monotone"
          dataKey="avgTemperatureC"
          name="Temperatura média"
          stroke={chartColors.temperature}
          strokeWidth={2}
          strokeDasharray="6 5"
          dot={false}
          activeDot={{ r: 4, fill: chartColors.temperature, stroke: chartColors.surface, strokeWidth: 2 }}
          animationDuration={600}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
