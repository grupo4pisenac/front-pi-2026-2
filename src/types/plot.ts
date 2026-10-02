import type { CropId } from './crop';

/** Talhão */
export interface Plot {
  id: string;
  name: string;
  code: string;
  cropId: CropId;
  areaHa: number;
  daysToHarvest: number;
  /** 0–100 — avanço do ciclo fenológico */
  progress: number;
}
