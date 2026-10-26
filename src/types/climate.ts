export interface ClimateReading {
  id: string;
  stationId: string;
  /** ISO 8601 */
  timestamp: string;
  /** °C */
  temperature: number;
  /** % — null quando a estação não mede umidade do solo */
  soilMoisture: number | null;
  /** % */
  airHumidity: number;
  /** mm — null quando a estação não mede chuva */
  rainfall: number | null;
}

/** Períodos aceitos por GET /climate/readings?range= */
export type ClimateRange = 'today' | '24h' | '7d' | '30d';

export type MetricBand = 'ideal' | 'atencao' | 'critico' | 'neutro';

/** Campos climáticos são null enquanto não houver leitura (ou se o sensor não mede a grandeza). */
export interface DashboardSummary {
  projectedProductionT: number;
  /** variação % vs. ciclo anterior */
  productionChangePct: number;
  /** média das últimas 24 h */
  avgTemperatureC: number | null;
  /** diferença vs. média de 30 dias (°C) */
  temperatureDeltaC: number | null;
  /** média das últimas 24 h */
  airHumidityPct: number | null;
  soilMoisturePct: number | null;
  rainfall7dMm: number | null;
  /** ISO 8601 */
  lastReadingAt: string | null;
}

export interface ThermalAlert {
  id: string;
  title: string;
  message: string;
  severity: 'atencao' | 'critico';
}

/** Mínimo, média e máximo dentro do intervalo agregado */
export interface SeriesStats {
  min: number;
  avg: number;
  max: number;
}

/** Agrupamento de GET /climate/aggregates */
export type AggregateBucket = 'day' | 'hour';

/** Um dia ou uma hora (horário do Vale, UTC−3) — GET /climate/aggregates */
export interface ClimateAggregate {
  /** ISO 8601 com fuso −03:00 — início do intervalo */
  start: string;
  readings: number;
  temperature: SeriesStats;
  airHumidity: SeriesStats;
  /** horas com temperatura ≥ 35 °C */
  heatStressHours: number;
}
