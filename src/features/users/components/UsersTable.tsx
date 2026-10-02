import type { ReactNode } from 'react';
import { Pencil, Trash2, Users } from 'lucide-react';
import type { User } from '@/types';
import { ROLE_LABEL } from '@/lib/rbac';
import { formatRelative } from '@/lib/formatters';
import { Avatar, Badge, Button, DataTable, EmptyState, type Column } from '@/components/ui';

interface UsersTableProps {
  users: User[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  canWrite: boolean;
  currentUserId: string | undefined;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  now: number;
  emptyAction?: ReactNode;
}

function buildColumns({ canWrite, currentUserId, onEdit, onDelete, now }: Pick<UsersTableProps, 'canWrite' | 'currentUserId' | 'onEdit' | 'onDelete' | 'now'>): Column<User>[] {
  const cols: Column<User>[] = [
    {
      key: 'user',
      header: 'Usuário',
      mobile: 'title',
      render: (u) => (
        <div className="flex items-center gap-3">
          <Avatar name={u.name} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-semibold text-ink">
              {u.name}
              {u.id === currentUserId && <span className="ml-1.5 text-xs font-medium text-ink-subtle">(você)</span>}
            </p>
            <p className="truncate text-xs text-ink-subtle">{u.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'role', header: 'Perfil', render: (u) => <Badge tone="outline">{ROLE_LABEL[u.role]}</Badge> },
    {
      key: 'status',
      header: 'Status',
      render: (u) =>
        u.status === 'ATIVO' ? (
          <Badge tone="success" dot>
            Ativo
          </Badge>
        ) : (
          <Badge tone="danger" dot>
            Inativo
          </Badge>
        ),
    },
    {
      key: 'last',
      header: 'Último acesso',
      render: (u) => <span className="text-ink-muted">{formatRelative(u.lastAccessAt, now)}</span>,
    },
  ];

  if (canWrite) {
    cols.push({
      key: 'actions',
      header: '',
      align: 'right',
      mobile: 'actions',
      className: 'w-28',
      render: (u) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" aria-label={`Editar ${u.name}`} onClick={() => onEdit(u)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="danger-ghost"
            size="icon"
            aria-label={`Excluir ${u.name}`}
            onClick={() => onDelete(u)}
            disabled={u.id === currentUserId}
            title={u.id === currentUserId ? 'Você não pode excluir a própria conta' : undefined}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    });
  }
  return cols;
}

export function UsersTable({ users, isLoading, isError, onRetry, emptyAction, ...rest }: UsersTableProps) {
  return (
    <DataTable
      caption="Usuários da plataforma"
      columns={buildColumns(rest)}
      rows={users}
      getRowId={(u) => u.id}
      isLoading={isLoading}
      isError={isError}
      onRetry={onRetry}
      skeletonRows={6}
      empty={<EmptyState icon={Users} title="Nenhum usuário encontrado" description="Tente outro termo de busca ou ajuste os filtros." action={emptyAction} />}
    />
  );
}
