import type { ClimateRange } from '@/types';
import { cn } from '@/lib/cn';
import { RANGE_OPTIONS } from '@/features/dashboard/components/ClimateChartCard';

interface RangeFilterProps {
  value: ClimateRange;
  onChange: (range: ClimateRange) => void;
  options?: ReadonlyArray<ClimateRange>;
  label?: string;
}

/** Filtro de período em uma linha, acima de todo o conteúdo que ele afeta */
export function RangeFilter({ value, onChange, options, label = 'Período' }: RangeFilterProps) {
  const visible = options ? RANGE_OPTIONS.filter((o) => options.includes(o.value)) : RANGE_OPTIONS;
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-[13px] font-medium text-ink-muted">{label}</span>
      <div role="group" aria-label={label} className="inline-flex rounded-tile border border-border bg-surface p-0.5 shadow-card">
        {visible.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
            className={cn(
              'h-8 rounded-[8px] px-3.5 text-[13px] font-semibold transition-colors duration-150',
              value === o.value ? 'bg-brand text-white' : 'text-ink-muted hover:bg-canvas hover:text-ink',
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
