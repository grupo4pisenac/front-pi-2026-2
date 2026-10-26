import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Role, User } from '@/types';
import { usersService } from '@/services/usersService';
import { authService } from '@/services/authService';
import { ApiError, LOGIN_PATH, tokenStorage } from '@/services/apiClient';

const SESSION_KEY = ['session', 'me'] as const;

interface SessionValue {
  user: User | undefined;
  role: Role | undefined;
  isLoading: boolean;
  /** Há tokens salvos (ou modo mock) — mesmo antes de o /auth/me responder */
  isAuthenticated: boolean;
  /** Apenas em modo mock: simula outro perfil para testar o RBAC. */
  simulateRole: (role: Role | null) => void;
  /** Chamado pela tela de login após autenticar */
  signIn: (user: User) => void;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [isAuthenticated, setAuthenticated] = useState(() => authService.isAuthenticated());
  const { data: user, isLoading, error } = useQuery({
    queryKey: SESSION_KEY,
    queryFn: () => usersService.me(),
    staleTime: Infinity,
    enabled: isAuthenticated,
  });
  const [roleOverride, setRoleOverride] = useState<Role | null>(null);

  // Conta desativada ou removida com a sessão aberta: o back recusa o /auth/me (4xx) — volta ao login
  useEffect(() => {
    if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
      tokenStorage.clear();
      queryClient.clear();
      setAuthenticated(false);
    }
  }, [error, queryClient]);

  const signIn = useCallback(
    (u: User) => {
      queryClient.setQueryData(SESSION_KEY, u);
      setAuthenticated(true);
    },
    [queryClient],
  );

  const signOut = useCallback(async () => {
    await authService.logout();
    queryClient.clear();
    setAuthenticated(false);
    setRoleOverride(null);
    window.location.assign(LOGIN_PATH);
  }, [queryClient]);

  const value = useMemo<SessionValue>(
    () => ({
      user: user && roleOverride ? { ...user, role: roleOverride } : user,
      role: roleOverride ?? user?.role,
      isLoading: isAuthenticated && isLoading,
      isAuthenticated,
      simulateRole: setRoleOverride,
      signIn,
      signOut,
    }),
    [user, roleOverride, isLoading, isAuthenticated, signIn, signOut],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession deve ser usado dentro de <SessionProvider>');
  return ctx;
}
