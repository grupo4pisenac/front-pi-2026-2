import { mockDelay, request, withFallback } from './apiClient';

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

const fallback: IngestionService = {
  syncNow: () => mockDelay({ fetched: 18, saved: 2, duplicates: 16, discarded: 0 }),
};

export const ingestionService: IngestionService = {
  syncNow: (results) => withFallback(() => http.syncNow(results), () => fallback.syncNow(results)),
};
