import type { ClimateReading, CropId, DashboardSummary, HarvestForecast, Plot, ThermalAlert } from '@/types';
import { USE_MOCKS, mockDelay, request } from './apiClient';
import { activeAlert, buildForecast, buildSummary, buildTodayReadings, plotsDb } from './mocks/data';

export interface DashboardService {
  getSummary(): Promise<DashboardSummary>;
  getHarvestForecast(cropId: CropId): Promise<HarvestForecast>;
  getActivePlots(): Promise<Plot[]>;
  getTodayReadings(): Promise<ClimateReading[]>;
  getActiveAlert(): Promise<ThermalAlert | null>;
}

const http: DashboardService = {
  getSummary: () => request('/dashboard/summary'),
  getHarvestForecast: (cropId) => request('/forecasts/harvest', { query: { cropId } }),
  getActivePlots: () => request('/plots', { query: { status: 'ACTIVE' } }),
  getTodayReadings: () => request('/climate/readings', { query: { range: 'today' } }),
  getActiveAlert: () => request('/alerts/active'),
};

const mock: DashboardService = {
  getSummary: () => mockDelay(buildSummary()),
  getHarvestForecast: (cropId) => mockDelay(buildForecast(cropId)),
  getActivePlots: () => mockDelay(plotsDb),
  getTodayReadings: () => mockDelay(buildTodayReadings()),
  getActiveAlert: () => mockDelay(activeAlert, 200),
};

export const dashboardService: DashboardService = USE_MOCKS ? mock : http;
