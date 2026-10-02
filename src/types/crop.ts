export type CropId = 'UVA_SUGRAONE' | 'MANGA_PALMER' | 'UVA_ARRA' | 'GOIABA_PALUMA';

export interface Crop {
  id: CropId;
  name: string;
  variety: string;
}
