import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, KeyRound, Lock, Mail } from 'lucide-react';
import { ApiError, LOGIN_PATH } from '@/services/apiClient';
import { passwordResetService } from '@/services/passwordResetService';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button, Field, Input } from '@/components/ui';

type Step = 'email' | 'code' | 'password' | 'done';

const STEP_NUMBER: Record<Exclude<Step, 'done'>, number> = { email: 1, code: 2, password: 3 };

/** Mesmas regras do back (ResetPasswordRequest): 8 a 72 caracteres. */
const MIN_PASSWORD = 8;
/** O bcrypt só aproveita 72 bytes; letras acentuadas ocupam 2, então medimos em bytes. */
const MAX_PASSWORD_BYTES = 72;
/** Espera antes de permitir "Reenviar código" (o back limita 5 pedidos a cada 15 min por IP) */
const RESEND_COOLDOWN_S = 60;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function errorMessage(err: unknown, fallback: string): string {
  if (!(err instanceof ApiError)) return fallback;
  if (err.status === 429) return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
  return err.message || fallback;
}

function passwordProblem(password: string, confirm: string): string | null {
  if (password.length < MIN_PASSWORD) return `A senha precisa ter pelo menos ${MIN_PASSWORD} caracteres.`;
  if (new TextEncoder().encode(password).length > MAX_PASSWORD_BYTES) return 'A senha é longa demais (máximo de 72 caracteres).';
  if (password !== confirm) return 'As senhas não coincidem.';
  return null;
}

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Contagem regressiva do botão "Reenviar código"
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const goTo = (next: Step) => {
    setError(null);
    setStep(next);
  };

  /* Etapa 1 — pedir o código (também usada por "Reenviar código") */
  const requestCode = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const message = await passwordResetService.requestCode(email.trim().toLowerCase());
      // Sempre a mesma mensagem: não revela se o e-mail existe (evita enumeração de usuários)
      setInfo(message);
      setCode('');
      setCooldown(RESEND_COOLDOWN_S);
      goTo('code');
    } catch (err) {
      setError(errorMessage(err, 'Não foi possível enviar o código.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmail = async (e: FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setError('Informe um e-mail válido.');
      return;
    }
    await requestCode();
  };

  /* Etapa 2 — conferir o código (não o gasta) */
  const handleCode = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      setError('O código tem 6 números.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await passwordResetService.verifyCode(email.trim().toLowerCase(), code);
      setInfo(null);
      goTo('password');
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 400
          ? 'Código inválido ou expirado. Depois de 5 tentativas erradas o código é bloqueado: nesse caso, peça um novo.'
          : errorMessage(err, 'Não foi possível validar o código.'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* Etapa 3 — trocar a senha (gasta o código) */
  const handlePassword = async (e: FormEvent) => {
    e.preventDefault();
    const problem = passwordProblem(password, confirm);
    if (problem) {
      setError(problem);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await passwordResetService.resetPassword(email.trim().toLowerCase(), code, password);
      // Não deixa código nem senha na memória da página depois de usados
      setCode('');
      setPassword('');
      setConfirm('');
      goTo('done');
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        // O código expirou ou foi bloqueado entre a etapa 2 e a 3: volta para pedir outro
        setCode('');
        setStep('code');
        setError('O código expirou ou já foi usado. Peça um novo código para continuar.');
      } else {
        setError(errorMessage(err, 'Não foi possível redefinir a senha.'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const errorBox = error && (
    <p role="alert" className="rounded-tile bg-danger-soft px-3 py-2 text-[13px] text-danger">
      {error}
    </p>
  );

  return (
    <AuthLayout>
      {step !== 'done' && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-subtle">Etapa {STEP_NUMBER[step]} de 3</p>
      )}

      {step === 'email' && (
        <>
          <h1 className="text-xl font-semibold tracking-tight text-ink">Recuperar senha</h1>
          <p className="mt-1 text-[13px] text-ink-muted">
            Informe o e-mail da sua conta. Enviaremos um código de 6 números para você criar uma nova senha.
          </p>
          <form onSubmit={handleEmail} noValidate className="mt-6 space-y-4">
            <Field label="E-mail">
              {(id) => (
                <Input
                  id={id}
                  type="email"
                  autoComplete="email"
                  autoFocus
                  leftIcon={<Mail className="h-4 w-4" />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@empresa.com"
                />
              )}
            </Field>
            {errorBox}
            <Button variant="primary" type="submit" loading={submitting} className="w-full justify-center">
              Enviar código
            </Button>
          </form>
        </>
      )}

      {step === 'code' && (
        <>
          <h1 className="text-xl font-semibold tracking-tight text-ink">Digite o código</h1>
          <p className="mt-1 text-[13px] text-ink-muted">
            {info ?? 'Enviamos um código para o seu e-mail.'} Ele vale por 15 minutos.
          </p>
          <form onSubmit={handleCode} noValidate className="mt-6 space-y-4">
            <Field label="Código de verificação" hint={`Enviado para ${email.trim().toLowerCase()}`}>
              {(id, describedBy) => (
                <Input
                  id={id}
                  aria-describedby={describedBy}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  autoFocus
                  maxLength={6}
                  leftIcon={<KeyRound className="h-4 w-4" />}
                  value={code}
                  // Aceita colar "123 456" ou "123-456": guarda só os números
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="font-semibold tracking-[0.4em] tabular-nums"
                />
              )}
            </Field>
            {errorBox}
            <Button variant="primary" type="submit" loading={submitting} className="w-full justify-center">
              Validar código
            </Button>
            <div className="flex items-center justify-between gap-3 text-[13px]">
              <button type="button" onClick={() => goTo('email')} className="font-semibold text-ink-muted hover:text-ink">
                Usar outro e-mail
              </button>
              <button
                type="button"
                disabled={cooldown > 0 || submitting}
                onClick={() => void requestCode()}
                className="font-semibold text-brand hover:underline disabled:cursor-not-allowed disabled:text-ink-subtle disabled:no-underline"
              >
                {cooldown > 0 ? `Reenviar código em ${cooldown}s` : 'Reenviar código'}
              </button>
            </div>
          </form>
        </>
      )}

      {step === 'password' && (
        <>
          <h1 className="text-xl font-semibold tracking-tight text-ink">Crie uma nova senha</h1>
          <p className="mt-1 text-[13px] text-ink-muted">Use pelo menos 8 caracteres. Evite repetir senhas antigas.</p>
          <form onSubmit={handlePassword} noValidate className="mt-6 space-y-4">
            <Field label="Nova senha">
              {(id) => (
                <Input
                  id={id}
                  type="password"
                  autoComplete="new-password"
                  autoFocus
                  leftIcon={<Lock className="h-4 w-4" />}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              )}
            </Field>
            <Field label="Confirmar nova senha">
              {(id) => (
                <Input
                  id={id}
                  type="password"
                  autoComplete="new-password"
                  leftIcon={<Lock className="h-4 w-4" />}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                />
              )}
            </Field>
            {errorBox}
            <Button variant="primary" type="submit" loading={submitting} className="w-full justify-center">
              Salvar nova senha
            </Button>
          </form>
        </>
      )}

      {step === 'done' && (
        <div role="status" className="flex flex-col items-center text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand">
            <CheckCircle2 aria-hidden className="h-6 w-6" />
          </span>
          <h1 className="mt-4 text-xl font-semibold tracking-tight text-ink">Senha redefinida</h1>
          <p className="mt-1 text-[13px] text-ink-muted">Sua senha foi alterada. Entre novamente usando a nova senha.</p>
          <Button variant="primary" onClick={() => navigate(LOGIN_PATH, { replace: true })} className="mt-6 w-full justify-center">
            Voltar ao login
          </Button>
        </div>
      )}

      {step !== 'done' && (
        <Link
          to={LOGIN_PATH}
          className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-muted hover:text-ink"
        >
          <ArrowLeft aria-hidden className="h-3.5 w-3.5" />
          Voltar ao login
        </Link>
      )}
    </AuthLayout>
  );
}
