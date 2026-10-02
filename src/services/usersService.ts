import type { User, UserInput, UsersStats } from '@/types';
import { ApiError, USE_MOCKS, mockDelay, request } from './apiClient';
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
  remove: (id) => request(`/users/${id}`, { method: 'DELETE' }),
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

const mock: UsersService = {
  me: () => mockDelay(usersDb.find((u) => u.id === currentUserId) ?? usersDb[0]!, 150),
  list: () => mockDelay(usersDb),
  stats: () => mockDelay(computeStats(usersDb)),
  create: (input) => {
    if (usersDb.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
      return Promise.reject(new ApiError(409, 'Já existe um usuário com este e-mail'));
    }
    const user: User = {
      ...input,
      id: `usr_${Date.now()}`,
      lastAccessAt: null,
      createdAt: new Date().toISOString(),
    };
    usersDb.unshift(user);
    return mockDelay(user);
  },
  update: (id, input) => {
    const i = findIndex(id);
    const updated: User = { ...usersDb[i]!, ...input };
    usersDb[i] = updated;
    return mockDelay(updated);
  },
  remove: (id) => {
    usersDb.splice(findIndex(id), 1);
    return mockDelay(undefined);
  },
};

export const usersService: UsersService = USE_MOCKS ? mock : http;
