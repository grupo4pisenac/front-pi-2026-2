import { useId, useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  LabelList,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from 'recharts';
import { CalendarDays } from 'lucide-react';
import type { ClimateAggregate } from '@/types';
import { chartColors } from '@/theme/tokens';
import { HEAT_ATTENTION_C } from '@/lib/agronomy';
import { formatCelsius, formatDecimal, formatInteger, formatPercent } from '@/lib/formatters';
import { Card, CardBody, CardHeader } from '@/components/ui';
import { ChartFrame } from '@/components/charts/ChartFrame';
import { ChartLegend, DataDetails, InlineStat, TooltipRow, TooltipShell } from '@/components/charts/ChartParts';
import { crosshair, formatLongDay, formatWeekday, gridProps, niceTicks, tickStyle } from '@/components/charts/chartTheme';

interface DailyClimateCardProps {
  days: number;
  data: ClimateAggregate[] | undefined;
  isLoading: boolean;
  isRefreshing: boolean;
  isError: boolean;
  onRetry: () => void;
}

interface DayPoint {
  t: number;
  label: string;
  range: [number, number];
  min: number;
  avg: number;
  max: number;
  amplitude: number;
  humidity: number;
  stress: number;
  readings: number;
}

const formatHours = (h: number) => (h < 1 ? `${formatInteger(h * 60)} min` : `${formatDecimal(h)} h`);

function DayReadout({ active, payload }: TooltipProps<number, string>) {
  const d = payload?.[0]?.payload as DayPoint | undefined;
  if (!active || !d) return null;
  return (
    <TooltipShell title={formatLongDay(d.t)}>
      <TooltipRow color={chartColors.temperature} shape="rect" label="Máxima" value={formatCelsius(d.max, 1)} />
      <TooltipRow color={chartColors.temperature} shape="dot" label="Média" value={formatCelsius(d.avg, 1)} />
      <TooltipRow color={chartColors.temperature} shape="rect" label="Mínima" value={formatCelsius(d.min, 1)} />
      <TooltipRow label="Amplitude" value={formatCelsius(d.amplitude, 1)} />
      <TooltipRow label="Acima de 35 °C" value={d.stress > 0 ? formatHours(d.stress) : '—'} />
      <TooltipRow label="Umidade média" value={formatPercent(d.humidity)} />
    </TooltipShell>
  );
}

function summarize(points: DayPoint[], days: number): string {
  const hottest = points.reduce((a, b) => (b.max > a.max ? b : a));
  const widest = points.reduce((a, b) => (b.amplitude > a.amplitude ? b : a));
  const stressDays = points.filter((p) => p.stress > 0).length;
  return (
    `Gráfico de faixas diárias dos últimos ${days} dias. Máxima mais alta: ${formatCelsius(hottest.max, 1)} em ${formatLongDay(hottest.t)}. ` +
    `Maior amplitude térmica: ${formatCelsius(widest.amplitude, 1)} em ${formatLongDay(widest.t)}. ` +
    `${stressDays} dia(s) com horas acima de 35 °C.`
  );
}

/**
 * Faixa diária de temperatura (mín.–máx., ponto = média) e, abaixo, horas de estresse térmico
 * por dia. Dois gráficos com eixos próprios e o mesmo eixo de dias, sincronizados.
 */
export function DailyClimateCard({ days, data, isLoading, isRefreshing, isError, onRetry }: DailyClimateCardProps) {
  const titleId = useId();
  const syncId = useId();
  const points = useMemo<DayPoint[]>(
    () =>
      (data ?? []).map((a) => {
        const t = new Date(a.start).getTime();
        return {
          t,
          label: formatWeekday(t),
          range: [a.temperature.min, a.temperature.max],
          min: a.temperature.min,
          avg: a.temperature.avg,
          max: a.temperature.max,
          amplitude: Math.round((a.temperature.max - a.temperature.min) * 10) / 10,
          humidity: a.airHumidity.avg,
          stress: a.heatStressHours,
          readings: a.readings,
        };
      }),
    [data],
  );

  const hasData = points.length > 0;
  // niceTicks já arredonda para fora — sem folga extra, a faixa ocupa o gráfico
  const lo = hasData ? Math.min(...points.map((p) => p.min)) : 0;
  const hi = hasData ? Math.max(...points.map((p) => p.max), HEAT_ATTENTION_C) : 40;
  const totalStress = points.reduce((s, p) => s + p.stress, 0);
  const meanAmplitude = hasData ? points.reduce((s, p) => s + p.amplitude, 0) / points.length : 0;
  const peakStress = points.reduce<DayPoint | null>((a, b) => (b.stress > (a?.stress ?? 0) ? b : a), null);
  const barSize = points.length > 20 ? 10 : 18;
  const tempTicks = niceTicks(lo, hi, 5);
  const stressTicks = niceTicks(0, Math.max(2, ...points.map((p) => p.stress)), 3);

  return (
    <Card aria-labelledby={titleId}>
      <CardHeader
        titleId={titleId}
        title="Amplitude térmica diária"
        subtitle={`Mínima, média e máxima por dia · últimos ${days} dias (horário do Vale)`}
        action={
          <ChartLegend
            items={[
              { label: 'Mín.–máx. do dia', color: chartColors.temperature, shape: 'rect' },
              { label: 'Média', color: chartColors.temperature, shape: 'dot' },
              { label: 'Estresse térmico 35 °C', color: chartColors.threshold, shape: 'dashed' },
            ]}
          />
        }
      />
      <CardBody>
        {hasData && (
          <dl className="mb-5 grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3">
            <InlineStat label="Amplitude média" value={formatCelsius(meanAmplitude, 1)} />
            <InlineStat label="Dias com estresse" value={`${points.filter((p) => p.stress > 0).length} de ${points.length}`} />
            <InlineStat label="Horas ≥ 35 °C" value={formatHours(totalStress)} hint={`em ${days} dias`} />
          </dl>
        )}
        <ChartFrame
          className="h-[24rem]"
          isLoading={isLoading || !data}
          isError={isError}
          onRetry={onRetry}
          isEmpty={!hasData}
          isRefreshing={isRefreshing}
          emptyIcon={CalendarDays}
          emptyTitle="Ainda sem dias completos"
          summary={hasData ? summarize(points, days) : ''}
        >
          <div className="flex h-full flex-col">
            <div className="min-h-0 flex-[1.6]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={points} syncId={syncId} margin={{ top: 6, right: 12, bottom: 0, left: 0 }} barCategoryGap="20%">
                  <CartesianGrid {...gridProps} />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={false} height={4} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={tickStyle}
                    width={44}
                    domain={[tempTicks[0]!, tempTicks[tempTicks.length - 1]!]}
                    ticks={tempTicks}
                    interval={0}
                    tickFormatter={(v: number) => `${formatInteger(v)}°`}
                  />
                  <ReferenceLine
                    y={HEAT_ATTENTION_C}
                    stroke={chartColors.threshold}
                    strokeDasharray="4 4"
                  />
                  <Tooltip content={<DayReadout />} cursor={{ fill: chartColors.grid, fillOpacity: 0.5 }} isAnimationActive={false} />
                  <Bar dataKey="range" fill={chartColors.temperature} fillOpacity={0.45} radius={4} barSize={barSize} isAnimationActive={false} />
                  <Line
                    dataKey="avg"
                    stroke="none"
                    dot={{ r: 4, fill: chartColors.temperature, stroke: chartColors.surface, strokeWidth: 2 }}
                    activeDot={{ r: 5, fill: chartColors.temperature, stroke: chartColors.surface, strokeWidth: 2 }}
                    isAnimationActive={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <p className="mb-1 mt-4 text-xs font-medium text-ink-muted">Horas com temperatura ≥ 35 °C</p>
            <div className="min-h-0 flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={points} syncId={syncId} margin={{ top: 16, right: 12, bottom: 0, left: 0 }} barCategoryGap="20%">
                  <CartesianGrid {...gridProps} />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={tickStyle}
                    interval={points.length > 16 ? 2 : 0}
                    height={28}
                    dy={6}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={tickStyle}
                    width={44}
                    domain={[0, stressTicks[stressTicks.length - 1]!]}
                    ticks={stressTicks}
                    interval={0}
                    tickFormatter={(v: number) => `${formatInteger(v)} h`}
                  />
                  <Tooltip content={<DayReadout />} cursor={crosshair} isAnimationActive={false} />
                  <Bar dataKey="stress" fill={chartColors.threshold} radius={[4, 4, 0, 0]} barSize={barSize} isAnimationActive={false}>
                    {/* Rótulo seletivo: só o dia com mais horas de estresse */}
                    <LabelList
                      dataKey="stress"
                      position="top"
                      content={(p) => {
                        const { x, y, width, index } = p as { x?: number; y?: number; width?: number; index?: number };
                        const d = index === undefined ? undefined : points[index];
                        if (!d || d !== peakStress || d.stress <= 0 || x === undefined || y === undefined || width === undefined) return null;
                        return (
                          <text x={x + width / 2} y={y - 6} textAnchor="middle" fontSize={11} fontWeight={600} fill={chartColors.axis}>
                            {formatHours(d.stress)}
                          </text>
                        );
                      }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ChartFrame>
        {hasData && (
          <DataDetails
            caption={`Resumo diário de temperatura dos últimos ${days} dias`}
            headers={['Dia', 'Mínima', 'Média', 'Máxima', 'Amplitude', '≥ 35 °C', 'Umidade média', 'Leituras']}
            rows={[...points].reverse().map((p) => [
              formatLongDay(p.t),
              formatCelsius(p.min, 1),
              formatCelsius(p.avg, 1),
              formatCelsius(p.max, 1),
              formatCelsius(p.amplitude, 1),
              p.stress > 0 ? formatHours(p.stress) : '—',
              formatPercent(p.humidity),
              formatInteger(p.readings),
            ])}
          />
        )}
      </CardBody>
    </Card>
  );
}
