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
import { ApiError, USE_MOCKS, isOfflineError, mockDelay, request, withFallback } from './apiClient';
import { PRODUCTION_BY_CROP, buildActiveAlert, buildForecast, buildSummary, plotsDb } from './mocks/data';
import { mockAggregates, mockReadings } from './mocks/climateSeries';

export interface DashboardService {
  getSummary(): Promise<DashboardSummary>;
  getHarvestForecast(cropId: CropId): Promise<HarvestForecast>;
    /** Grava a produção mensal (12 valores, Jan..Dez, em t). Exige forecast:write (Analista e Admin). */
  updateHarvestForecast(cropId: CropId, monthlyProductionT: number[]): Promise<HarvestForecast>;
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
  updateHarvestForecast: (cropId, monthlyProductionT) =>
    request(`/forecasts/harvest/${cropId}`, { method: 'PUT', body: { monthlyProductionT } }),
  getActivePlots: () => request('/plots', { query: { status: 'ACTIVE' } }),
  getTodayReadings: () => request('/climate/readings', { query: { range: 'today' } }),
  getReadings: (range, maxPoints) => request('/climate/readings', { query: { range, maxPoints } }),
  getAggregates: (bucket, days) => request('/climate/aggregates', { query: { bucket, days } }),
  getActiveAlert: () => request('/alerts/active'),
};

const fallback: DashboardService = {
  getSummary: () => mockDelay(buildSummary()),
  getHarvestForecast: (cropId) => mockDelay(buildForecast(cropId)),
  updateHarvestForecast: (cropId, monthlyProductionT) => {
    PRODUCTION_BY_CROP[cropId] = [...monthlyProductionT];
    return mockDelay(buildForecast(cropId), 300);
  },
  getActivePlots: () => mockDelay(plotsDb),
  getTodayReadings: () => mockDelay(mockReadings('today')),
  getReadings: (range, maxPoints) => mockDelay(mockReadings(range, maxPoints)),
  getAggregates: (bucket, days) => mockDelay(mockAggregates(bucket, days)),
  getActiveAlert: () => mockDelay(buildActiveAlert(), 120),
};

export const dashboardService: DashboardService = {
  getSummary: () => withFallback(() => http.getSummary(), () => fallback.getSummary()),
  getHarvestForecast: (cropId) => withFallback(() => http.getHarvestForecast(cropId), () => fallback.getHarvestForecast(cropId)),
  // Escrita não cai no mock com o back real: fingir que salvou esconderia a falha
  updateHarvestForecast: async (cropId, monthlyProductionT) => {
    if (USE_MOCKS) return fallback.updateHarvestForecast(cropId, monthlyProductionT);
    try {
      return await http.updateHarvestForecast(cropId, monthlyProductionT);
    } catch (err) {
      if (isOfflineError(err)) throw new ApiError(503, 'Servidor indisponível no momento. Tente novamente em instantes.');
      throw err;
    }
  },  
  getActivePlots: () => withFallback(() => http.getActivePlots(), () => fallback.getActivePlots()),
  getTodayReadings: () => withFallback(() => http.getTodayReadings(), () => fallback.getTodayReadings()),
  getReadings: (range, maxPoints) => withFallback(() => http.getReadings(range, maxPoints), () => fallback.getReadings(range, maxPoints)),
  getAggregates: (bucket, days) => withFallback(() => http.getAggregates(bucket, days), () => fallback.getAggregates(bucket, days)),
  getActiveAlert: () => withFallback(() => http.getActiveAlert(), () => fallback.getActiveAlert()),
};
