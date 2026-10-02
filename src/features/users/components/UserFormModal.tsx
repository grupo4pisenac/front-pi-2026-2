import { useEffect, useState, type FormEvent } from 'react';
import type { Role, User, UserInput, UserStatus } from '@/types';
import { ROLE_LABEL, ROLES } from '@/lib/rbac';
import { Button, Field, Input, Modal, Select } from '@/components/ui';

interface UserFormModalProps {
  open: boolean;
  /** undefined = novo usuário */
  user: User | undefined;
  onClose: () => void;
  onSubmit: (input: UserInput) => void;
  isSubmitting: boolean;
  error: string | null;
}

const EMPTY: UserInput = { name: '', email: '', role: 'PRODUTOR_EXPORTADOR', status: 'ATIVO' };
type Errors = Partial<Record<keyof UserInput, string>>;

function validate(v: UserInput): Errors {
  const e: Errors = {};
  if (v.name.trim().split(/\s+/).length < 2) e.name = 'Informe nome e sobrenome.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) e.email = 'Informe um e-mail válido.';
  return e;
}

export function UserFormModal({ open, user, onClose, onSubmit, isSubmitting, error }: UserFormModalProps) {
  const [values, setValues] = useState<UserInput>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (open) {
      setValues(user ? { name: user.name, email: user.email, role: user.role, status: user.status } : EMPTY);
      setErrors({});
    }
  }, [open, user]);

  const set = <K extends keyof UserInput>(k: K, v: UserInput[K]) => setValues((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length === 0) onSubmit({ ...values, name: values.name.trim(), email: values.email.trim().toLowerCase() });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={user ? 'Editar usuário' : 'Novo usuário'}
      description={user ? 'Atualize o perfil de acesso e o status.' : 'O convite de acesso é enviado por e-mail após o cadastro.'}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" type="submit" form="user-form" loading={isSubmitting}>
            {user ? 'Salvar alterações' : 'Criar usuário'}
          </Button>
        </>
      }
    >
      <form id="user-form" noValidate onSubmit={handleSubmit} className="space-y-4">
        <Field label="Nome completo" error={errors.name}>
          {(id, d) => <Input id={id} aria-describedby={d} aria-invalid={!!errors.name} data-autofocus value={values.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" />}
        </Field>
        <Field label="E-mail corporativo" error={errors.email}>
          {(id, d) => <Input id={id} type="email" aria-describedby={d} aria-invalid={!!errors.email} value={values.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" />}
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Perfil de acesso">
            {(id) => (
              <Select id={id} value={values.role} onChange={(e) => set('role', e.target.value as Role)}>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABEL[r]}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Status">
            {(id) => (
              <Select id={id} value={values.status} onChange={(e) => set('status', e.target.value as UserStatus)}>
                <option value="ATIVO">Ativo</option>
                <option value="INATIVO">Inativo</option>
              </Select>
            )}
          </Field>
        </div>
        {error && (
          <p role="alert" className="rounded-tile bg-danger-soft px-3 py-2 text-[13px] text-danger">
            {error}
          </p>
        )}
      </form>
    </Modal>
  );
}
