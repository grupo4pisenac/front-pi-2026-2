import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Card } from './Card';
import { IconTile, type IconTone } from './IconTile';
import { Skeleton } from './Skeleton';

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  tone?: IconTone;
  /** Texto de apoio já com a cor da faixa aplicada pelo container */
  helper?: ReactNode;
  helperClass?: string;
  layout?: 'stacked' | 'inline';
}

export function StatCard({ label, value, icon, tone = 'brand', helper, helperClass = 'text-ink-subtle', layout = 'stacked' }: StatCardProps) {
  if (layout === 'inline') {
    return (
      <Card className="flex items-center gap-4 p-6 transition-shadow duration-200 ease-out hover:shadow-pop">
        <IconTile icon={icon} tone={tone} />
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-ink-muted">{label}</p>
          <p className="mt-0.5 text-kpi tabular-nums text-ink">{value}</p>
          {helper && <p className={cn('mt-0.5 text-xs font-medium', helperClass)}>{helper}</p>}
        </div>
      </Card>
    );
  }
  return (
    <Card className="p-6 transition-shadow duration-200 ease-out hover:shadow-pop">
      <div className="flex items-start justify-between gap-3">
        <p className="pt-1 text-[13px] font-medium text-ink-muted">{label}</p>
        <IconTile icon={icon} tone={tone} />
      </div>
      <p className="mt-3 text-kpi tabular-nums text-ink">{value}</p>
      {helper && <p className={cn('mt-1.5 flex items-center gap-1 text-xs font-medium', helperClass)}>{helper}</p>}
    </Card>
  );
}

export function StatCardSkeleton({ layout = 'stacked' }: { layout?: 'stacked' | 'inline' }) {
  return (
    <Card className={cn('p-6', layout === 'inline' && 'flex items-center gap-4')}>
      {layout === 'inline' ? (
        <>
          <Skeleton className="h-11 w-11 rounded-tile" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-3 w-28" />
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-between">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-11 w-11 rounded-tile" />
          </div>
          <Skeleton className="mt-3 h-8 w-24" />
          <Skeleton className="mt-2 h-3 w-32" />
        </>
      )}
    </Card>
  );
}
