import { NavLink } from 'react-router-dom';
import { MapPin, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { usePermission } from '@/hooks/usePermission';
import { useActiveAlert } from '@/features/dashboard/queries';
import { Button } from '@/components/ui';
import { NAV_ITEMS, NAV_SECTIONS, type NavItem } from './navigation';
import { Logo } from './Logo';
import { ThermalAlertCard } from './ThermalAlertCard';

interface SidebarProps {
  /** Modo drawer (< lg) */
  mobile?: boolean;
  onClose?: () => void;
}

const SECTIONS: NavItem['section'][] = ['operacao', 'gestao'];

export function Sidebar({ mobile = false, onClose }: SidebarProps) {
  const can = usePermission();
  const { data: alert } = useActiveAlert();
  const items = NAV_ITEMS.filter((i) => can(i.permission));

  return (
    <div className="flex h-full flex-col bg-surface">
      <div className="flex items-center justify-between px-6 pb-6 pt-6">
        <Logo />
        {mobile && (
          <Button variant="ghost" size="icon" aria-label="Fechar menu" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <nav aria-label="Navegação principal" className="flex-1 space-y-6 overflow-y-auto px-4">
        {SECTIONS.map((section) => {
          const group = items.filter((i) => i.section === section);
          if (!group.length) return null;
          return (
            <div key={section}>
              <p className="px-3 pb-2 text-label uppercase text-ink-subtle">{NAV_SECTIONS[section]}</p>
              <ul className="space-y-1">
                {group.map(({ to, label, icon: Icon, notifyOnAlert }) => (
                  <li key={to}>
                    <NavLink
                      to={to}
                      end={to === '/'}
                      onClick={onClose}
                      className={({ isActive }) =>
                        cn(
                          'group relative flex h-11 items-center gap-3 rounded-tile px-3 text-[13.5px] font-medium transition-all duration-150 ease-out',
                          isActive
                            ? 'bg-brand text-white shadow-sm'
                            : 'text-ink-muted hover:bg-canvas hover:text-ink',
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon aria-hidden className="h-[18px] w-[18px] shrink-0" strokeWidth={isActive ? 2.1 : 1.75} />
                          <span className="flex-1 truncate">{label}</span>
                          {notifyOnAlert && alert && (
                            <span className="relative flex h-2 w-2">
                              <span className="sr-only">(alerta ativo)</span>
                              <span
                                aria-hidden
                                className={cn('h-2 w-2 rounded-full', isActive ? 'bg-white' : 'bg-accent-vivid')}
                              />
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="space-y-4 px-4 pb-5 pt-4">
        {alert && <ThermalAlertCard alert={alert} onNavigate={onClose} />}
        <div className="flex items-center justify-between rounded-tile border border-border bg-canvas/60 px-3.5 py-2.5 text-xs text-ink-subtle">
          <span className="inline-flex items-center gap-1.5 font-medium text-ink-muted">
            <MapPin aria-hidden className="h-3.5 w-3.5 text-brand" />
            Petrolina · Juazeiro
          </span>
          <span className="font-mono text-[11px]">UTC−3</span>
        </div>
      </div>
    </div>
  );
}
