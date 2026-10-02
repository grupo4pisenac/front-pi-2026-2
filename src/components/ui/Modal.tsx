import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from './Button';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md';
  /** Ícone/ilustração acima do título (ex.: confirmação destrutiva) */
  leading?: ReactNode;
}

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function Modal({ open, onClose, title, description, children, footer, size = 'md', leading }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const first = panel?.querySelector<HTMLElement>('[data-autofocus]') ?? panel?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab' || !panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      if (!firstEl || !lastEl) return;
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      previouslyFocused?.focus();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div aria-hidden className="absolute inset-0 animate-fade-in bg-ink/30 backdrop-blur-[2px]" onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        className={cn(
          'relative w-full animate-pop-in rounded-card border border-border bg-surface shadow-pop',
          size === 'sm' ? 'max-w-md' : 'max-w-lg',
        )}
      >
        <div className="flex items-start gap-4 px-6 pt-6">
          {leading}
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-lg font-semibold tracking-tight text-ink">
              {title}
            </h2>
            {description && (
              <p id={descId} className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">
                {description}
              </p>
            )}
          </div>
          <Button variant="ghost" size="icon" aria-label="Fechar" onClick={onClose} className="-mr-2 -mt-1">
            <X className="h-4 w-4" />
          </Button>
        </div>
        {children && <div className="px-6 pt-5">{children}</div>}
        {footer && <div className="mt-6 flex flex-col-reverse gap-2 border-t border-border px-6 py-4 sm:flex-row sm:justify-end">{footer}</div>}
        {!footer && <div className="pb-6" />}
      </div>
    </div>,
    document.body,
  );
}
