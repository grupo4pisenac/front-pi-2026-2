import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

const FIELD =
  'h-11 w-full rounded-tile border border-border bg-surface text-sm text-ink placeholder:text-ink-subtle ' +
  'transition-colors duration-150 ease-out hover:border-border-strong ' +
  'focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 focus-visible:ring-offset-0';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: ReactNode;
  rightSlot?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { leftIcon, rightSlot, className, ...props },
  ref,
) {
  return (
    <div className="relative flex items-center">
      {leftIcon && (
        <span aria-hidden className="pointer-events-none absolute left-3.5 text-ink-subtle">
          {leftIcon}
        </span>
      )}
      <input ref={ref} className={cn(FIELD, leftIcon ? 'pl-10' : 'pl-3.5', rightSlot ? 'pr-16' : 'pr-3.5', className)} {...props} />
      {rightSlot && <span className="absolute right-3">{rightSlot}</span>}
    </div>
  );
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className, children, ...props },
  ref,
) {
  return (
    <div className="relative">
      <select ref={ref} className={cn(FIELD, 'cursor-pointer appearance-none pl-3.5 pr-9', className)} {...props}>
        {children}
      </select>
      <ChevronDown aria-hidden className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
    </div>
  );
});

interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
  children: (id: string, describedBy: string | undefined) => ReactNode;
}

/** Associa label/erro ao controle via render-prop (garante htmlFor + aria-describedby). */
export function Field({ label, error, hint, children }: FieldProps) {
  const id = useId();
  const msgId = `${id}-msg`;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-[13px] font-semibold text-ink">
        {label}
      </label>
      {children(id, error || hint ? msgId : undefined)}
      {(error || hint) && (
        <p id={msgId} className={cn('text-xs', error ? 'text-danger' : 'text-ink-subtle')}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded-md border border-border bg-canvas px-1.5 py-0.5 font-sans text-[11px] font-semibold text-ink-subtle">
      {children}
    </kbd>
  );
}
