import { Fragment, useCallback, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { useClickOutside } from '@/hooks/useClickOutside';

export interface MenuItem {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  onSelect: () => void;
  tone?: 'default' | 'danger';
  checked?: boolean;
  disabled?: boolean;
  /** Rótulo de grupo exibido antes do primeiro item da seção */
  section?: string;
}

interface MenuProps {
  /** Renderiza o gatilho; recebe props ARIA que devem ir para o <button>. */
  trigger: (props: {
    onClick: () => void;
    'aria-expanded': boolean;
    'aria-haspopup': 'menu';
    'aria-controls': string;
  }) => ReactNode;
  items: MenuItem[];
  header?: ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export function Menu({ trigger, items, header, align = 'right', className }: MenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(ref, close, open);

  const focusItem = (dir: 1 | -1) => {
    const els = Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>('[role^="menuitem"]:not([disabled])') ?? []);
    const idx = els.indexOf(document.activeElement as HTMLButtonElement);
    els[(idx + dir + els.length) % els.length]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusItem(1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusItem(-1);
    }
  };

  return (
    <div ref={ref} className={cn('relative', className)} onKeyDown={onKeyDown}>
      {trigger({
        onClick: () => {
          setOpen((o) => !o);
          requestAnimationFrame(() => focusItem(1));
        },
        'aria-expanded': open,
        'aria-haspopup': 'menu',
        'aria-controls': id,
      })}
      {open && (
        <div
          ref={listRef}
          id={id}
          role="menu"
          className={cn(
            'absolute z-40 mt-2 min-w-[220px] animate-pop-in rounded-tile border border-border bg-surface p-1.5 shadow-pop',
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
          {header}
          {items.map((item, i) => (
            <Fragment key={item.key}>
            {item.section && item.section !== items[i - 1]?.section && (
              <p role="presentation" className="mt-1.5 border-t border-border px-3 pb-1 pt-2.5 text-label uppercase text-ink-subtle first:mt-0 first:border-t-0">
                {item.section}
              </p>
            )}
            <button
              type="button"
              role={item.checked === undefined ? 'menuitem' : 'menuitemradio'}
              aria-checked={item.checked}
              disabled={item.disabled}
              onClick={() => {
                item.onSelect();
                close();
              }}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-colors duration-150',
                'focus-visible:ring-offset-0 disabled:opacity-50',
                item.tone === 'danger' ? 'text-danger hover:bg-danger-soft' : 'text-ink hover:bg-canvas',
                item.checked && 'bg-brand-soft text-brand',
              )}
            >
              {item.icon}
              {item.label}
            </button>
            </Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
