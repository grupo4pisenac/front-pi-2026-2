import { useCallback } from 'react';
import type { Permission } from '@/types';
import { hasPermission } from '@/lib/rbac';
import { useSession } from '@/app/session';

/** `usePermission('users:write')` → boolean; `usePermission()` → função `can(permission)`. */
export function usePermission(): (permission: Permission) => boolean;
export function usePermission(permission: Permission): boolean;
export function usePermission(permission?: Permission) {
  const { role } = useSession();
  const can = useCallback((p: Permission) => hasPermission(role, p), [role]);
  return permission ? can(permission) : can;
}
