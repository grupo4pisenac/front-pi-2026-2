import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Bell, CheckCircle2, Menu as MenuIcon, Search } from 'lucide-react';
import { useSession } from '@/app/session';
import { ThemeToggle } from '@/app/theme';
import { useActiveAlert } from '@/features/dashboard/queries';
import { Button, Kbd, Menu } from '@/components/ui';
import { UserMenu } from './UserMenu';

interface TopbarProps {
  onOpenSearch: () => void;
  onOpenNav: () => void;
}

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

export function Topbar({ onOpenSearch, onOpenNav }: TopbarProps) {
  const navigate = useNavigate();
  const { user, simulateRole, signOut } = useSession();
  const { data: alert } = useActiveAlert();

  return (
    <header className="sticky top-0 z-30 flex h-18 items-center gap-3 border-b border-border bg-surface/85 px-5 py-3.5 backdrop-blur-md sm:px-8 lg:px-gutter">
      <Button variant="ghost" size="icon" aria-label="Abrir menu" onClick={onOpenNav} className="lg:hidden">
        <MenuIcon className="h-5 w-5" />
      </Button>

      <button
        type="button"
        onClick={onOpenSearch}
        aria-label="Abrir busca global"
        aria-keyshortcuts={isMac ? 'Meta+K' : 'Control+K'}
        className="flex h-10 min-w-0 max-w-md flex-1 items-center gap-3 rounded-tile border border-border bg-canvas/70 px-3.5 text-left text-[13px] text-ink-subtle transition-colors duration-150 hover:border-border-strong hover:text-ink-muted"
      >
        <Search aria-hidden className="h-4 w-4 shrink-0" />
        <span className="flex-1 truncate">Buscar telas, talhões, estações…</span>
        <span className="hidden sm:inline-flex">
          <Kbd>{isMac ? '⌘K' : 'Ctrl K'}</Kbd>
        </span>
      </button>

      <div className="ml-auto flex items-center gap-2 sm:gap-2.5">
        <ThemeToggle />

        <Menu
          header={
            <p className="px-3 pb-1.5 pt-1 text-xs font-semibold text-ink">
              Alertas meteorológicos
            </p>
          }
          items={
            alert
              ? [
                  {
                    key: 'alert',
                    label: `${alert.title}: ${alert.message}`,
                    icon: <AlertTriangle className="h-4 w-4 text-accent-vivid" />,
                    onSelect: () => navigate('/clima'),
                  },
                ]
              : [
                  {
                    key: 'ok',
                    label: 'Nenhum alerta térmico ativo nas últimas 24 h',
                    icon: <CheckCircle2 className="h-4 w-4 text-brand" />,
                    onSelect: () => navigate('/clima'),
                  },
                ]
          }
          trigger={(props) => (
            <Button
              {...props}
              variant="ghost"
              size="icon"
              aria-label={alert ? 'Notificações (1 alerta ativo)' : 'Notificações'}
              className="relative h-10 w-10 border border-border bg-surface hover:border-border-strong hover:bg-canvas"
            >
              <Bell className="h-[18px] w-[18px]" />
              {alert && (
                <span
                  aria-hidden
                  className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent-vivid ring-2 ring-surface"
                />
              )}
            </Button>
          )}
        />

        <span aria-hidden className="hidden h-7 w-px bg-border sm:block" />
        <UserMenu user={user} onSimulateRole={simulateRole} onSignOut={() => void signOut()} />
      </div>
    </header>
  );
}
