import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import { useSession } from '@/app/session';
import { authService } from '@/services/authService';
import { ApiError } from '@/services/apiClient';
import { Logo } from '@/components/layout/Logo';
import { Button, Card, Field, Input } from '@/components/ui';

/** Só aceita caminhos internos no ?next= (evita open redirect) */
function safeNext(next: string | null): string {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/';
}

export function LoginPage() {
  const { isAuthenticated, signIn } = useSession();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to={next} replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Informe e-mail e senha.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const user = await authService.login({ email: email.trim().toLowerCase(), password });
      signIn(user);
      navigate(next, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível conectar ao servidor.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-10">
      <div className="w-full max-w-sm animate-page-in">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <Card className="p-6 sm:p-8">
          <h1 className="text-lg font-semibold tracking-tight text-ink">Entrar</h1>
          <p className="mt-1 text-[13px] text-ink-muted">Acesse o painel de clima e safra.</p>

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
            <Field label="E-mail">
              {(id) => (
                <Input
                  id={id}
                  type="email"
                  autoComplete="username"
                  autoFocus
                  leftIcon={<Mail className="h-4 w-4" />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@empresa.com.br"
                />
              )}
            </Field>
            <Field label="Senha">
              {(id) => (
                <Input
                  id={id}
                  type="password"
                  autoComplete="current-password"
                  leftIcon={<Lock className="h-4 w-4" />}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              )}
            </Field>
            {error && (
              <p role="alert" className="rounded-tile bg-danger-soft px-3 py-2 text-[13px] text-danger">
                {error}
              </p>
            )}
            <Button variant="primary" type="submit" loading={submitting} className="w-full justify-center">
              Entrar
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
