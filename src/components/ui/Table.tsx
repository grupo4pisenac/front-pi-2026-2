import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Skeleton } from './Skeleton';
import { EmptyState, ErrorState } from './States';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
  align?: 'left' | 'right';
  /** No layout de cards (mobile): 'title' vira o cabeçalho do card; 'hidden' some; 'field' (padrão) vira linha rótulo/valor */
  mobile?: 'title' | 'hidden' | 'field' | 'actions';
}

interface DataTableProps<T> {
  caption: string;
  columns: Column<T>[];
  rows: T[] | undefined;
  getRowId: (row: T) => string;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  empty?: ReactNode;
  highlightedId?: string | null;
  skeletonRows?: number;
}

/**
 * Tabela semântica em ≥ md; abaixo disso cada linha vira um card empilhado.
 * Estados de loading/erro/vazio embutidos para padronizar todas as listagens.
 */
export function DataTable<T>({
  caption,
  columns,
  rows,
  getRowId,
  isLoading,
  isError,
  onRetry,
  empty,
  highlightedId,
  skeletonRows = 5,
}: DataTableProps<T>) {
  const highlightRef = useRef<HTMLTableRowElement | null>(null);

  useEffect(() => {
    highlightRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [highlightedId]);

  if (isError) return <ErrorState onRetry={onRetry} />;

  if (isLoading || !rows) {
    return (
      <div role="status" aria-busy="true" className="divide-y divide-border">
        <span className="sr-only">Carregando {caption.toLowerCase()}</span>
        {Array.from({ length: skeletonRows }, (_, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-3 w-1/5" />
            </div>
            <Skeleton className="hidden h-6 w-20 rounded-full sm:block" />
            <Skeleton className="hidden h-3 w-16 md:block" />
          </div>
        ))}
      </div>
    );
  }

  if (rows.length === 0) return <>{empty ?? <EmptyState title="Nada por aqui" />}</>;

  const titleCol = columns.find((c) => c.mobile === 'title');
  const actionsCol = columns.find((c) => c.mobile === 'actions');
  const fieldCols = columns.filter((c) => !c.mobile || c.mobile === 'field');

  return (
    <>
      {/* Desktop */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-y border-border bg-canvas/50">
              {columns.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  className={cn(
                    'whitespace-nowrap px-6 py-3 text-label uppercase text-ink-subtle',
                    c.align === 'right' && 'text-right',
                    c.className,
                  )}
                >
                  {c.header || <span className="sr-only">Ações</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => {
              const id = getRowId(row);
              const highlighted = id === highlightedId;
              return (
                <tr
                  key={id}
                  ref={highlighted ? highlightRef : undefined}
                  aria-selected={highlighted || undefined}
                  className={cn(
                    'transition-colors duration-150 ease-out hover:bg-canvas/70',
                    highlighted && 'bg-brand-soft/60 hover:bg-brand-soft/70',
                  )}
                >
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={cn('px-6 py-4 align-middle text-[13px] text-ink', c.align === 'right' && 'text-right', c.className)}
                    >
                      {c.render(row)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <ul className="divide-y divide-border border-t border-border md:hidden" aria-label={caption}>
        {rows.map((row) => {
          const id = getRowId(row);
          return (
            <li key={id} className={cn('space-y-3 px-5 py-4', id === highlightedId && 'bg-brand-soft/60')}>
              {(titleCol || actionsCol) && (
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">{titleCol?.render(row)}</div>
                  {actionsCol?.render(row)}
                </div>
              )}
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                {fieldCols.map((c) => (
                  <div key={c.key} className="min-w-0">
                    <dt className="text-label uppercase text-ink-subtle">{c.header}</dt>
                    <dd className="mt-1 text-[13px] text-ink">{c.render(row)}</dd>
                  </div>
                ))}
              </dl>
            </li>
          );
        })}
      </ul>
    </>
  );
}
