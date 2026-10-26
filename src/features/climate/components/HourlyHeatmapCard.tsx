import { useId, useMemo, useRef, useState } from 'react';
import { Grid3x3 } from 'lucide-react';
import type { ClimateAggregate } from '@/types';
import { heatRamp } from '@/theme/tokens';
import { HEAT_ATTENTION_C } from '@/lib/agronomy';
import { formatCelsius, formatDecimal, formatPercent } from '@/lib/formatters';
import { Card, CardBody, CardHeader } from '@/components/ui';
import { ChartFrame } from '@/components/charts/ChartFrame';
import { DataDetails, InlineStat, TooltipRow, TooltipShell } from '@/components/charts/ChartParts';
import { formatLongDay, formatWeekday, localHour } from '@/components/charts/chartTheme';

interface HourlyHeatmapCardProps {
  days: number;
  data: ClimateAggregate[] | undefined;
  isLoading: boolean;
  isRefreshing: boolean;
  isError: boolean;
  onRetry: () => void;
}

interface Cell {
  t: number;
  hour: number;
  temp: number;
  humidity: number;
  readings: number;
}

interface Row {
  dayStart: number;
  cells: (Cell | undefined)[];
}

const HOURS = Array.from({ length: 24 }, (_, h) => h);
const DAY = 86_400_000;
const LOCAL_OFFSET = -3 * 3_600_000;
const hourLabel = (h: number) => `${String(h).padStart(2, '0')}h`;

/** Classes iguais entre mínimo e máximo do período — 5 tons de um só matiz */
function binsFor(min: number, max: number) {
  const step = Math.max((max - min) / heatRamp.length, 0.1);
  return heatRamp.map((color, i) => ({ color, from: min + i * step, to: i === heatRamp.length - 1 ? max : min + (i + 1) * step }));
}

function colorFor(temp: number, bins: ReturnType<typeof binsFor>): string {
  return (bins.find((b) => temp <= b.to) ?? bins[bins.length - 1]!).color;
}

/**
 * Mapa de calor: linhas = dias, colunas = horas (horário do Vale), cor = temperatura média da hora.
 * Mostra em que horas o calor se concentra — base para escalonar irrigação e colheita.
 */
