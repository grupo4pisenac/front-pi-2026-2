import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function Card({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={cn('rounded-card border border-border bg-surface shadow-card', className)}
      {...props}
    />
  );
}

interface CardHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  titleId?: string;
  className?: string;
}

export function CardHeader({ title, subtitle, action, titleId, className }: CardHeaderProps) {
  return (
    <header className={cn('flex flex-wrap items-start justify-between gap-4 px-6 pt-6', className)}>
      <div className="min-w-0">
        <h2 id={titleId} className="text-base font-semibold tracking-tight text-ink">
          {title}
        </h2>
        {subtitle && <p className="mt-1 text-[13px] text-ink-muted">{subtitle}</p>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </header>
  );
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-6 pb-6 pt-5', className)} {...props} />;
}
