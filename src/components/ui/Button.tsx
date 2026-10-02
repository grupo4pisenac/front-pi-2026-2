import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-ghost';
type Size = 'sm' | 'md' | 'icon';

const VARIANT: Record<Variant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-hover',
  secondary: 'border border-border bg-surface text-ink hover:bg-canvas',
  ghost: 'text-ink-muted hover:bg-canvas hover:text-ink',
  danger: 'bg-danger text-white hover:brightness-95',
  'danger-ghost': 'text-danger hover:bg-danger-soft',
};

const SIZE: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-[13px] gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  icon: 'h-9 w-9 justify-center',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', leftIcon, rightIcon, loading, disabled, className, children, type = 'button', ...props },
  ref,
) {
  if (import.meta.env.DEV && size === 'icon' && !props['aria-label']) {
    console.warn('Button size="icon" precisa de aria-label');
  }
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex shrink-0 items-center rounded-tile font-semibold transition-colors duration-150 ease-out',
        'disabled:cursor-not-allowed disabled:opacity-50',
        VARIANT[variant],
        SIZE[size],
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : leftIcon}
      {children}
      {rightIcon}
    </button>
  );
});
