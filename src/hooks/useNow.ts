import { useEffect, useState } from 'react';

/** Re-renderiza periodicamente — mantém "Há 2 min" e a saudação atualizados. */
export function useNow(intervalMs = 30_000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}
