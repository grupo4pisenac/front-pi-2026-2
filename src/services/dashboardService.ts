import type {
  AggregateBucket,
  ClimateAggregate,
  ClimateRange,
  ClimateReading,
  CropId,
  DashboardSummary,
  HarvestForecast,
  Plot,
  ThermalAlert,
} from '@/types';
import { mockDelay, request, withFallback } from './apiClient';
import { buildActiveAlert, buildForecast, buildSummary, plotsDb } from './mocks/data';
import { mockAggregates, mockReadings } from './mocks/climateSeries';

export interface DashboardService {
  getSummary(): Promise<DashboardSummary>;
  getHarvestForecast(cropId: CropId): Promise<HarvestForecast>;
  getActivePlots(): Promise<Plot[]>;
  getTodayReadings(): Promise<ClimateReading[]>;
  /** Série para gráfico; o back reduz para no máximo `maxPoints` pontos (média por janela) */
  getReadings(range: ClimateRange, maxPoints?: number): Promise<ClimateReading[]>;
  /** Mín./média/máx. por dia ou por hora (horário do Vale) dos últimos `days` dias, incluindo hoje */
  getAggregates(bucket: AggregateBucket, days: number): Promise<ClimateAggregate[]>;
  getActiveAlert(): Promise<ThermalAlert | null>;
}

const http: DashboardService = {
  getSummary: () => request('/dashboard/summary'),
  getHarvestForecast: (cropId) => request('/forecasts/harvest', { query: { cropId } }),
  getActivePlots: () => request('/plots', { query: { status: 'ACTIVE' } }),
  getTodayReadings: () => request('/climate/readings', { query: { range: 'today' } }),
  getReadings: (range, maxPoints) => request('/climate/readings', { query: { range, maxPoints } }),
  getAggregates: (bucket, days) => request('/climate/aggregates', { query: { bucket, days } }),
  getActiveAlert: () => request('/alerts/active'),
};

const fallback: DashboardService = {
  getSummary: () => mockDelay(buildSummary()),
  getHarvestForecast: (cropId) => mockDelay(buildForecast(cropId)),
  getActivePlots: () => mockDelay(plotsDb),
  getTodayReadings: () => mockDelay(mockReadings('today')),
  getReadings: (range, maxPoints) => mockDelay(mockReadings(range, maxPoints)),
  getAggregates: (bucket, days) => mockDelay(mockAggregates(bucket, days)),
  getActiveAlert: () => mockDelay(buildActiveAlert(), 120),
};

export const dashboardService: DashboardService = {
  getSummary: () => withFallback(() => http.getSummary(), () => fallback.getSummary()),
  getHarvestForecast: (cropId) => withFallback(() => http.getHarvestForecast(cropId), () => fallback.getHarvestForecast(cropId)),
  getActivePlots: () => withFallback(() => http.getActivePlots(), () => fallback.getActivePlots()),
  getTodayReadings: () => withFallback(() => http.getTodayReadings(), () => fallback.getTodayReadings()),
  getReadings: (range, maxPoints) => withFallback(() => http.getReadings(range, maxPoints), () => fallback.getReadings(range, maxPoints)),
  getAggregates: (bucket, days) => withFallback(() => http.getAggregates(bucket, days), () => fallback.getAggregates(bucket, days)),
  getActiveAlert: () => withFallback(() => http.getActiveAlert(), () => fallback.getActiveAlert()),
};
