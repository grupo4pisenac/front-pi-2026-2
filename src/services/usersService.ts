import type { User, UserInput, UsersStats } from '@/types';
import { ApiError, mockDelay, request, tokenStorage, withFallback } from './apiClient';
import { currentUserId, usersDb } from './mocks/data';

export interface UsersService {
  me(): Promise<User>;
  list(): Promise<User[]>;
  stats(): Promise<UsersStats>;
  create(input: UserInput): Promise<User>;
  update(id: string, input: UserInput): Promise<User>;
  remove(id: string): Promise<void>;
}

const http: UsersService = {
  me: () => request('/auth/me'),
  list: () => request('/users'),
  stats: () => request('/users/stats'),
  create: (input) => request('/users', { method: 'POST', body: input }),
  update: (id, input) => request(`/users/${id}`, { method: 'PUT', body: input }),
  remove: (id, ) => request(`/users/${id}`, { method: 'DELETE' }),
};

function computeStats(users: User[]): UsersStats {
  const now = new Date();
  return {
    total: users.length,
    addedThisMonth: users.filter((u) => {
      const d = new Date(u.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length,
    active: users.filter((u) => u.status === 'ATIVO').length,
    admins: users.filter((u) => u.role === 'ADMIN').length,
  };
}

function findIndex(id: string): number {
  const i = usersDb.findIndex((u) => u.id === id);
  if (i < 0) throw new ApiError(404, 'Usuário não encontrado');
  return i;
}

function resolveCurrentFallbackUser(): User {
  const token = tokenStorage.access;
  if (token?.startsWith('local_access_')) {
    const id = token.replace('local_access_', '');
    const found = usersDb.find((u) => u.id === id);
    if (found) return found;
  }
  return usersDb.find((u) => u.id === currentUserId) ?? usersDb[0]!;
}

const fallback: UsersService = {
  me: () => mockDelay(resolveCurrentFallbackUser(), 100),
  list: () => mockDelay(usersDb),
  stats: () => mockDelay(computeStats(usersDb)),
  create: (input) => {
    if (usersDb.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
      return Promise.reject(new ApiError(409, 'Já existe um usuário com este e-mail'));
    }
    const { password: _password, ...data } = input;
    const user: User = {
      ...data,
      id: `usr_${Date.now()}`,
      lastAccessAt: null,
      createdAt: new Date().toISOString(),
    };
    usersDb.unshift(user);
    return mockDelay(user);
  },
  update: (id, input) => {
    const i = findIndex(id);
    const { password: _password, ...data } = input;
    const updated: User = { ...usersDb[i]!, ...data };
    usersDb[i] = updated;
    return mockDelay(updated);
  },
  remove: (id) => {
    usersDb.splice(findIndex(id), 1);
    return mockDelay(undefined);
  },
};

export const usersService: UsersService = {
  me: () => withFallback(() => http.me(), () => fallback.me()),
  list: () => withFallback(() => http.list(), () => fallback.list()),
  stats: () => withFallback(() => http.stats(), () => fallback.stats()),
  create: (input) => withFallback(() => http.create(input), () => fallback.create(input)),
  update: (id, input) => withFallback(() => http.update(id, input), () => fallback.update(id, input)),
  remove: (id) => withFallback(() => http.remove(id), () => fallback.remove(id)),
};
