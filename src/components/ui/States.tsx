import type { ReactNode } from 'react';
import { AlertTriangle, Inbox, RotateCw, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  size?: 'sm' | 'lg';
}

export function EmptyState({ icon: Icon = Inbox, title, description, action, className, size = 'sm' }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center', size === 'lg' ? 'py-24' : 'py-12', className)}>
      <span
        aria-hidden
        className={cn(
          'mb-5 inline-flex items-center justify-center rounded-card bg-brand-soft text-brand',
          size === 'lg' ? 'h-16 w-16' : 'h-12 w-12',
        )}
      >
        <Icon className={size === 'lg' ? 'h-7 w-7' : 'h-5 w-5'} strokeWidth={1.5} />
      </span>
      <h3 className={cn('font-semibold tracking-tight text-ink', size === 'lg' ? 'text-xl' : 'text-[15px]')}>{title}</h3>
      {description && <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-ink-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ message = 'Não foi possível carregar estes dados.', onRetry, className }: ErrorStateProps) {
  return (
    <div role="alert" className={cn('flex flex-col items-center justify-center py-10 text-center', className)}>
      <span aria-hidden className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-tile bg-danger-soft text-danger">
        <AlertTriangle className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <p className="text-[13px] font-semibold text-ink">{message}</p>
      <p className="mt-1 text-xs text-ink-subtle">Verifique sua conexão e tente novamente.</p>
      {onRetry && (
        <Button size="sm" variant="secondary" className="mt-4" leftIcon={<RotateCw className="h-3.5 w-3.5" />} onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
