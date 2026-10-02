import type { MetricBand } from '@/types';

/**
 * Faixas agronômicas de referência para o Vale do São Francisco.
 * Ajustáveis por cultura no futuro — por ora, valores gerais de fruticultura irrigada.
 */
export function temperatureDeltaBand(deltaC: number): MetricBand {
  const abs = Math.abs(deltaC);
  if (abs <= 1) return 'ideal';
  if (abs <= 3) return 'atencao';
  return 'critico';
}

export function soilMoistureBand(pct: number): MetricBand {
  if (pct >= 35 && pct <= 60) return 'ideal';
  if (pct >= 25 && pct <= 70) return 'atencao';
  return 'critico';
}

export function productionChangeBand(changePct: number): MetricBand {
  if (changePct >= 0) return 'ideal';
  if (changePct >= -5) return 'atencao';
  return 'critico';
}

export const BAND_TEXT_CLASS: Record<MetricBand, string> = {
  ideal: 'text-brand',
  atencao: 'text-accent',
  critico: 'text-danger',
  neutro: 'text-ink-subtle',
};
