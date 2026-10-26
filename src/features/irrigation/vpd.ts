import type { ClimateAggregate, ClimateReading } from '@/types';
import { dewPoint, vaporPressureDeficit } from '@/lib/agronomy';
import { localHour } from '@/components/charts/chartTheme';

export interface VpdPoint {
  t: number;
  vpd: number;
  temperature: number;
  airHumidity: number;
  dewPoint: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function toVpdSeries(readings: ClimateReading[]): VpdPoint[] {
  return readings.map((r) => ({
    t: new Date(r.timestamp).getTime(),
    vpd: round2(vaporPressureDeficit(r.temperature, r.airHumidity)),
    temperature: r.temperature,
    airHumidity: r.airHumidity,
    dewPoint: Math.round(dewPoint(r.temperature, r.airHumidity) * 10) / 10,
  }));
}

/**
 * Tempo (h) em que o VPD satisfaz a condição. Cada ponto vale até o próximo, limitado a
 * 30 min ou 1,5× o passo médio da série (séries longas chegam reduzidas pelo back) —
 * lacunas maiores são falhas de transmissão e não contam.
 */
export function hoursWhere(series: VpdPoint[], test: (vpd: number) => boolean): number {
  if (series.length < 2) return 0;
  const avgStep = (series[series.length - 1]!.t - series[0]!.t) / (series.length - 1);
  const cap = Math.max(30 * 60_000, avgStep * 1.5);
  let ms = 0;
  series.forEach((p, i) => {
    const next = series[i + 1]?.t ?? p.t;
    if (test(p.vpd)) ms += Math.min(next - p.t, cap);
  });
  return ms / 3_600_000;
}

export interface HourDemand {
  hour: number;
  vpd: number;
  days: number;
}

/** VPD médio de cada hora do dia (0–23) a partir dos agregados horários dos últimos dias */
export function hourlyDemand(aggregates: ClimateAggregate[]): HourDemand[] {
  const byHour = new Map<number, number[]>();
  for (const a of aggregates) {
    const h = localHour(new Date(a.start).getTime());
    byHour.set(h, [...(byHour.get(h) ?? []), vaporPressureDeficit(a.temperature.avg, a.airHumidity.avg)]);
  }
  return [...byHour.entries()]
    .sort(([a], [b]) => a - b)
    .map(([hour, xs]) => ({ hour, vpd: round2(xs.reduce((s, x) => s + x, 0) / xs.length), days: xs.length }));
}

export interface DemandWindows {
  /** Horas consecutivas de menor demanda — melhor momento para irrigar */
  best: number[];
  /** Horas consecutivas de maior demanda — evitar irrigação (perdas por evaporação) */
  peak: number[];
  bestVpd: number;
  peakVpd: number;
}

/** Janela de `size` horas consecutivas (circular, atravessa a meia-noite) com menor e maior VPD médio */
export function demandWindows(profile: HourDemand[], size = 3): DemandWindows | null {
  if (profile.length < 24) return null;
  const vpdAt = (h: number) => profile.find((p) => p.hour === h % 24)!.vpd;
  let best = 0;
  let peak = 0;
  let bestSum = Infinity;
  let peakSum = -Infinity;
  for (let start = 0; start < 24; start++) {
    let sum = 0;
    for (let k = 0; k < size; k++) sum += vpdAt(start + k);
    if (sum < bestSum) [bestSum, best] = [sum, start];
    if (sum > peakSum) [peakSum, peak] = [sum, start];
  }
  const range = (start: number) => Array.from({ length: size }, (_, k) => (start + k) % 24);
  return { best: range(best), peak: range(peak), bestVpd: round2(bestSum / size), peakVpd: round2(peakSum / size) };
}
