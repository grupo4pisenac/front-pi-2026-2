import { Apple, Citrus, Grape, type LucideIcon } from 'lucide-react';
import type { CropId } from '@/types';
import { palette } from '@/theme/tokens';

export interface CropMeta {
  label: string;
  short: string;
  icon: LucideIcon;
  /** Classes literais (o JIT do Tailwind precisa enxergá-las no código) */
  textClass: string;
  bgClass: string;
  softClass: string;
  color: string;
}

export const CROPS: Record<CropId, CropMeta> = {
  UVA_SUGRAONE: {
    label: 'Uva Sugraone',
    short: 'Uva',
    icon: Grape,
    textClass: 'text-crop-grape',
    bgClass: 'bg-crop-grape',
    softClass: 'bg-crop-grape-soft',
    color: palette.crop.grape,
  },
  MANGA_PALMER: {
    label: 'Manga Palmer',
    short: 'Manga',
    icon: Citrus,
    textClass: 'text-crop-mango',
    bgClass: 'bg-crop-mango',
    softClass: 'bg-crop-mango-soft',
    color: palette.crop.mango,
  },
  UVA_ARRA: {
    label: 'Uva Arra 15',
    short: 'Uva Arra',
    icon: Grape,
    textClass: 'text-crop-arra',
    bgClass: 'bg-crop-arra',
    softClass: 'bg-crop-arra-soft',
    color: palette.crop.arra,
  },
  GOIABA_PALUMA: {
    label: 'Goiaba Paluma',
    short: 'Goiaba',
    icon: Apple,
    textClass: 'text-crop-guava',
    bgClass: 'bg-crop-guava',
    softClass: 'bg-crop-guava-soft',
    color: palette.crop.guava,
  },
};

export const CROP_IDS = Object.keys(CROPS) as CropId[];
