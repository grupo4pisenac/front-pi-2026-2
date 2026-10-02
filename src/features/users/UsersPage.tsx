import { useId, useState } from 'react';
import { Plus } from 'lucide-react';
import type { User, UserInput } from '@/types';
import { useSession } from '@/app/session';
import { useNow } from '@/hooks/useNow';
import { usePermission } from '@/hooks/usePermission';
import { formatInteger } from '@/lib/formatters';
import { Can } from '@/components/auth/Can';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, Card, CardHeader } from '@/components/ui';
import { useDeleteUser, useSaveUser, useUsers, useUsersStats } from './queries';
import { useUserFilters } from './hooks/useUserFilters';
import { UsersKpis } from './components/UsersKpis';
import { UserFilters } from './components/UserFilters';
import { UsersTable } from './components/UsersTable';
import { UserFormModal } from './components/UserFormModal';
import { DeleteUserModal } from './components/DeleteUserModal';

type FormState = { open: false } | { open: true; user: User | undefined };

export function UsersPage() {
  const now = useNow();
  const { user: me } = useSession();
  const canWrite = usePermission('users:write');
  const users = useUsers();
  const stats = useUsersStats();
  const saveUser = useSaveUser();
  const deleteUser = useDeleteUser();
  const filters = useUserFilters(users.data);
  const [form, setForm] = useState<FormState>({ open: false });
  const [toDelete, setToDelete] = useState<User | null>(null);
  const tableTitleId = useId();

  const openForm = (user?: User) => {
    saveUser.reset();
    setForm({ open: true, user });
  };

  const handleSave = (input: UserInput) =>
    saveUser.mutate({ id: form.open ? form.user?.id : undefined, input }, { onSuccess: () => setForm({ open: false }) });

  const handleDelete = (user: User) => deleteUser.mutate(user.id, { onSettled: () => setToDelete(null) });

  return (
    <>
      <PageHeader
        eyebrow="Administração"
        title="Gestão de usuários"
        subtitle="Controle quem acessa a plataforma e com qual perfil."
        action={
          <Can permission="users:write">
            <Button variant="primary" leftIcon={<Plus aria-hidden className="h-4 w-4" />} onClick={() => openForm()}>
              Novo usuário
            </Button>
          </Can>
        }
      />

      <div className="space-y-6">
        <UsersKpis data={stats.data} isLoading={stats.isLoading} isError={stats.isError} onRetry={() => stats.refetch()} />

        <Card aria-labelledby={tableTitleId} className="overflow-hidden">
          <CardHeader
            titleId={tableTitleId}
            title="Usuários"
            subtitle={
              filters.filtered
                ? filters.isFiltering
                  ? `${formatInteger(filters.filtered.length)} de ${formatInteger(users.data?.length ?? 0)} usuários`
                  : `${formatInteger(filters.filtered.length)} usuários cadastrados`
                : 'Carregando…'
            }
            className="pb-5"
          />
          <UserFilters
            search={filters.search}
            onSearch={filters.setSearch}
            role={filters.role}
            onRole={filters.setRole}
            status={filters.status}
            onStatus={filters.setStatus}
            isFiltering={filters.isFiltering}
            onClear={filters.clear}
          />
          <p className="sr-only" aria-live="polite">
            {filters.filtered && filters.isFiltering ? `${filters.filtered.length} usuários encontrados` : ''}
          </p>
          <UsersTable
            users={filters.filtered}
            isLoading={users.isLoading}
            isError={users.isError}
            onRetry={() => users.refetch()}
            canWrite={canWrite}
            currentUserId={me?.id}
            onEdit={openForm}
            onDelete={setToDelete}
            now={now}
            emptyAction={
              filters.isFiltering ? (
                <Button size="sm" onClick={filters.clear}>
                  Limpar filtros
                </Button>
              ) : undefined
            }
          />
        </Card>
      </div>

      <UserFormModal
        open={form.open}
        user={form.open ? form.user : undefined}
        onClose={() => setForm({ open: false })}
        onSubmit={handleSave}
        isSubmitting={saveUser.isPending}
        error={saveUser.error?.message ?? null}
      />
      <DeleteUserModal user={toDelete} onCancel={() => setToDelete(null)} onConfirm={handleDelete} isDeleting={deleteUser.isPending} />
    </>
  );
}
