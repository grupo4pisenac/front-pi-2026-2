import type { User } from '@/types';
import { USE_MOCKS, mockDelay, request, tokenStorage } from './apiClient';
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

export interface AuthService {
  login(input: LoginInput): Promise<User>;
  logout(): Promise<void>;
  isAuthenticated(): boolean;
}

const http: AuthService = {
  login: async (input) => {
    const data = await request<LoginResponse>('/auth/login', { method: 'POST', body: input, auth: false });
    tokenStorage.set(data.accessToken, data.refreshToken);
    return data.user;
  },
  logout: async () => {
    const refreshToken = tokenStorage.refresh;
    try {
      // Sem endpoint de revogação no back: o logout é local, a chamada só registra a saída
      if (refreshToken) await request<void>('/auth/logout', { method: 'POST', body: { refreshToken }, auth: false });
    } catch {
      /* token já expirado — segue o logout local */
    } finally {
      tokenStorage.clear();
    }
  },
  isAuthenticated: () => tokenStorage.access !== null,
};

const mock: AuthService = {
  login: () => mockDelay(usersDb.find((u) => u.id === currentUserId) ?? usersDb[0]!),
  logout: () => mockDelay(undefined, 150),
  isAuthenticated: () => true,
};

export const authService: AuthService = USE_MOCKS ? mock : http;
