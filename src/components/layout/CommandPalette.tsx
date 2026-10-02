import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { CornerDownLeft, Search } from 'lucide-react';
import { cn } from '@/lib/cn';
import { usePermission } from '@/hooks/usePermission';
import { Kbd } from '@/components/ui';
import { NAV_ITEMS } from './navigation';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const can = usePermission();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const results = useMemo(() => {
    const q = normalize(query.trim());
    return NAV_ITEMS.filter((i) => can(i.permission)).filter(
      (i) => !q || normalize(i.label).includes(q) || normalize(i.description).includes(q),
    );
  }, [query, can]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => setActive(0), [query]);

  if (!open) return null;

  const go = (to: string) => {
    navigate(to);
    onClose();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      const item = results[active];
      if (item) go(item.to);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[12vh]">
      <div aria-hidden className="absolute inset-0 animate-fade-in bg-ink/25 backdrop-blur-[2px]" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Busca global"
        className="relative w-full max-w-xl animate-pop-in overflow-hidden rounded-card border border-border bg-surface shadow-pop"
      >
        <div className="flex items-center gap-3 border-b border-border px-5">
          <Search aria-hidden className="h-4 w-4 text-ink-subtle" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={results[active] ? `${listId}-${active}` : undefined}
            aria-label="Buscar páginas"
            placeholder="Buscar páginas, talhões, estações…"
            className="h-14 flex-1 bg-transparent text-[15px] text-ink placeholder:text-ink-subtle focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Kbd>Esc</Kbd>
        </div>
        <ul id={listId} role="listbox" aria-label="Resultados" className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 && <li className="px-3 py-8 text-center text-[13px] text-ink-subtle">Nenhum resultado para “{query}”.</li>}
          {results.map((item, i) => (
            <li
              key={item.to}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              onClick={() => go(item.to)}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-tile px-3 py-2.5 transition-colors duration-150',
                i === active ? 'bg-brand-soft' : 'hover:bg-canvas',
              )}
            >
              <item.icon aria-hidden className={cn('h-4 w-4', i === active ? 'text-brand' : 'text-ink-subtle')} />
              <span className="flex-1">
                <span className="block text-[13px] font-semibold text-ink">{item.label}</span>
                <span className="block text-xs text-ink-subtle">{item.description}</span>
              </span>
              {i === active && <CornerDownLeft aria-hidden className="h-3.5 w-3.5 text-brand" />}
            </li>
          ))}
        </ul>
      </div>
    </div>,
    document.body,
  );
}
