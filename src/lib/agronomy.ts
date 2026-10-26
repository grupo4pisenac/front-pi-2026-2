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

/* ───────────────────── Clima: limiares e grandezas derivadas ───────────────────── */

/** Limiares do alerta térmico — os mesmos do back (dashboard_service.py) */
export const HEAT_ATTENTION_C = 35;
export const HEAT_CRITICAL_C = 38;

/** Umidade do ar acima disso favorece míldio e podridões em uva e manga */
export const FUNGAL_RISK_HUMIDITY_PCT = 80;

/** Pressão de vapor de saturação (kPa) — equação de Tetens */
export function saturationVaporPressure(tempC: number): number {
  return 0.6108 * Math.exp((17.27 * tempC) / (tempC + 237.3));
}

/**
 * Déficit de pressão de vapor (VPD, kPa): o quanto o ar "puxa" água da planta.
 * Sobe com calor e ar seco — é o principal motor da demanda de irrigação.
 */
export function vaporPressureDeficit(tempC: number, relativeHumidityPct: number): number {
  return saturationVaporPressure(tempC) * (1 - relativeHumidityPct / 100);
}

/** Ponto de orvalho (°C) — fórmula de Magnus */
export function dewPoint(tempC: number, relativeHumidityPct: number): number {
  const gamma = Math.log(Math.max(relativeHumidityPct, 1) / 100) + (17.27 * tempC) / (237.3 + tempC);
  return (237.3 * gamma) / (17.27 - gamma);
}

/** Faixas de VPD para fruticultura irrigada (kPa) */
export const VPD_LOW_KPA = 0.4;
export const VPD_HIGH_KPA = 1.5;
export const VPD_CRITICAL_KPA = 2.5;

export interface VpdLevel {
  band: MetricBand;
  label: string;
  advice: string;
}

export function vpdLevel(kpa: number): VpdLevel {
  if (kpa < VPD_LOW_KPA) {
    return { band: 'atencao', label: 'Baixo', advice: 'Ar quase saturado: pouca transpiração e risco de doenças fúngicas.' };
  }
  if (kpa <= VPD_HIGH_KPA) return { band: 'ideal', label: 'Adequado', advice: 'Transpiração equilibrada — irrigação de rotina.' };
  if (kpa <= VPD_CRITICAL_KPA) {
    return { band: 'atencao', label: 'Alto', advice: 'Demanda evaporativa elevada: acompanhe a lâmina aplicada.' };
  }
  return { band: 'critico', label: 'Muito alto', advice: 'Estresse hídrico provável: evite irrigar sob sol forte e reforce no início da manhã.' };
}
