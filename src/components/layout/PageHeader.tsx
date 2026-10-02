import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
}

export function PageHeader({ eyebrow, title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="mb-9 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="text-eyebrow uppercase text-brand">{eyebrow}</p>
        <h1 className="mt-2 text-[28px] font-medium leading-tight tracking-[-0.02em] text-ink sm:text-h1">{title}</h1>
        {subtitle && <div className="mt-2 text-sm text-ink-muted">{subtitle}</div>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-3">{action}</div>}
    </div>
  );
}
