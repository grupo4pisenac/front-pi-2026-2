import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

export type IconTone = 'brand' | 'accent' | 'neutral' | 'danger';

const TONE: Record<IconTone, string> = {
  brand: 'bg-brand-soft text-brand',
  accent: 'bg-accent-soft text-accent',
  neutral: 'bg-neutral-soft text-ink-muted',
  danger: 'bg-danger-soft text-danger',
};

interface IconTileProps {
  icon: LucideIcon;
  tone?: IconTone;
  /** Sobrescreve tone com classes de cultura (ex.: bg-crop-grape-soft text-crop-grape) */
  className?: string;
  size?: 'md' | 'sm';
}

export function IconTile({ icon: Icon, tone = 'brand', className, size = 'md' }: IconTileProps) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-tile',
        size === 'md' ? 'h-11 w-11' : 'h-9 w-9',
        className ?? TONE[tone],
      )}
    >
      <Icon className={size === 'md' ? 'h-5 w-5' : 'h-4 w-4'} strokeWidth={1.75} />
    </span>
  );
}
