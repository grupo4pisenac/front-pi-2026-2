import type { CropId } from './crop';

export type StationStatus = 'ATIVO' | 'ATENCAO' | 'INATIVO';
export type Municipality = 'PETROLINA' | 'JUAZEIRO';

export interface MapPosition {
  /** 0–100, relativo à largura do mapa */
  x: number;
  /** 0–100, relativo à altura do mapa */
  y: number;
}

export interface StationReading {
  temperature: number;
  soilMoisture: number;
  airHumidity: number;
}

export interface Station {
  id: string;
  name: string;
  municipality: Municipality;
  position: MapPosition;
  status: StationStatus;
  /** Motivo legível quando status = ATENCAO (ex.: "Checar bateria") */
  statusReason: string | null;
  /** 0–100 */
  battery: number;
  /** ISO 8601 */
  lastReadingAt: string | null;
  lastReading: StationReading | null;
  productId: CropId;
  thingSpeakChannelId: string;
}

export interface StationInput {
  id: string;
  name: string;
  municipality: Municipality;
  productId: CropId;
  thingSpeakChannelId: string;
}

export interface NetworkHealth {
  total: number;
  online: number;
  active: number;
  attention: number;
  inactive: number;
  /** ISO 8601 */
  lastSyncAt: string;
}
