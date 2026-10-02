import { useEffect, useRef } from 'react';

/** Atalho ⌘/Ctrl + tecla. */
export function useModHotkey(key: string, handler: () => void): void {
  const ref = useRef(handler);
  ref.current = handler;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === key.toLowerCase()) {
        e.preventDefault();
        ref.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [key]);
}
