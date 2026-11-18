/** Mantenha em sincronia com o enum de culturas do backend (barto-io-api). */
export type CropId = 'UVA_SUGRAONE' | 'MANGA_PALMER' | 'UVA_ARRA' | 'GOIABA_PALUMA' | 'UVA_MOSCATEL';

export interface Crop {
  id: CropId;
  name: string;
  variety: string;
}
