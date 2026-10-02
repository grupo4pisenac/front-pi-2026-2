import { useQuery } from '@tanstack/react-query';
import type { CropId } from '@/types';
import { dashboardService } from '@/services/dashboardService';

export const dashboardKeys = {
  summary: ['dashboard', 'summary'] as const,
  forecast: (cropId: CropId) => ['dashboard', 'forecast', cropId] as const,
  plots: ['plots', 'active'] as const,
  readings: ['climate', 'readings', 'today'] as const,
  alert: ['alerts', 'active'] as const,
};

export const useDashboardSummary = () =>
  useQuery({ queryKey: dashboardKeys.summary, queryFn: () => dashboardService.getSummary(), refetchInterval: 60_000 });

export const useHarvestForecast = (cropId: CropId) =>
  useQuery({
    queryKey: dashboardKeys.forecast(cropId),
    queryFn: () => dashboardService.getHarvestForecast(cropId),
    placeholderData: (prev) => prev,
  });

export const useActivePlots = () =>
  useQuery({ queryKey: dashboardKeys.plots, queryFn: () => dashboardService.getActivePlots() });

export const useTodayReadings = () =>
  useQuery({ queryKey: dashboardKeys.readings, queryFn: () => dashboardService.getTodayReadings(), refetchInterval: 60_000 });

export const useActiveAlert = () =>
  useQuery({ queryKey: dashboardKeys.alert, queryFn: () => dashboardService.getActiveAlert(), refetchInterval: 120_000 });
