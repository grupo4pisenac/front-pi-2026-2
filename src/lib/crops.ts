import { Apple, Citrus, Grape, Sprout, type LucideIcon } from 'lucide-react';
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
  UVA_MOSCATEL: {
    label: 'Uva Moscatel',
    short: 'Moscatel',
    icon: Grape,
    textClass: 'text-crop-moscatel',
    bgClass: 'bg-crop-moscatel',
    softClass: 'bg-crop-moscatel-soft',
    color: palette.crop.moscatel,
  },
};

export const CROP_IDS = Object.keys(CROPS) as CropId[];

/** Usado quando o backend envia uma cultura que o front ainda não conhece. */
const UNKNOWN_CROP: Omit<CropMeta, 'label' | 'short'> = {
  icon: Sprout,
  textClass: 'text-ink-muted',
  bgClass: 'bg-neutral',
  softClass: 'bg-neutral-soft',
  color: palette.neutral.DEFAULT,
};

/**
 * Metadados da cultura sem quebrar a tela: se o id não estiver em CROPS (ex.: o backend
 * passou a aceitar uma cultura nova), devolve um visual neutro com o próprio id como rótulo.
 */
export function getCrop(id: string | null | undefined): CropMeta {
  const known = id ? CROPS[id as CropId] : undefined;
  if (known) return known;
  const label = id ? id.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : 'Não informado';
  return { ...UNKNOWN_CROP, label, short: label };
}
