import type { Station, StationStatus } from '@/types';
import type { BadgeTone } from '@/components/ui';

export const STATUS_META: Record<StationStatus, { label: string; tone: BadgeTone; pinClass: string }> = {
  ATIVO: { label: 'Ativo', tone: 'success', pinClass: 'bg-brand' },
  ATENCAO: { label: 'Atenção', tone: 'warning', pinClass: 'bg-accent-vivid' },
  INATIVO: { label: 'Inativo', tone: 'neutral', pinClass: 'bg-neutral' },
};

export const statusLabel = (s: Station): string => s.statusReason && s.status === 'ATENCAO' ? s.statusReason : STATUS_META[s.status].label;

export const LOW_BATTERY = 20;
