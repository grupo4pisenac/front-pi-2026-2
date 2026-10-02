import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useModHotkey } from '@/hooks/useHotkey';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { CommandPalette } from './CommandPalette';

export function AppShell() {
  const location = useLocation();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  useModHotkey('k', () => setPaletteOpen((o) => !o));

  // Fecha o drawer ao trocar de rota e ao voltar para desktop
  useEffect(() => setNavOpen(false), [location.pathname]);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = () => mq.matches && setNavOpen(false);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setNavOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [navOpen]);

  return (
    <div className="min-h-screen bg-canvas">
      <a
        href="#conteudo"
        className="sr-only z-50 rounded-tile bg-brand px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Pular para o conteúdo
      </a>

      {/* Sidebar fixa (≥ lg) */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-sidebar border-r border-border lg:block">
        <Sidebar />
      </aside>

      {/* Drawer (< lg) */}
      {navOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu de navegação">
          <div aria-hidden className="absolute inset-0 animate-fade-in bg-ink/30" onClick={() => setNavOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-[min(20rem,86vw)] animate-slide-in border-r border-border shadow-pop">
            <Sidebar mobile onClose={() => setNavOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-sidebar">
        <Topbar onOpenSearch={() => setPaletteOpen(true)} onOpenNav={() => setNavOpen(true)} />
        <main id="conteudo" tabIndex={-1} className="mx-auto max-w-[1440px] px-5 py-8 focus:outline-none sm:px-8 sm:py-10 lg:px-gutter lg:py-gutter">
          <div key={location.pathname} className="animate-page-in">
            <Outlet />
          </div>
        </main>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
