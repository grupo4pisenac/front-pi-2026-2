import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Role, User } from '@/types';
import { usersService } from '@/services/usersService';

interface SessionValue {
  user: User | undefined;
  role: Role | undefined;
  isLoading: boolean;
  /** Apenas em modo mock: simula outro perfil para testar o RBAC. */
  simulateRole: (role: Role | null) => void;
}

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useQuery({
    queryKey: ['session', 'me'],
    queryFn: () => usersService.me(),
    staleTime: Infinity,
  });
  const [roleOverride, setRoleOverride] = useState<Role | null>(null);

  const value = useMemo<SessionValue>(
    () => ({
      user: user && roleOverride ? { ...user, role: roleOverride } : user,
      role: roleOverride ?? user?.role,
      isLoading,
      simulateRole: setRoleOverride,
    }),
    [user, roleOverride, isLoading],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession deve ser usado dentro de <SessionProvider>');
  return ctx;
}
