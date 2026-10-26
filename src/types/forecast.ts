import type { CropId } from './crop';

export interface HarvestForecastPoint {
  /** Rótulo curto do período (ex.: "Jan") */
  period: string;
  /** toneladas */
  productionT: number;
  /** °C — normal climatológica do mês (referência) */
  avgTemperatureC: number;
  /** °C — média medida pela estação no mês; null sem leituras ou em mês projetado */
  measuredTemperatureC: number | null;
  /** true para pontos projetados (futuro) */
  projected: boolean;
}

export interface HarvestForecast {
  cropId: CropId;
  points: HarvestForecastPoint[];
}
