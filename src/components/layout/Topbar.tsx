import { Bell, Menu as MenuIcon, Search } from 'lucide-react';
import { useSession } from '@/app/session';
import { useActiveAlert } from '@/features/dashboard/queries';
import { Button, Kbd } from '@/components/ui';
import { UserMenu } from './UserMenu';

interface TopbarProps {
  onOpenSearch: () => void;
  onOpenNav: () => void;
}

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

export function Topbar({ onOpenSearch, onOpenNav }: TopbarProps) {
  const { user, simulateRole } = useSession();
  const { data: alert } = useActiveAlert();

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center gap-3 border-b border-border bg-surface/90 px-5 backdrop-blur-md sm:px-8 lg:px-gutter">
      <Button variant="ghost" size="icon" aria-label="Abrir menu" onClick={onOpenNav} className="lg:hidden">
        <MenuIcon className="h-5 w-5" />
      </Button>

      <button
        type="button"
        onClick={onOpenSearch}
        aria-label="Abrir busca global"
        aria-keyshortcuts={isMac ? 'Meta+K' : 'Control+K'}
        className="flex h-11 w-full max-w-md items-center gap-3 rounded-tile border border-border bg-canvas/60 px-3.5 text-left text-sm text-ink-subtle transition-colors duration-150 hover:border-border-strong"
      >
        <Search aria-hidden className="h-4 w-4" />
        <span className="flex-1 truncate">Buscar talhões, estações, relatórios…</span>
        <span className="hidden sm:inline-flex">
          <Kbd>{isMac ? '⌘K' : 'Ctrl K'}</Kbd>
        </span>
      </button>

      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        <Button variant="ghost" size="icon" aria-label={alert ? 'Notificações (1 nova)' : 'Notificações'} className="relative h-10 w-10">
          <Bell className="h-[18px] w-[18px]" />
          {alert && <span aria-hidden className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-accent-vivid ring-2 ring-surface" />}
        </Button>
        <span aria-hidden className="hidden h-8 w-px bg-border sm:block" />
        <UserMenu user={user} onSimulateRole={simulateRole} />
      </div>
    </header>
  );
}
