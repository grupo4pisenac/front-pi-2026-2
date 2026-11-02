import type { User } from '@/types';
import { mockDelay, request, tokenStorage, withFallback } from './apiClient';
import { currentUserId, usersDb } from './mocks/data';

export interface LoginInput {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

const LOGGED_OUT_KEY = 'barto.loggedOut';

export interface AuthService {
  login(input: LoginInput): Promise<User>;
  logout(): Promise<void>;
  isAuthenticated(): boolean;
}

const http: AuthService = {
  login: async (input) => {
    const data = await request<LoginResponse>('/auth/login', { method: 'POST', body: input, auth: false });
    window.localStorage.removeItem(LOGGED_OUT_KEY);
    tokenStorage.set(data.accessToken, data.refreshToken);
    return data.user;
  },
  logout: async () => {
    const refreshToken = tokenStorage.refresh;
    window.localStorage.setItem(LOGGED_OUT_KEY, 'true');
    try {
      if (refreshToken && !refreshToken.startsWith('local_')) {
        await request<void>('/auth/logout', { method: 'POST', body: { refreshToken }, auth: false });
      }
    } catch {
      /* token já expirado — segue o logout local */
    } finally {
      tokenStorage.clear();
    }
  },
  isAuthenticated: () => {
    if (tokenStorage.access !== null) return true;
    // Garante entrada direta caso o usuário ainda não tenha clicado em "Sair"
    if (window.localStorage.getItem(LOGGED_OUT_KEY) !== 'true') {
      tokenStorage.set(`local_access_${currentUserId}`, `local_refresh_${currentUserId}`);
      return true;
    }
    return false;
  },
};

const fallback: AuthService = {
  login: (input) => {
    const match = usersDb.find((u) => u.email.toLowerCase() === input.email.toLowerCase());
    const user = match ?? usersDb.find((u) => u.id === currentUserId) ?? usersDb[0]!;
    window.localStorage.removeItem(LOGGED_OUT_KEY);
    tokenStorage.set(`local_access_${user.id}`, `local_refresh_${user.id}`);
    return mockDelay(user, 120);
  },
  logout: () => {
    window.localStorage.setItem(LOGGED_OUT_KEY, 'true');
    tokenStorage.clear();
    return mockDelay(undefined, 100);
  },
  isAuthenticated: () => http.isAuthenticated(),
};

export const authService: AuthService = {
  login: (input) => withFallback(() => http.login(input), () => fallback.login(input)),
  logout: () => http.logout(),
  isAuthenticated: () => fallback.isAuthenticated(),
};
