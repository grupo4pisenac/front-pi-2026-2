export interface ClimateReading {
  id: string;
  stationId: string;
  /** ISO 8601 */
  timestamp: string;
  /** °C */
  temperature: number;
  /** % */
  soilMoisture: number;
  /** % */
  airHumidity: number;
  /** mm */
  rainfall: number;
}

export type MetricBand = 'ideal' | 'atencao' | 'critico' | 'neutro';

export interface DashboardSummary {
  projectedProductionT: number;
  /** variação % vs. ciclo anterior */
  productionChangePct: number;
  avgTemperatureC: number;
  /** diferença vs. média histórica (°C) */
  temperatureDeltaC: number;
  soilMoisturePct: number;
  rainfall7dMm: number;
  /** ISO 8601 */
  lastReadingAt: string;
}

export interface ThermalAlert {
  id: string;
  title: string;
  message: string;
  severity: 'atencao' | 'critico';
}
