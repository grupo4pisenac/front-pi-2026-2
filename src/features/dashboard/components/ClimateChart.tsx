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
import type { ClimateRange, ClimateReading } from '@/types';
import { chartColors } from '@/theme/tokens';
import { FUNGAL_RISK_HUMIDITY_PCT, HEAT_ATTENTION_C, HEAT_CRITICAL_C } from '@/lib/agronomy';
import { formatCelsius, formatInteger, formatPercent } from '@/lib/formatters';
import { cn } from '@/lib/cn';
import { SeriesKey, TooltipRow, TooltipShell } from '@/components/charts/ChartParts';
import { activeDot, crosshair, formatDayTick, formatFullDateTime, formatHourTick, gridProps, niceTicks, tickStyle } from '@/components/charts/chartTheme';

interface ClimateChartProps {
  readings: ClimateReading[];
  range: ClimateRange;
  /** [início, fim] do período em ms — o eixo mostra o período inteiro, não só onde há dado */
  domain: [number, number];
}

interface ChartPoint {
  t: number;
  temperature: number;
  airHumidity: number;
}

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const LOCAL_OFFSET = -3 * HOUR;

/** Marcas do eixo alinhadas ao relógio do Vale: a cada 3 h, a cada dia ou a cada 5 dias */
export function timeTicks(range: ClimateRange, [from, to]: [number, number]): number[] {
  const step = range === 'today' || range === '24h' ? 3 * HOUR : range === '7d' ? DAY : 5 * DAY;
  const align = range === 'today' || range === '24h' ? 3 * HOUR : DAY;
  const first = Math.ceil((from + LOCAL_OFFSET) / align) * align - LOCAL_OFFSET;
  const ticks: number[] = [];
  for (let t = first; t <= to; t += step) ticks.push(t);
  return ticks;
}

const isShortRange = (range: ClimateRange) => range === 'today' || range === '24h';

function Readout({ active, payload }: TooltipProps<number, string>) {
  const p = payload?.[0]?.payload as ChartPoint | undefined;
  if (!active || !p) return null;
  return (
    <TooltipShell title={formatFullDateTime(p.t)}>
      <TooltipRow color={chartColors.temperature} label="Temperatura" value={formatCelsius(p.temperature, 1)} />
      <TooltipRow color={chartColors.humidity} label="Umidade do ar" value={formatPercent(p.airHumidity)} />
    </TooltipShell>
  );
}

/** Domínio de temperatura com folga; estende até o limiar quando a série chega perto dele */
function temperatureDomain(data: ChartPoint[]): [number, number] {
  const temps = data.map((d) => d.temperature);
  let lo = Math.floor(Math.min(...temps) - 1);
  let hi = Math.ceil(Math.max(...temps) + 1);
  if (hi >= HEAT_ATTENTION_C - 2) hi = Math.max(hi, HEAT_ATTENTION_C + 1);
  if (hi >= HEAT_CRITICAL_C - 1) hi = Math.max(hi, HEAT_CRITICAL_C + 1);
  if (hi - lo < 6) lo = hi - 6;
  return [lo, hi];
}

interface Threshold {
  label: string;
  color: string;
}

/**
 * Título do painel (a única série dele) + chaves tracejadas dos limiares.
 * Os limiares ficam aqui, fora da área de dados, para nenhum rótulo cruzar a linha.
 */
