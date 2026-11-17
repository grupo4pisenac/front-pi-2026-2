import type { User } from '@/types';
import { ApiError, USE_MOCKS, isOfflineError, mockDelay, request, tokenStorage } from './apiClient';
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
    const access = tokenStorage.access;
    // Token local (gerado em modo mock/offline) não vale no backend real: descarta em vez de
    // mandá-lo ao servidor e receber 401 em toda requisição.
    if (access !== null && !USE_MOCKS && access.startsWith('local_')) {
      tokenStorage.clear();
      return false;
    }
    if (access !== null) return true;
    // Com o backend real, só há sessão se houver um token emitido por ele. Fabricar um token
    // local aqui faz o /auth/me responder 401 → redirect para /login → novo token local →
    // volta para "/" → 401… num loop infinito de recarregamentos (a tela "pisca").
    if (!USE_MOCKS) return false;
    // Modo mock: garante entrada direta caso o usuário ainda não tenha clicado em "Sair"
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

/**
 * Com o backend real, o login nunca cai no mock: se o servidor estiver fora do ar,
 * é melhor avisar do que fingir que o login deu certo com um token local.
 */
async function loginWithBackend(input: LoginInput): Promise<User> {
  try {
    return await http.login(input);
  } catch (err) {
    if (isOfflineError(err)) {
      throw new ApiError(503, 'Servidor indisponível no momento. Tente novamente em instantes.');
    }
    throw err;
  }
}

export const authService: AuthService = {
  login: (input) => (USE_MOCKS ? fallback.login(input) : loginWithBackend(input)),
  logout: () => http.logout(),
  isAuthenticated: () => fallback.isAuthenticated(),
};
