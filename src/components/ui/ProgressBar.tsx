import { cn } from '@/lib/cn';

interface ProgressBarProps {
  value: number;
  /** classe bg-* da cor da barra */
  barClass?: string;
  label: string;
  className?: string;
}

export function ProgressBar({ value, barClass = 'bg-brand', label, className }: ProgressBarProps) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(v)}
      className={cn('h-1.5 w-full overflow-hidden rounded-full bg-neutral-soft', className)}
    >
      <div
        className={cn('h-full rounded-full transition-[width] duration-500 ease-out', barClass)}
        style={{ width: `${v}%` }}
      />
    </div>
  );
}
