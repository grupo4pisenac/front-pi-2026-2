import { Trash2 } from 'lucide-react';
import type { User } from '@/types';
import { Button, Modal } from '@/components/ui';

interface DeleteUserModalProps {
  user: User | null;
  onCancel: () => void;
  onConfirm: (user: User) => void;
  isDeleting: boolean;
}

export function DeleteUserModal({ user, onCancel, onConfirm, isDeleting }: DeleteUserModalProps) {
  return (
    <Modal
      open={user !== null}
      onClose={onCancel}
      size="sm"
      title="Excluir usuário?"
      leading={
        <span aria-hidden className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-tile bg-danger-soft text-danger">
          <Trash2 className="h-5 w-5" strokeWidth={1.75} />
        </span>
      }
      description={
        user && (
          <>
            <strong className="font-semibold text-ink">{user.name}</strong> perderá o acesso imediatamente. Esta ação não pode ser desfeita.
          </>
        )
      }
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onCancel} data-autofocus>
            Cancelar
          </Button>
          <Button variant="danger" size="sm" loading={isDeleting} onClick={() => user && onConfirm(user)}>
            Excluir usuário
          </Button>
        </>
      }
    />
  );
}
