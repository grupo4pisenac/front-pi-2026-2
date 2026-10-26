import { USE_MOCKS, mockDelay, request } from './apiClient';

export interface IngestionResult {
  /** leituras recebidas do ThingSpeak */
  fetched: number;
  /** leituras novas gravadas */
  saved: number;
  /** já existiam no banco */
  duplicates: number;
  /** fora da faixa válida ou malformadas */
  discarded: number;
}

export interface IngestionService {
  /** Sincroniza o canal ThingSpeak agora (ADMIN) — a ingestão automática roda a cada ~20 s */
  syncNow(results?: number): Promise<IngestionResult>;
}

const http: IngestionService = {
  syncNow: (results = 100) => request('/ingestion/run', { method: 'POST', query: { results } }),
};

const mock: IngestionService = {
  syncNow: () => mockDelay({ fetched: 8, saved: 0, duplicates: 8, discarded: 0 }),
};

export const ingestionService: IngestionService = USE_MOCKS ? mock : http;
