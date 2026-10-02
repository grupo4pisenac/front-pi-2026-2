import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type BadgeTone = 'success' | 'warning' | 'neutral' | 'danger' | 'outline';

const TONE: Record<BadgeTone, { wrap: string; dot: string }> = {
  success: { wrap: 'bg-brand-soft text-brand', dot: 'bg-brand' },
  warning: { wrap: 'bg-accent-soft text-accent', dot: 'bg-accent-vivid' },
  neutral: { wrap: 'bg-neutral-soft text-ink-muted', dot: 'bg-neutral' },
  danger: { wrap: 'bg-danger-soft text-danger', dot: 'bg-danger' },
  outline: { wrap: 'border border-border bg-surface text-ink-muted', dot: 'bg-ink-subtle' },
};

interface BadgeProps {
  tone?: BadgeTone;
  dot?: boolean;
  children: ReactNode;
  className?: string;
}

export function Badge({ tone = 'neutral', dot = false, children, className }: BadgeProps) {
  const t = TONE[tone];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium',
        t.wrap,
        className,
      )}
    >
      {dot && <span aria-hidden className={cn('h-1.5 w-1.5 rounded-full', t.dot)} />}
      {children}
    </span>
  );
}
