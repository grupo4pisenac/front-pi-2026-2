import type { Permission, Role } from '@/types';

const READ_CORE: Permission[] = [
  'dashboard:read',
  'forecast:read',
  'climate:read',
  'irrigation:read',
  'reports:read',
  'sensors:read',
];

/**
 * Matriz de permissões. O backend é a autoridade final (o front apenas esconde/desabilita);
 * mantenha sincronizada com as authorities emitidas pelo Spring Security.
 */
export const ROLE_PERMISSIONS: Record<Role, ReadonlySet<Permission>> = {
  ADMIN: new Set<Permission>([...READ_CORE, 'analytics:read', 'sensors:write', 'users:read', 'users:write']),
  ANALISTA_DADOS: new Set<Permission>([...READ_CORE, 'analytics:read', 'users:read']),
  PRODUTOR_EXPORTADOR: new Set<Permission>(READ_CORE),
};

export const ROLE_LABEL: Record<Role, string> = {
  ADMIN: 'Administrador',
  ANALISTA_DADOS: 'Analista de dados',
  PRODUTOR_EXPORTADOR: 'Produtor/Exportador',
};

export const ROLES: readonly Role[] = ['ADMIN', 'ANALISTA_DADOS', 'PRODUTOR_EXPORTADOR'];

export function hasPermission(role: Role | undefined, permission: Permission): boolean {
  return role ? ROLE_PERMISSIONS[role].has(permission) : false;
}