export function HourlyHeatmapCard({ days, data, isLoading, isRefreshing, isError, onRetry }: HourlyHeatmapCardProps) {
  const titleId = useId();
  const [hover, setHover] = useState<{ cell: Cell; x: number; y: number } | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  const { rows, bins, profile } = useMemo(() => {
    const cells: Cell[] = (data ?? []).map((a) => {
      const t = new Date(a.start).getTime();
      return { t, hour: localHour(t), temp: a.temperature.avg, humidity: a.airHumidity.avg, readings: a.readings };
    });
    const byDay = new Map<number, Row>();
    for (const c of cells) {
      const dayStart = Math.floor((c.t + LOCAL_OFFSET) / DAY) * DAY - LOCAL_OFFSET;
      const row = byDay.get(dayStart) ?? { dayStart, cells: Array<Cell | undefined>(24).fill(undefined) };
      row.cells[c.hour] = c;
      byDay.set(dayStart, row);
    }
    const temps = cells.map((c) => c.temp);
    // Perfil médio por hora (todas as datas) — horário mais quente e mais fresco
    const perHour = HOURS.map((h) => {
      const xs = cells.filter((c) => c.hour === h).map((c) => c.temp);
      return xs.length ? { hour: h, temp: xs.reduce((a, b) => a + b, 0) / xs.length } : null;
    }).filter((x): x is { hour: number; temp: number } => x !== null);
    return {
      rows: [...byDay.values()].sort((a, b) => a.dayStart - b.dayStart),
      bins: temps.length ? binsFor(Math.min(...temps), Math.max(...temps)) : [],
      profile: perHour.length
        ? {
            hottest: perHour.reduce((a, b) => (b.temp > a.temp ? b : a)),
            coolest: perHour.reduce((a, b) => (b.temp < a.temp ? b : a)),
            stressHours: perHour.filter((p) => p.temp >= HEAT_ATTENTION_C).map((p) => p.hour),
          }
        : null,
    };
  }, [data]);

  const hasData = rows.length > 0 && profile !== null;
  const summary = profile
    ? `Mapa de calor de temperatura por hora nos últimos ${days} dias. Hora mais quente em média: ${hourLabel(profile.hottest.hour)} ` +
      `(${formatCelsius(profile.hottest.temp, 1)}); mais fresca: ${hourLabel(profile.coolest.hour)} (${formatCelsius(profile.coolest.temp, 1)}).`
    : '';

  return (
    <Card aria-labelledby={titleId}>
      <CardHeader
        titleId={titleId}
        title="Padrão horário de temperatura"
        subtitle={`Média de cada hora · últimos ${days} dias (horário do Vale)`}
      />
      <CardBody>
        {profile && (
          <dl className="mb-5 grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3">
            <InlineStat label="Hora mais quente" value={hourLabel(profile.hottest.hour)} hint={formatCelsius(profile.hottest.temp, 1)} />
            <InlineStat label="Hora mais fresca" value={hourLabel(profile.coolest.hour)} hint={formatCelsius(profile.coolest.temp, 1)} />
            <InlineStat
              label="Horário de estresse"
              value={
                profile.stressHours.length
                  ? `${hourLabel(profile.stressHours[0]!)}–${hourLabel(profile.stressHours[profile.stressHours.length - 1]! + 1)}`
                  : 'Nenhum na média'
              }
            />
          </dl>
        )}
        <ChartFrame
          className="h-auto"
          isLoading={isLoading || !data}
          isError={isError}
          onRetry={onRetry}
          isEmpty={!hasData}
          isRefreshing={isRefreshing}
          emptyIcon={Grid3x3}
          summary={summary}
        >
          <div ref={frameRef} className="relative" onMouseLeave={() => setHover(null)}>
            <div className="overflow-x-auto">
            <div className="grid min-w-[34rem] gap-[2px]" style={{ gridTemplateColumns: '4.5rem repeat(24, minmax(0, 1fr))' }}>
              <span />
              {HOURS.map((h) => (
                <span key={h} className="pb-1 text-center text-[11px] tabular-nums text-ink-subtle">
                  {h % 3 === 0 ? hourLabel(h) : ''}
                </span>
              ))}
              {rows.map((row) => (
                <div key={row.dayStart} className="contents">
                  <span className="flex items-center pr-2 text-xs font-medium capitalize text-ink-muted">{formatWeekday(row.dayStart)}</span>
                  {row.cells.map((c, h) =>
                    c ? (
                      <span
                        key={h}
                        className="h-7 rounded-[4px] transition-[filter] duration-100 hover:brightness-110"
                        style={{ background: colorFor(c.temp, bins), outline: hover?.cell === c ? '2px solid #1F2A22' : undefined }}
                        onMouseEnter={(e) => {
                          const box = frameRef.current?.getBoundingClientRect();
                          const r = e.currentTarget.getBoundingClientRect();
                          const x = r.left - (box?.left ?? 0) + r.width / 2;
                          // Mantém o tooltip (~200 px) dentro do cartão
                          const clamped = Math.min(Math.max(x, 100), (box?.width ?? x) - 100);
                          setHover({ cell: c, x: clamped, y: r.top - (box?.top ?? 0) });
                        }}
                      />
                    ) : (
                      <span key={h} className="h-7 rounded-[4px] bg-neutral-soft" title="Sem leitura" />
                    ),
                  )}
                </div>
              ))}
            </div>
            </div>
            {hover && (
              <div
                className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full pb-2"
                style={{ left: hover.x, top: hover.y }}
              >
                <TooltipShell title={`${formatLongDay(hover.cell.t)} · ${hourLabel(hover.cell.hour)}`}>
                  <TooltipRow color={colorFor(hover.cell.temp, bins)} shape="rect" label="Temperatura média" value={formatCelsius(hover.cell.temp, 1)} />
                  <TooltipRow label="Umidade do ar" value={formatPercent(hover.cell.humidity)} />
                </TooltipShell>
              </div>
            )}
          </div>
          {/* Escala: 5 classes com faixa de valores (cor nunca é o único canal — há tabela abaixo) */}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-muted">
            <span className="font-medium">Temperatura média</span>
            <ul className="flex flex-wrap gap-x-3 gap-y-1.5">
              {bins.map((b) => (
                <li key={b.color} className="flex items-center gap-1.5 tabular-nums">
                  <span aria-hidden className="h-2.5 w-4 rounded-[3px]" style={{ background: b.color }} />
                  {formatDecimal(b.from)}–{formatDecimal(b.to)} °C
                </li>
              ))}
              <li className="flex items-center gap-1.5">
                <span aria-hidden className="h-2.5 w-4 rounded-[3px] bg-neutral-soft" />
                sem leitura
              </li>
            </ul>
          </div>
        </ChartFrame>
        {hasData && (
          <DataDetails
            caption={`Temperatura média por hora dos últimos ${days} dias`}
            headers={['Dia', 'Hora', 'Temperatura média', 'Umidade média', 'Leituras']}
            rows={rows
              .slice()
              .reverse()
              .flatMap((r) =>
                r.cells
                  .filter((c): c is Cell => c !== undefined)
                  .map((c) => [formatLongDay(r.dayStart), hourLabel(c.hour), formatCelsius(c.temp, 1), formatPercent(c.humidity), String(c.readings)]),
              )}
          />
        )}
      </CardBody>
    </Card>
  );
}
