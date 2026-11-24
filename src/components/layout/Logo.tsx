import logoLight from '@/assets/logo-light.png';
import logoDark from '@/assets/logo-dark.png';
import { cn } from '@/lib/cn';

interface LogoProps {
  /** 'auto' alterna entre roxa (light) e branca (dark); 'light' ou 'dark' força a variante. */
  variant?: 'auto' | 'light' | 'dark';
  subtitle?: boolean;
  className?: string;
}

export function Logo({ variant = 'auto', subtitle = true, className }: LogoProps) {
  return (
    <div className={cn('flex flex-col items-start', className)}>
      {variant !== 'dark' && (
        <img
          src={logoLight}
          alt="bartô.io"
          className={cn('h-8 w-auto select-none object-contain', variant === 'auto' && 'dark:hidden')}
        />
      )}
      {variant !== 'light' && (
        <img
          src={logoDark}
          alt="bartô.io"
          className={cn('h-8 w-auto select-none object-contain', variant === 'auto' && 'hidden dark:block')}
        />
      )}
      {subtitle && (
        <p
          className={cn(
            'mt-1 text-[11px] font-medium',
            variant === 'dark' ? 'text-emerald-200/80' : 'text-ink-subtle',
          )}
        >
          Clima &amp; safra · Vale do São Francisco
        </p>
      )}
    </div>
  );
}
