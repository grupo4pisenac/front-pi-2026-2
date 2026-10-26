import type { ReactNode } from 'react';
import { RadioTower, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui';

interface ChartFrameProps {
  /** Altura da área do gráfico, incluindo a faixa do eixo X */
  className?: string;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  isEmpty: boolean;
  /** Recarregando com dados anteriores na tela: mantém o quadro, só esmaece */
  isRefreshing?: boolean;
  /** Resumo textual do gráfico para leitores de tela */
  summary: string;
  emptyTitle?: string;
  emptyDescription?: ReactNode;
  emptyIcon?: LucideIcon;
  errorMessage?: string;
  children: ReactNode;
}

const DEFAULT_EMPTY = 'Assim que a estação publicar no canal do ThingSpeak, os dados aparecem aqui automaticamente.';

/** Estados de um gráfico: carregando (skeleton), erro, vazio e o gráfico em si como figura acessível. */
export function ChartFrame({
  className = 'h-64',
  isLoading,
  isError,
  onRetry,
  isEmpty,
  isRefreshing = false,
  summary,
  emptyTitle = 'Sem leituras neste período',
  emptyDescription = DEFAULT_EMPTY,
  emptyIcon = RadioTower,
  errorMessage = 'Não foi possível carregar as leituras.',
  children,
}: ChartFrameProps) {
  if (isError) {
    return (
      <div className={cn('relative', className)}>
        <ErrorState message={errorMessage} onRetry={onRetry} />
      </div>
    );
  }
  if (isLoading) {
    return (
      <div role="status" aria-busy="true" className={className}>
        <span className="sr-only">Carregando gráfico</span>
        <Skeleton className="h-full w-full rounded-tile" />
      </div>
    );
  }
  if (isEmpty) {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />
      </div>
    );
  }
  return (
    <figure className={cn('transition-opacity duration-150', isRefreshing && 'opacity-60', className)}>
      <div role="img" aria-label={summary} className="h-full">
        {children}
      </div>
      <figcaption className="sr-only">{summary}</figcaption>
    </figure>
  );
}