function PanelTitle({ color, className, children, thresholds = [] }: { color: string; className?: string; children: string; thresholds?: Threshold[] }) {
  return (
    <div className={cn('mb-1 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs font-medium text-ink-muted', className)}>
      <p className="flex items-center gap-2">
        <SeriesKey color={color} />
        {children}
      </p>
      {thresholds.length > 0 && (
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {thresholds.map((t) => (
            <li key={t.label} className="flex items-center gap-1.5">
              <SeriesKey color={t.color} shape="dashed" />
              {t.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Pequenos múltiplos sincronizados: temperatura (°C) em cima e umidade do ar (%) embaixo,
 * cada um com o próprio eixo — nunca dois eixos Y no mesmo gráfico.
 * O cursor percorre os dois painéis juntos e um único tooltip lista as duas grandezas.
 */
export function ClimateChart({ readings, range, domain }: ClimateChartProps) {
  const syncId = useId();
  const tempGradient = useId().replace(/:/g, '');
  const humGradient = useId().replace(/:/g, '');
  const data = useMemo<ChartPoint[]>(
    () => readings.map((r) => ({ t: new Date(r.timestamp).getTime(), temperature: r.temperature, airHumidity: r.airHumidity })),
    [readings],
  );
  const ticks = useMemo(() => timeTicks(range, domain), [range, domain]);
  const formatTick = isShortRange(range) ? formatHourTick : formatDayTick;
  const tTicks = niceTicks(...temperatureDomain(data));
  const tDomain: [number, number] = [tTicks[0]!, tTicks[tTicks.length - 1]!];
  const showDots = data.length <= 30;
  const xAxis = (visible: boolean) => (
    <XAxis
      dataKey="t"
      type="number"
      scale="time"
      domain={domain}
      ticks={ticks}
      tickFormatter={formatTick}
      axisLine={false}
      tickLine={false}
      tick={visible ? tickStyle : false}
      height={visible ? 28 : 4}
      dy={6}
    />
  );

  return (
    <div className="flex h-full flex-col">
      <PanelTitle
        color={chartColors.temperature}
        thresholds={[
          ...(tDomain[1] > HEAT_ATTENTION_C ? [{ label: 'Estresse térmico 35 °C', color: chartColors.threshold }] : []),
          ...(tDomain[1] > HEAT_CRITICAL_C ? [{ label: 'Crítico 38 °C', color: chartColors.critical }] : []),
        ]}
      >
        Temperatura (°C)
      </PanelTitle>
      <div className="min-h-0 flex-[1.15]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} syncId={syncId} margin={{ top: 6, right: 12, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={tempGradient} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColors.temperature} stopOpacity={0.14} />
                <stop offset="100%" stopColor={chartColors.temperature} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid {...gridProps} />
            {xAxis(false)}
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={tickStyle}
              width={44}
              domain={tDomain}
              ticks={tTicks}
              interval={0}
              tickFormatter={(v: number) => `${formatInteger(v)}°`}
            />
            {tDomain[1] > HEAT_ATTENTION_C && (
              <ReferenceLine y={HEAT_ATTENTION_C} stroke={chartColors.threshold} strokeDasharray="4 4" />
            )}
            {tDomain[1] > HEAT_CRITICAL_C && (
              <ReferenceLine y={HEAT_CRITICAL_C} stroke={chartColors.critical} strokeDasharray="4 4" />
            )}
            <Tooltip content={<Readout />} cursor={crosshair} isAnimationActive={false} />
            <Area
              type="monotone"
              dataKey="temperature"
              name="Temperatura"
              stroke={chartColors.temperature}
              strokeWidth={2}
              fill={`url(#${tempGradient})`}
              baseValue={tDomain[0]}
              dot={showDots ? activeDot(chartColors.temperature) : false}
              activeDot={activeDot(chartColors.temperature)}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <PanelTitle color={chartColors.humidity} className="mt-4" thresholds={[{ label: 'Risco de fungos ≥ 80%', color: chartColors.humidity }]}>
        Umidade do ar (%)
      </PanelTitle>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} syncId={syncId} margin={{ top: 6, right: 12, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={humGradient} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColors.humidity} stopOpacity={0.12} />
                <stop offset="100%" stopColor={chartColors.humidity} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid {...gridProps} />
            {xAxis(true)}
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={tickStyle}
              width={44}
              domain={[0, 100]}
              ticks={[0, 50, 100]}
              tickFormatter={(v: number) => `${formatInteger(v)}%`}
            />
            <ReferenceLine
              y={FUNGAL_RISK_HUMIDITY_PCT}
              stroke={chartColors.humidity}
              strokeOpacity={0.6}
              strokeDasharray="4 4"
            />
            {/* O tooltip completo fica no painel de cima; aqui só o cursor sincronizado */}
            <Tooltip content={() => null} cursor={crosshair} isAnimationActive={false} />
            <Area
              type="monotone"
              dataKey="airHumidity"
              name="Umidade do ar"
              stroke={chartColors.humidity}
              strokeWidth={2}
              fill={`url(#${humGradient})`}
              dot={showDots ? activeDot(chartColors.humidity) : false}
              activeDot={activeDot(chartColors.humidity)}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
