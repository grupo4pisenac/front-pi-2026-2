import { useId, useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipProps } from 'recharts';
import { Clock } from 'lucide-react';
import type { ClimateAggregate } from '@/types';
import { chartColors } from '@/theme/tokens';
import { VPD_CRITICAL_KPA, vpdLevel } from '@/lib/agronomy';
import { formatDecimal, formatKpa } from '@/lib/formatters';
import { Card, CardBody, CardHeader } from '@/components/ui';
import { ChartFrame } from '@/components/charts/ChartFrame';
import { ChartLegend, DataDetails, TooltipRow, TooltipShell } from '@/components/charts/ChartParts';
import { gridProps, niceTicks, tickStyle } from '@/components/charts/chartTheme';
import { demandWindows, hourlyDemand, type HourDemand } from '../vpd';

interface IrrigationWindowCardProps {
  days: number;
  data: ClimateAggregate[] | undefined;
  isLoading: boolean;
  isRefreshing: boolean;
  isError: boolean;
  onRetry: () => void;
}

type Role = 'best' | 'peak' | 'other';

const ROLE_COLOR: Record<Role, string> = {
  best: chartColors.vpd,
  peak: chartColors.threshold,
  other: chartColors.reference,
};

const ROLE_LABEL: Record<Role, string> = {
  best: 'Melhor janela para irrigar',
  peak: 'Pico de demanda — evitar',
  other: 'Demais horas',
};

const hourLabel = (h: number) => `${String(h).padStart(2, '0')}h`;
const windowLabel = (hours: number[]) => `${hourLabel(hours[0]!)}–${hourLabel((hours[hours.length - 1]! + 1) % 24)}`;

interface BarPoint extends HourDemand {
  role: Role;
  label: string;
}

function Readout({ active, payload }: TooltipProps<number, string>) {
  const p = payload?.[0]?.payload as BarPoint | undefined;
  if (!active || !p) return null;
  return (
    <TooltipShell title={`${hourLabel(p.hour)} – ${hourLabel((p.hour + 1) % 24)}`}>
      <TooltipRow color={ROLE_COLOR[p.role]} shape="rect" label={`VPD médio · ${vpdLevel(p.vpd).label.toLowerCase()}`} value={formatKpa(p.vpd)} />
      {p.role !== 'other' && <div className="pt-1 text-xs font-semibold text-ink">{ROLE_LABEL[p.role]}</div>}
    </TooltipShell>
  );
}

/**
 * Perfil diário da demanda evaporativa (VPD médio por hora nos últimos dias) com as janelas
 * de menor e maior demanda destacadas — irrigar quando o ar "puxa" menos água reduz perdas.
 */
export function IrrigationWindowCard({ days, data, isLoading, isRefreshing, isError, onRetry }: IrrigationWindowCardProps) {
  const titleId = useId();
  const { points, windows } = useMemo(() => {
    const profile = hourlyDemand(data ?? []);
    const w = demandWindows(profile);
    const roleOf = (h: number): Role => (w?.best.includes(h) ? 'best' : w?.peak.includes(h) ? 'peak' : 'other');
    return { points: profile.map<BarPoint>((p) => ({ ...p, role: roleOf(p.hour), label: hourLabel(p.hour) })), windows: w };
  }, [data]);

  const hasData = points.length > 0;
  const yTicks = niceTicks(0, Math.max(VPD_CRITICAL_KPA + 0.5, ...points.map((p) => p.vpd)));
  const summary = windows
    ? `Gráfico de colunas do VPD médio por hora nos últimos ${days} dias. Menor demanda entre ${windowLabel(windows.best)} ` +
      `(${formatKpa(windows.bestVpd)}); maior entre ${windowLabel(windows.peak)} (${formatKpa(windows.peakVpd)}).`
    : 'Gráfico de colunas do VPD médio por hora — ainda sem as 24 horas do dia cobertas.';

  return (
    <Card aria-labelledby={titleId}>
      <CardHeader
        titleId={titleId}
        title="Melhor horário para irrigar"
        subtitle={`VPD médio (kPa) de cada hora do dia · últimos ${days} dias`}
        action={
          <ChartLegend
            items={[
              ...(['best', 'peak', 'other'] as Role[]).map((r) => ({ label: ROLE_LABEL[r], color: ROLE_COLOR[r], shape: 'rect' as const })),
              { label: 'Muito alto > 2,5', color: chartColors.critical, shape: 'dashed' as const },
            ]}
          />
        }
      />
      <CardBody>
        {windows && (
          <div className="mb-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-tile border border-border bg-brand-soft/60 px-4 py-3">
              <p className="text-label uppercase text-brand">Irrigar</p>
              <p className="mt-1 text-[15px] font-semibold text-ink">
                {windowLabel(windows.best)} <span className="text-xs font-medium text-ink-muted">· VPD médio {formatKpa(windows.bestVpd)}</span>
              </p>
              <p className="mt-0.5 text-xs text-ink-muted">Ar mais úmido e fresco: menos água perdida por evaporação.</p>
            </div>
            <div className="rounded-tile border border-border bg-accent-soft/60 px-4 py-3">
              <p className="text-label uppercase text-accent">Evitar</p>
              <p className="mt-1 text-[15px] font-semibold text-ink">
                {windowLabel(windows.peak)} <span className="text-xs font-medium text-ink-muted">· VPD médio {formatKpa(windows.peakVpd)}</span>
              </p>
              <p className="mt-0.5 text-xs text-ink-muted">Maior demanda do ar: a lâmina evapora antes de chegar às raízes.</p>
            </div>
          </div>
        )}
        <ChartFrame
          className="h-64"
          isLoading={isLoading || !data}
          isError={isError}
          onRetry={onRetry}
          isEmpty={!hasData}
          isRefreshing={isRefreshing}
          emptyIcon={Clock}
          summary={summary}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={points} margin={{ top: 6, right: 12, bottom: 0, left: 0 }} barCategoryGap={2}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={tickStyle} interval={2} height={28} dy={6} />
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
              <ReferenceLine
                y={VPD_CRITICAL_KPA}
                stroke={chartColors.critical}
                strokeDasharray="4 4"
              />
              <Tooltip content={<Readout />} cursor={{ fill: chartColors.grid, fillOpacity: 0.5 }} isAnimationActive={false} />
              <Bar dataKey="vpd" radius={[4, 4, 0, 0]} maxBarSize={24} isAnimationActive={false}>
                {points.map((p) => (
                  <Cell key={p.hour} fill={ROLE_COLOR[p.role]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartFrame>
        {hasData && (
          <DataDetails
            caption={`VPD médio por hora nos últimos ${days} dias`}
            headers={['Hora', 'VPD médio', 'Nível', 'Recomendação']}
            rows={points.map((p) => [
              `${hourLabel(p.hour)}–${hourLabel((p.hour + 1) % 24)}`,
              formatKpa(p.vpd),
              vpdLevel(p.vpd).label,
              p.role === 'other' ? '—' : ROLE_LABEL[p.role],
            ])}
          />
        )}
      </CardBody>
    </Card>
  );
}
