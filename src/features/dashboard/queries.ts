import { useQuery } from '@tanstack/react-query';
import type { AggregateBucket, ClimateRange, CropId } from '@/types';
import { dashboardService } from '@/services/dashboardService';

/** Pontos máximos do gráfico climático — o back agrega por média acima disso */
export const CHART_MAX_POINTS = 240;

/** Leituras novas chegam do ThingSpeak a cada ~20 s (ingestão do back) */
const LIVE_REFETCH_MS = 30_000;

/** Agregados diários/horários mudam devagar — 2 min basta */
const AGGREGATES_REFETCH_MS = 120_000;

export const dashboardKeys = {
  summary: ['dashboard', 'summary'] as const,
  forecast: (cropId: CropId) => ['dashboard', 'forecast', cropId] as const,
  plots: ['plots', 'active'] as const,
  readings: ['climate', 'readings', 'today'] as const,
  series: (range: ClimateRange) => ['climate', 'readings', 'series', range] as const,
  aggregates: (bucket: AggregateBucket, days: number) => ['climate', 'aggregates', bucket, days] as const,
  alert: ['alerts', 'active'] as const,
};

export const useDashboardSummary = () =>
  useQuery({ queryKey: dashboardKeys.summary, queryFn: () => dashboardService.getSummary(), refetchInterval: LIVE_REFETCH_MS });

export const useHarvestForecast = (cropId: CropId) =>
  useQuery({
    queryKey: dashboardKeys.forecast(cropId),
    queryFn: () => dashboardService.getHarvestForecast(cropId),
    placeholderData: (prev) => prev,
  });

export const useActivePlots = () =>
  useQuery({ queryKey: dashboardKeys.plots, queryFn: () => dashboardService.getActivePlots() });

export const useTodayReadings = () =>
  useQuery({ queryKey: dashboardKeys.readings, queryFn: () => dashboardService.getTodayReadings(), refetchInterval: LIVE_REFETCH_MS });

export const useClimateSeries = (range: ClimateRange) =>
  useQuery({
    queryKey: dashboardKeys.series(range),
    queryFn: () => dashboardService.getReadings(range, CHART_MAX_POINTS),
    refetchInterval: LIVE_REFETCH_MS,
    // Mantém a série anterior visível ao trocar de período
    placeholderData: (prev) => prev,
  });

export const useClimateAggregates = (bucket: AggregateBucket, days: number) =>
  useQuery({
    queryKey: dashboardKeys.aggregates(bucket, days),
    queryFn: () => dashboardService.getAggregates(bucket, days),
    refetchInterval: AGGREGATES_REFETCH_MS,
    placeholderData: (prev) => prev,
  });

export const useActiveAlert = () =>
  useQuery({ queryKey: dashboardKeys.alert, queryFn: () => dashboardService.getActiveAlert(), refetchInterval: 120_000 });
