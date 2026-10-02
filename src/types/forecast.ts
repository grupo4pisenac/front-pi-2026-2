import type { CropId } from './crop';

export interface HarvestForecastPoint {
  /** Rótulo curto do período (ex.: "Jan") */
  period: string;
  /** toneladas */
  productionT: number;
  /** °C */
  avgTemperatureC: number;
  /** true para pontos projetados (futuro) */
  projected: boolean;
}

export interface HarvestForecast {
  cropId: CropId;
  points: HarvestForecastPoint[];
}
