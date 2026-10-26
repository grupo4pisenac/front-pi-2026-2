import type { AggregateBucket, ClimateAggregate, ClimateRange, ClimateReading, SeriesStats } from '@/types';
import { HEAT_ATTENTION_C } from '@/lib/agronomy';

/**
 * Série sintética da estação (só temperatura e umidade do ar, como o canal real):
 * leitura a cada 10 min nos últimos 31 dias, ciclo diário do semiárido
 * (mínima ~5h, pico ~14h) e variação entre dias. Determinística por instante.
 */
const STEP_MS = 10 * 60_000;
const DAYS = 31;
const LOCAL_OFFSET_MS = -3 * 3_600_000; // UTC−3 (Petrolina/Juazeiro)
const MAX_INTERVAL_MS = 30 * 60_000;

function noise(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43_758.5453;
  return x - Math.floor(x);
}

function readingAt(t: number): ClimateReading {
  const local = new Date(t + LOCAL_OFFSET_MS);
  const hour = local.getUTCHours() + local.getUTCMinutes() / 60;
  const dayIndex = Math.floor((t + LOCAL_OFFSET_MS) / 86_400_000);
  // Dias mais quentes e mais frios se alternam em ondas de ~6 dias
  const dayBase = 30 + 3.2 * Math.sin(dayIndex / 1.9) + (noise(dayIndex) - 0.5) * 2.4;
  const daily = Math.cos(((hour - 14.5) / 24) * 2 * Math.PI); // 1 às 14h30, −1 às 2h30
  const temperature = dayBase + 5.6 * daily + (noise(t / STEP_MS) - 0.5) * 0.8;
  const airHumidity = Math.min(96, Math.max(18, 58 - 24 * daily - (dayBase - 30) * 2.2 + (noise(t / STEP_MS + 7) - 0.5) * 4));
  return {
    id: `mock_${t}`,
    stationId: 'ESP-PTR-01',
    timestamp: new Date(t).toISOString(),
    temperature: Math.round(temperature * 10) / 10,
    soilMoisture: null,
    airHumidity: Math.round(airHumidity * 10) / 10,
    rainfall: null,
  };
}

function allReadings(): ClimateReading[] {
  const end = Math.floor(Date.now() / STEP_MS) * STEP_MS;
  const start = end - DAYS * 86_400_000;
  const out: ClimateReading[] = [];
  for (let t = start; t <= end; t += STEP_MS) out.push(readingAt(t));
  return out;
}

function localMidnight(t: number): number {
  return Math.floor((t + LOCAL_OFFSET_MS) / 86_400_000) * 86_400_000 - LOCAL_OFFSET_MS;
}

function rangeStart(range: ClimateRange, now: number): number {
  if (range === '24h') return now - 86_400_000;
  if (range === '7d') return now - 7 * 86_400_000;
  if (range === '30d') return now - 30 * 86_400_000;
  return localMidnight(now);
}

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
const round = (n: number, d = 1) => Math.round(n * 10 ** d) / 10 ** d;

/** Mesmo algoritmo do back: média por janela de tempo igual */
function reduce(readings: ClimateReading[], maxPoints: number): ClimateReading[] {
  const t0 = new Date(readings[0]!.timestamp).getTime();
  const width = (new Date(readings[readings.length - 1]!.timestamp).getTime() - t0) / maxPoints || 1;
  const windows = new Map<number, ClimateReading[]>();
  for (const r of readings) {
    const i = Math.min(Math.floor((new Date(r.timestamp).getTime() - t0) / width), maxPoints - 1);
    const w = windows.get(i);
    if (w) w.push(r);
    else windows.set(i, [r]);
  }
  return [...windows.values()].map((g) => ({
    ...g[g.length - 1]!,
    timestamp: new Date(mean(g.map((r) => new Date(r.timestamp).getTime()))).toISOString(),
    temperature: round(mean(g.map((r) => r.temperature)), 2),
    airHumidity: round(mean(g.map((r) => r.airHumidity)), 2),
  }));
}

export function mockReadings(range: ClimateRange, maxPoints?: number): ClimateReading[] {
  const from = rangeStart(range, Date.now());
  const rows = allReadings().filter((r) => new Date(r.timestamp).getTime() >= from);
  return maxPoints && rows.length > maxPoints ? reduce(rows, maxPoints) : rows;
}

function stats(xs: number[]): SeriesStats {
  return { min: round(Math.min(...xs)), avg: round(mean(xs)), max: round(Math.max(...xs)) };
}

/** Início do intervalo em ISO com fuso −03:00, como o back devolve */
function localIso(t: number): string {
  return `${new Date(t + LOCAL_OFFSET_MS).toISOString().slice(0, 19)}-03:00`;
}

export function mockAggregates(bucket: AggregateBucket, days: number): ClimateAggregate[] {
  const now = Date.now();
  const from = localMidnight(now) - (days - 1) * 86_400_000;
  const size = bucket === 'hour' ? 3_600_000 : 86_400_000;
  const rows = allReadings().filter((r) => new Date(r.timestamp).getTime() >= from);

  const groups = new Map<number, { rows: ClimateReading[]; stress: number }>();
  rows.forEach((r, i) => {
    const t = new Date(r.timestamp).getTime();
    const key = Math.floor((t + LOCAL_OFFSET_MS) / size) * size - LOCAL_OFFSET_MS;
    const g = groups.get(key) ?? { rows: [], stress: 0 };
    g.rows.push(r);
    if (r.temperature >= HEAT_ATTENTION_C) {
      const next = rows[i + 1] ? new Date(rows[i + 1]!.timestamp).getTime() : now;
      g.stress += Math.min(next - t, MAX_INTERVAL_MS) / 3_600_000;
    }
    groups.set(key, g);
  });

  return [...groups.entries()]
    .sort(([a], [b]) => a - b)
    .map(([start, g]) => ({
      start: localIso(start),
      readings: g.rows.length,
      temperature: stats(g.rows.map((r) => r.temperature)),
      airHumidity: stats(g.rows.map((r) => r.airHumidity)),
      heatStressHours: round(g.stress, 2),
    }));
}
