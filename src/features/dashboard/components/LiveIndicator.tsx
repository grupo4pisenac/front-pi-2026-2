import { formatRelative } from '@/lib/formatters';
import { Skeleton } from '@/components/ui';

interface LiveIndicatorProps {
  /** undefined = carregando · null = nenhuma leitura recebida ainda */
  lastReadingAt: string | null | undefined;
  now: number;
}

/** Fresco (< 5 min) = dot verde pulsante; caso contrário dot neutro + tempo relativo. */
export function LiveIndicator({ lastReadingAt, now }: LiveIndicatorProps) {
  if (lastReadingAt === undefined) return <Skeleton className="h-4 w-44" />;
  if (lastReadingAt === null) {
    return (
      <span className="inline-flex items-center gap-2 text-[13px] text-ink-muted" aria-live="polite">
        <span aria-hidden className="relative h-2 w-2 rounded-full bg-neutral" />
        Aguardando a primeira leitura do ThingSpeak
      </span>
    );
  }
  const ageMin = (now - new Date(lastReadingAt).getTime()) / 60_000;
  const fresh = ageMin < 5;
  const rel = formatRelative(lastReadingAt, now);

  return (
    <span className="inline-flex items-center gap-2 text-[13px] text-ink-muted" aria-live="polite">
      <span className="relative flex h-2 w-2" aria-hidden>
        {fresh && <span className="absolute inline-flex h-full w-full animate-ping-soft rounded-full bg-brand" />}
        <span className={fresh ? 'relative h-2 w-2 rounded-full bg-brand' : 'relative h-2 w-2 rounded-full bg-neutral'} />
      </span>
      {fresh ? 'Dados atualizados agora' : `Dados atualizados ${rel.toLowerCase()}`}
    </span>
  );
}
