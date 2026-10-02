import { ChevronDown, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Role, User } from '@/types';
import { ROLE_LABEL, ROLES } from '@/lib/rbac';
import { USE_MOCKS } from '@/services/apiClient';
import { Avatar, Menu, Skeleton, type MenuItem } from '@/components/ui';

interface UserMenuProps {
  user: User | undefined;
  onSimulateRole: (role: Role) => void;
}

export function UserMenu({ user, onSimulateRole }: UserMenuProps) {
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="flex items-center gap-3" aria-hidden>
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="hidden space-y-1.5 sm:block">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-2.5 w-16" />
        </div>
      </div>
    );
  }

  const items: MenuItem[] = [
    { key: 'profile', label: 'Meu perfil', icon: <UserRound className="h-4 w-4" />, onSelect: () => navigate('/perfil') },
    // Em modo mock, permite alternar o perfil para validar o RBAC sem backend
    ...(USE_MOCKS
      ? ROLES.map<MenuItem>((r) => ({
          key: r,
          section: 'Simular perfil',
          label: ROLE_LABEL[r],
          checked: user.role === r,
          onSelect: () => onSimulateRole(r),
        }))
      : []),
  ];

  return (
    <Menu
      items={items}
      header={<p className="truncate px-3 pb-2 pt-1 text-xs text-ink-subtle">{user.email}</p>}
      trigger={(props) => (
        <button
          type="button"
          {...props}
          aria-label={`Menu do usuário ${user.name}`}
          className="flex items-center gap-3 rounded-tile py-1 pl-1 pr-2 transition-colors duration-150 hover:bg-canvas"
        >
          <Avatar name={user.name} />
          <span className="hidden text-left leading-tight sm:block">
            <span className="block text-[13px] font-semibold text-ink">{user.name}</span>
            <span className="block text-xs text-ink-subtle">{ROLE_LABEL[user.role]}</span>
          </span>
          <ChevronDown aria-hidden className="hidden h-4 w-4 text-ink-subtle sm:block" />
        </button>
      )}
    />
  );
}
