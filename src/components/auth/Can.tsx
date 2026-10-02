import type { ReactNode } from 'react';
import type { Permission } from '@/types';
import { usePermission } from '@/hooks/usePermission';

interface CanProps {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

export function Can({ permission, children, fallback = null }: CanProps) {
  return <>{usePermission(permission) ? children : fallback}</>;
}
