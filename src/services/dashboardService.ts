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
import { USE_MOCKS, mockDelay, request } from './apiClient';
import { activeAlert, buildForecast, buildSummary, plotsDb } from './mocks/data';
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

const mock: DashboardService = {
  getSummary: () => mockDelay(buildSummary()),
  getHarvestForecast: (cropId) => mockDelay(buildForecast(cropId)),
  getActivePlots: () => mockDelay(plotsDb),
  getTodayReadings: () => mockDelay(mockReadings('today')),
  getReadings: (range, maxPoints) => mockDelay(mockReadings(range, maxPoints)),
  getAggregates: (bucket, days) => mockDelay(mockAggregates(bucket, days)),
  getActiveAlert: () => mockDelay(activeAlert, 200),
};

export const dashboardService: DashboardService = USE_MOCKS ? mock : http;
