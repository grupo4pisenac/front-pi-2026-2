import { useEffect, useState, type FormEvent } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Mail, RadioTower, ShieldCheck, Sprout } from 'lucide-react';
import { useSession } from '@/app/session';
import { ThemeToggle } from '@/app/theme';
import { authService } from '@/services/authService';
import { ApiError, loginNotice } from '@/services/apiClient';
import { Logo } from '@/components/layout/Logo';
import { Button, Card, Field, Input } from '@/components/ui';

/** Só aceita caminhos internos no ?next= (evita open redirect) */
function safeNext(next: string | null): string {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/';
}

/** Mensagem amigável para falhas de login, priorizando a resposta do backend. */
function loginErrorMessage(err: unknown): string {
  if (!(err instanceof ApiError)) return 'Não foi possível conectar ao servidor.';
  if (err.status === 401) return err.message || 'E-mail ou senha incorretos.';
  if (err.status === 403) return err.message || 'Sua conta não tem acesso à plataforma.';
  return err.message;
}

const SEED_ACCOUNTS = [
  { label: 'Admin', email: 'admin@barto.io' },
  { label: 'Analista', email: 'analista@barto.io' },
  { label: 'Produtor', email: 'produtor@barto.io' },
] as const;

export function LoginPage() {
  const { isAuthenticated, signIn } = useSession();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // Aviso deixado por um redirect (ex.: sessão expirada / 401 do backend)
  const [notice, setNotice] = useState<string | null>(() => loginNotice.peek());

  useEffect(() => {
    loginNotice.clear();
  }, []);

  if (isAuthenticated) return <Navigate to={next} replace />;

  const performLogin = async (loginEmail: string, loginPassword: string) => {
    setSubmitting(true);
    setError(null);
    setNotice(null);
    try {
      const user = await authService.login({ email: loginEmail.trim().toLowerCase(), password: loginPassword });
      signIn(user);
      navigate(next, { replace: true });
    } catch (err) {
      setError(loginErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Informe e-mail e senha.');
      return;
    }
    await performLogin(email, password);
  };

  return (
    <div className="relative flex min-h-screen flex-col justify-center bg-canvas px-4 py-10">
      <div className=" fixed right-5 top-5 z-20">
        <ThemeToggle showLabel />
      </div>

      <div className="mx-auto grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-card border border-border bg-surface shadow-pop lg:grid-cols-12">
        {/* Painel visual lateral */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-[#0D2618] p-8 text-white lg:col-span-6 lg:flex">
          <img
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80"
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover opacity-35 mix-blend-luminosity"
          />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#081A10] via-[#0D2618]/85 to-[#123522]/70" />

          <div className="relative z-10 flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-tile bg-emerald-500 text-slate-950">
              <Sprout className="h-5 w-5" strokeWidth={2.2} />
            </span>
            <div>
              <p className="text-lg font-bold tracking-tight">bartô.io</p>
              <p className="text-xs text-emerald-200/80">Vale do São Francisco · PE/BA</p>
            </div>
          </div>

          <div className="relative z-10 space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-emerald-200 backdrop-blur-sm">
              <RadioTower className="h-3.5 w-3.5 text-emerald-400" />
              Telemetria IoT · ThingSpeak + ESP32
            </span>
            <h2 className="text-2xl font-semibold leading-snug tracking-tight">
              Inteligência climática para fruticultura irrigada de exportação.
            </h2>
            <p className="text-xs leading-relaxed text-emerald-100/75">
              Acompanhe temperatura, umidade do ar, demanda evaporativa (VPD) e previsão de safra em tempo real nas
              estações de Petrolina e Juazeiro.
            </p>
          </div>
        </div>

        {/* Formulário de autenticação */}
        <div className="flex flex-col justify-center p-6 sm:p-10 lg:col-span-6">
          <div className="mb-6 lg:hidden">
            <Logo />
          </div>

          <Card className="border-0 shadow-none">
            <h1 className="text-xl font-semibold tracking-tight text-ink">Entrar na plataforma</h1>
            <p className="mt-1 text-[13px] text-ink-muted">Acesse o painel de monitoramento climático e de safra.</p>

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
                    placeholder="admin@barto.io"
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
                    placeholder="••••••••"
                  />
                )}
              </Field>
              {notice && !error && (
                <p role="status" className="rounded-tile bg-danger-soft px-3 py-2 text-[13px] text-danger">
                  {notice}
                </p>
              )}
              {error && (
                <p role="alert" className="rounded-tile bg-danger-soft px-3 py-2 text-[13px] text-danger">
                  {error}
                </p>
              )}
              <Button variant="primary" type="submit" loading={submitting} className="w-full justify-center">
                Entrar
              </Button>
            </form>

            {/* Acesso rápido com as credenciais do seed do backend */}
            <div className="mt-6 border-t border-border pt-5">
              <p className="flex items-center gap-1.5 text-xs font-medium text-ink-subtle">
                <ShieldCheck aria-hidden className="h-3.5 w-3.5 text-brand" />
                Acesso rápido (perfis do seed `app.seed`):
              </p>
              <div className="mt-2.5 grid grid-cols-3 gap-2">
                {SEED_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    disabled={submitting}
                    onClick={() => {
                      setEmail(acc.email);
                      setPassword('barto@2026');
                      void performLogin(acc.email, 'barto@2026');
                    }}
                    className="rounded-tile border border-border bg-canvas/70 px-2.5 py-2 text-center text-xs font-semibold text-ink transition-colors hover:border-brand hover:bg-brand-soft hover:text-brand"
                  >
                    {acc.label}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
