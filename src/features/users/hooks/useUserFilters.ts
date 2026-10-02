import { useMemo, useState } from 'react';
import type { Role, User, UserStatus } from '@/types';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

export type RoleFilter = Role | 'TODOS';
export type StatusFilter = UserStatus | 'TODOS';

const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function useUserFilters(users: User[] | undefined) {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<RoleFilter>('TODOS');
  const [status, setStatus] = useState<StatusFilter>('TODOS');
  const debounced = useDebouncedValue(search, 250);

  const filtered = useMemo(() => {
    if (!users) return undefined;
    const q = normalize(debounced.trim());
    return users.filter(
      (u) =>
        (role === 'TODOS' || u.role === role) &&
        (status === 'TODOS' || u.status === status) &&
        (!q || normalize(u.name).includes(q) || normalize(u.email).includes(q)),
    );
  }, [users, debounced, role, status]);

  const isFiltering = debounced.trim() !== '' || role !== 'TODOS' || status !== 'TODOS';
  const clear = () => {
    setSearch('');
    setRole('TODOS');
    setStatus('TODOS');
  };

  return { search, setSearch, role, setRole, status, setStatus, filtered, isFiltering, clear };
}
