import type { NetworkHealth, Station, StationInput } from '@/types';
import { USE_MOCKS, mockDelay, request } from './apiClient';
import { stationsDb } from './mocks/data';

export interface StationsService {
  list(): Promise<Station[]>;
  getHealth(): Promise<NetworkHealth>;
  create(input: StationInput): Promise<Station>;
}

const http: StationsService = {
  list: () => request('/stations'),
  getHealth: () => request('/stations/health'),
  create: (input) => request('/stations', { method: 'POST', body: input }),
};

function computeHealth(stations: Station[]): NetworkHealth {
  const active = stations.filter((s) => s.status === 'ATIVO').length;
  const attention = stations.filter((s) => s.status === 'ATENCAO').length;
  return {
    total: stations.length,
    online: active + attention,
    active,
    attention,
    inactive: stations.length - active - attention,
    lastSyncAt: new Date(Date.now() - 60_000).toISOString(),
  };
}

const mock: StationsService = {
  list: () => mockDelay(stationsDb),
  getHealth: () => mockDelay(computeHealth(stationsDb)),
  create: (input) => {
    // Posiciona o novo pin dentro da área do município escolhido
    const isPetrolina = input.municipality === 'PETROLINA';
    const station: Station = {
      ...input,
      position: {
        x: (isPetrolina ? 18 : 68) + Math.random() * 16,
        y: (isPetrolina ? 48 : 28) + Math.random() * 20,
      },
      status: 'INATIVO',
      statusReason: 'Aguardando 1ª leitura',
      battery: 100,
      lastReadingAt: null,
      lastReading: null,
    };
    stationsDb.push(station);
    return mockDelay(station);
  },
};

export const stationsService: StationsService = USE_MOCKS ? mock : http;
