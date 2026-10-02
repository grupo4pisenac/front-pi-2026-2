import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function Skeleton({ className }: { className?: string }) {
  // <span> para poder aparecer dentro de headings/parágrafos sem quebrar o HTML
  return <span aria-hidden className={cn('skeleton block', className)} />;
}

/** Bloco acessível que anuncia carregamento uma vez só. */
export function LoadingRegion({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}
