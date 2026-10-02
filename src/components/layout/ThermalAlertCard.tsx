import { Link } from 'react-router-dom';
import { ArrowRight, Thermometer } from 'lucide-react';
import type { ThermalAlert } from '@/types';

interface ThermalAlertCardProps {
  alert: ThermalAlert;
  onNavigate?: () => void;
}

export function ThermalAlertCard({ alert, onNavigate }: ThermalAlertCardProps) {
  return (
    <aside aria-label={alert.title} className="rounded-card bg-accent-soft p-5">
      <div className="flex items-center gap-2.5">
        <span aria-hidden className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-surface/70 text-accent">
          <Thermometer className="h-4 w-4" strokeWidth={2} />
        </span>
        <p className="text-[13px] font-semibold text-ink">{alert.title}</p>
      </div>
      <p className="mt-3 text-[13px] leading-relaxed text-ink-muted">{alert.message}</p>
      <Link
        to="/irrigacao"
        onClick={onNavigate}
        className="group mt-4 inline-flex items-center gap-1.5 rounded-md text-[13px] font-semibold text-accent"
      >
        Reforçar irrigação
        <ArrowRight aria-hidden className="h-3.5 w-3.5 transition-transform duration-150 ease-out group-hover:translate-x-0.5" />
      </Link>
    </aside>
  );
}
