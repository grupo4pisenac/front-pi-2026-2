import { NavLink } from 'react-router-dom';
import { LifeBuoy, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { usePermission } from '@/hooks/usePermission';
import { useActiveAlert } from '@/features/dashboard/queries';
import { Button } from '@/components/ui';
import { NAV_ITEMS } from './navigation';
import { Logo } from './Logo';
import { ThermalAlertCard } from './ThermalAlertCard';

interface SidebarProps {
  /** Modo drawer (< lg) */
  mobile?: boolean;
  onClose?: () => void;
}

export function Sidebar({ mobile = false, onClose }: SidebarProps) {
  const can = usePermission();
  const { data: alert } = useActiveAlert();
  const items = NAV_ITEMS.filter((i) => can(i.permission));

  return (
    <div className="flex h-full flex-col bg-surface">
      <div className="flex items-center justify-between px-7 pb-8 pt-7">
        <Logo />
        {mobile && (
          <Button variant="ghost" size="icon" aria-label="Fechar menu" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <nav aria-label="Navegação principal" className="flex-1 overflow-y-auto px-5">
        <p className="px-3 pb-3 text-label uppercase text-ink-subtle">Navegação</p>
        <ul className="space-y-1">
          {items.map(({ to, label, icon: Icon, notifyOnAlert }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'group flex h-11 items-center gap-3 rounded-tile px-3 text-sm font-medium transition-colors duration-150 ease-out',
                    isActive ? 'bg-brand text-white' : 'text-ink-muted hover:bg-canvas hover:text-ink',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon aria-hidden className="h-[18px] w-[18px]" strokeWidth={isActive ? 2 : 1.75} />
                    <span className="flex-1">{label}</span>
                    {notifyOnAlert && alert && (
                      <span className="relative flex h-2 w-2">
                        <span className="sr-only">(alerta ativo)</span>
                        <span aria-hidden className={cn('h-2 w-2 rounded-full', isActive ? 'bg-white' : 'bg-accent-vivid')} />
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-5 px-5 pb-6 pt-4">
        {alert && <ThermalAlertCard alert={alert} onNavigate={onClose} />}
        <div className="flex items-center justify-between px-3 text-xs text-ink-subtle">
          <a href="mailto:suporte@barto.io" className="inline-flex items-center gap-2 rounded-md font-medium hover:text-ink">
            <LifeBuoy aria-hidden className="h-4 w-4" />
            Suporte e ajuda
          </a>
          <span>bartô.io v2.4</span>
        </div>
      </div>
    </div>
  );
}
