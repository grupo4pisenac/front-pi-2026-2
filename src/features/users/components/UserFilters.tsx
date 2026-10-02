import { useId } from 'react';
import { Search, X } from 'lucide-react';
import { ROLE_LABEL, ROLES } from '@/lib/rbac';
import { Button, Input, Select } from '@/components/ui';
import type { RoleFilter, StatusFilter } from '../hooks/useUserFilters';

interface UserFiltersProps {
  search: string;
  onSearch: (v: string) => void;
  role: RoleFilter;
  onRole: (v: RoleFilter) => void;
  status: StatusFilter;
  onStatus: (v: StatusFilter) => void;
  isFiltering: boolean;
  onClear: () => void;
}

export function UserFilters({ search, onSearch, role, onRole, status, onStatus, isFiltering, onClear }: UserFiltersProps) {
  const searchId = useId();
  const roleId = useId();
  const statusId = useId();

  return (
    <div className="flex flex-col gap-3 px-6 pb-5 sm:flex-row sm:items-center" role="search">
      <div className="flex-1 sm:max-w-xs">
        <label htmlFor={searchId} className="sr-only">
          Buscar por nome ou e-mail
        </label>
        <Input
          id={searchId}
          type="search"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Buscar por nome ou e-mail"
          leftIcon={<Search className="h-4 w-4" />}
          className="h-9 text-[13px]"
        />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:flex">
        <div>
          <label htmlFor={roleId} className="sr-only">
            Filtrar por perfil
          </label>
          <Select id={roleId} value={role} onChange={(e) => onRole(e.target.value as RoleFilter)} className="h-9 text-[13px] sm:w-48">
            <option value="TODOS">Todos os perfis</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABEL[r]}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label htmlFor={statusId} className="sr-only">
            Filtrar por status
          </label>
          <Select id={statusId} value={status} onChange={(e) => onStatus(e.target.value as StatusFilter)} className="h-9 text-[13px] sm:w-40">
            <option value="TODOS">Todos os status</option>
            <option value="ATIVO">Ativo</option>
            <option value="INATIVO">Inativo</option>
          </Select>
        </div>
      </div>
      {isFiltering && (
        <Button variant="ghost" size="sm" leftIcon={<X aria-hidden className="h-3.5 w-3.5" />} onClick={onClear}>
          Limpar filtros
        </Button>
      )}
    </div>
  );
}
