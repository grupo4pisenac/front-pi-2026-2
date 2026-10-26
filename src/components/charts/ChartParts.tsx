import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type KeyShape = 'line' | 'dashed' | 'rect' | 'dot';

/** Chave visual da série: espelha a marca (linha para linhas, retângulo para barras) */
export function SeriesKey({ color, shape = 'line' }: { color: string; shape?: KeyShape }) {
  if (shape === 'rect') return <span aria-hidden className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: color }} />;
  if (shape === 'dot') return <span aria-hidden className="h-2 w-2 shrink-0 rounded-full" style={{ background: color }} />;
  if (shape === 'dashed') return <span aria-hidden className="w-4 shrink-0 border-t-2 border-dashed" style={{ borderColor: color }} />;
  return <span aria-hidden className="h-0.5 w-4 shrink-0 rounded-full" style={{ background: color }} />;
}

export interface LegendItem {
  label: string;
  color: string;
  shape?: KeyShape;
}

/** Legenda sempre presente com ≥ 2 séries; texto em tinta, nunca na cor da série */
export function ChartLegend({ items, className }: { items: LegendItem[]; className?: string }) {
  return (
    <ul className={cn('flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-ink-muted', className)}>
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-2">
          <SeriesKey color={i.color} shape={i.shape} />
          {i.label}
        </li>
      ))}
    </ul>
  );
}

/** Caixa do tooltip — o valor vem em destaque, o nome da série em segundo plano */
export function TooltipShell({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <div className="min-w-[11rem] rounded-tile border border-border bg-surface px-3.5 py-2.5 shadow-pop">
      <p className="text-xs font-medium text-ink-muted">{title}</p>
      <dl className="mt-1.5 space-y-1">{children}</dl>
    </div>
  );
}

export function TooltipRow({ color, shape, label, value }: { color?: string; shape?: KeyShape; label: string; value: ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {color && <SeriesKey color={color} shape={shape} />}
      <dd className="text-[13px] font-semibold tabular-nums text-ink">{value}</dd>
      <dt className="ml-auto pl-4 text-ink-muted">{label}</dt>
    </div>
  );
}

/** Rótulo pequeno de estatística acima do gráfico */
export function InlineStat({ label, value, hint }: { label: string; value: ReactNode; hint?: ReactNode }) {
  return (
    <div>
      <dt className="text-label uppercase text-ink-subtle">{label}</dt>
      <dd className="mt-0.5 text-[15px] font-semibold text-ink">
        {value}
        {hint && <span className="ml-1.5 text-xs font-medium text-ink-subtle">{hint}</span>}
      </dd>
    </div>
  );
}

interface DataDetailsProps {
  caption: string;
  headers: string[];
  rows: ReactNode[][];
}

/** Tabela equivalente ao gráfico — nenhum valor depende só do hover */
export function DataDetails({ caption, headers, rows }: DataDetailsProps) {
  return (
    <details className="group mt-4 border-t border-border pt-3">
      <summary className="cursor-pointer select-none text-xs font-semibold text-ink-muted hover:text-ink">
        Ver dados em tabela
      </summary>
      <div className="mt-3 max-h-72 overflow-auto rounded-tile border border-border">
        <table className="w-full text-left text-xs">
          <caption className="sr-only">{caption}</caption>
          <thead className="sticky top-0 bg-canvas text-ink-muted">
            <tr>
              {headers.map((h, i) => (
                <th key={h} scope="col" className={cn('px-3 py-2 font-semibold', i > 0 && 'text-right')}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r, i) => (
              <tr key={i}>
                {r.map((cell, j) => (
                  <td key={j} className={cn('px-3 py-1.5 tabular-nums text-ink', j > 0 && 'text-right')}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
