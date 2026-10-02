import type { Role } from './rbac';

export type UserStatus = 'ATIVO' | 'INATIVO';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  /** ISO 8601 */
  lastAccessAt: string | null;
  /** ISO 8601 */
  createdAt: string;
}

export interface UserInput {
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
}

export interface UsersStats {
  total: number;
  addedThisMonth: number;
  active: number;
  admins: number;
}
