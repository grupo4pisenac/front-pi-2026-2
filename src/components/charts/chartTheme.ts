import { chartColors } from '@/theme/tokens';

/** Texto dos eixos: tinta suave, números alinhados */
export const tickStyle = { fill: chartColors.axis, fontSize: 12, fontFamily: 'inherit', fontVariantNumeric: 'tabular-nums' };

/** Grade: linha fina e sólida, um tom acima da superfície (nunca tracejada) */
export const gridProps = { vertical: false, stroke: chartColors.grid, strokeWidth: 1 } as const;

/** Cursor do tooltip: linha vertical fina que acompanha o ponteiro */
export const crosshair = { stroke: chartColors.axis, strokeWidth: 1, strokeOpacity: 0.5 };

/** Marcador ≥ 8 px com anel de 2 px da cor da superfície */
export const activeDot = (color: string) => ({ r: 4, fill: color, stroke: chartColors.surface, strokeWidth: 2 });

const LOCALE = 'pt-BR';
const hourFmt = new Intl.DateTimeFormat(LOCALE, { hour: '2-digit', minute: '2-digit', timeZone: 'America/Recife' });
const dayFmt = new Intl.DateTimeFormat(LOCALE, { day: '2-digit', month: '2-digit', timeZone: 'America/Recife' });
const weekdayFmt = new Intl.DateTimeFormat(LOCALE, { weekday: 'short', day: '2-digit', timeZone: 'America/Recife' });
const fullFmt = new Intl.DateTimeFormat(LOCALE, {
  weekday: 'short',
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Recife',
});
const longDayFmt = new Intl.DateTimeFormat(LOCALE, { weekday: 'long', day: '2-digit', month: 'long', timeZone: 'America/Recife' });

/** Horário do Vale (UTC−3), independente do fuso do navegador */
export const formatHourTick = (t: number) => hourFmt.format(t);
export const formatDayTick = (t: number) => dayFmt.format(t);
export const formatWeekday = (t: number) => weekdayFmt.format(t).replace('.', '');
export const formatFullDateTime = (t: number) => fullFmt.format(t);
export const formatLongDay = (t: number) => longDayFmt.format(t);

/** Hora do instante no relógio do Vale (UTC−3), 0–23 */
export function localHour(t: number): number {
  return new Date(t - 3 * 3_600_000).getUTCHours();
}

/** Marcas "redondas" (passo 1, 2, 2,5, 5 ×10ⁿ) cobrindo [lo, hi] em ~`target` intervalos */
export function niceTicks(lo: number, hi: number, target = 4): number[] {
  const raw = (hi - lo) / target || 1;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = ([1, 2, 2.5, 5, 10].find((m) => m * mag >= raw) ?? 10) * mag;
  const ticks: number[] = [];
  for (let t = Math.floor(lo / step) * step; t <= hi + step * 1e-9; t += step) ticks.push(Math.round(t * 100) / 100);
  if (ticks[ticks.length - 1]! < hi) ticks.push(ticks[ticks.length - 1]! + step);
  return ticks;
}
