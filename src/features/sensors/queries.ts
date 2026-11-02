import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { StationInput } from '@/types';
import { stationsService } from '@/services/stationsService';

export const stationKeys = {
  all: ['stations'] as const,
  list: ['stations', 'list'] as const,
  health: ['stations', 'health'] as const,
};

export const useStations = () =>
  useQuery({ queryKey: stationKeys.list, queryFn: () => stationsService.list(), refetchInterval: 60_000 });

export const useNetworkHealth = () =>
  useQuery({ queryKey: stationKeys.health, queryFn: () => stationsService.getHealth(), refetchInterval: 60_000 });

export function useSaveStation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id?: string; input: StationInput }) =>
      id ? stationsService.update(id, input) : stationsService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: stationKeys.all }),
  });
}

export function useDeleteStation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => stationsService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: stationKeys.all }),
  });
}
