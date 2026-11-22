import { Check, Clock, Mail, Moon, Shield, Sun, UserCheck } from 'lucide-react';
import type { Permission } from '@/types';
import { useSession } from '@/app/session';
import { useTheme } from '@/app/theme';
import { useNow } from '@/hooks/useNow';
import { formatDateTime, formatRelative } from '@/lib/formatters';
import { hasPermission, ROLE_LABEL, ROLES } from '@/lib/rbac';
import { PageHeader } from '@/components/layout/PageHeader';
import { Avatar, Badge, Button, Card, CardBody, CardHeader, Skeleton } from '@/components/ui';

const PERMISSION_META: { key: Permission; label: string; description: string }[] = [
  { key: 'dashboard:read', label: 'Painel executivo', description: 'Visualizar indicadores gerais e resumo de telemetria' },
  { key: 'climate:read', label: 'Clima & Telemetria', description: 'Consultar séries históricas, amplitude diária e mapa de calor' },
  { key: 'irrigation:read', label: 'Irrigação & VPD', description: 'Acessar cálculo de demanda evaporativa e janela ideal de rega' },
  { key: 'forecast:read', label: 'Safra & Talhões', description: 'Consultar curvas de previsão de colheita e avanço fenológico' },
  { key: 'forecast:write', label: 'Ajuste de previsões', description: 'Editar a produção mensal projetada de cada cultura' },
  { key: 'sensors:read', label: 'Mapa de estações', description: 'Monitorar saúde da rede e localização das estações ESP32' },
  { key: 'sensors:write', label: 'Gestão de estações & ingestão', description: 'Cadastrar/editar sensores e sincronizar ThingSpeak manualmente' },
  { key: 'users:read', label: 'Consulta de usuários', description: 'Listar membros da equipe e estatísticas de acesso' },
  { key: 'users:write', label: 'Administração de contas', description: 'Criar, editar e remover usuários e atribuir perfis RBAC' },
];

export function ProfilePage() {
  const now = useNow();
  const { user, simulateRole } = useSession();
  const { theme, setTheme } = useTheme();

  if (!user) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-64 w-full rounded-card" />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Conta & Preferências"
        title="Meu perfil"
        subtitle="Dados da sessão autenticada (`/auth/me`), preferências visuais e permissões RBAC do seu perfil."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <Card>
            <CardBody className="space-y-5">
              <div className="flex items-center gap-4">
                <Avatar name={user.name} className="h-14 w-14 text-base" />
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-lg font-semibold text-ink">{user.name}</h2>
                  <p className="truncate text-xs text-ink-subtle">{user.email}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge tone="success" dot>
                      {ROLE_LABEL[user.role]}
                    </Badge>
                    <Badge tone={user.status === 'ATIVO' ? 'neutral' : 'danger'}>{user.status}</Badge>
                  </div>
                </div>
              </div>

              <dl className="space-y-3 border-t border-border pt-4 text-xs">
                <div className="flex items-center justify-between">
                  <dt className="inline-flex items-center gap-1.5 text-ink-subtle">
                    <Mail aria-hidden className="h-3.5 w-3.5" />
                    E-mail
                  </dt>
                  <dd className="font-medium text-ink">{user.email}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="inline-flex items-center gap-1.5 text-ink-subtle">
                    <Clock aria-hidden className="h-3.5 w-3.5" />
                    Último acesso
                  </dt>
                  <dd className="font-medium text-ink">{formatRelative(user.lastAccessAt, now)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="inline-flex items-center gap-1.5 text-ink-subtle">
                    <UserCheck aria-hidden className="h-3.5 w-3.5" />
                    Conta criada em
                  </dt>
                  <dd className="font-medium text-ink">{formatDateTime(user.createdAt)}</dd>
                </div>
              </dl>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Aparência da interface" subtitle="Escolha entre o tema claro ou escuro" />
            <CardBody>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  aria-pressed={theme === 'light'}
                  className={`flex items-center gap-2.5 rounded-tile border p-3 text-left text-xs font-semibold transition-all ${
                    theme === 'light'
                      ? 'border-brand bg-brand-soft text-brand'
                      : 'border-border bg-canvas/60 text-ink-muted hover:border-border-strong'
                  }`}
                >
                  <Sun aria-hidden className="h-4 w-4" />
                  Modo Claro
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  aria-pressed={theme === 'dark'}
                  className={`flex items-center gap-2.5 rounded-tile border p-3 text-left text-xs font-semibold transition-all ${
                    theme === 'dark'
                      ? 'border-brand bg-brand-soft text-brand'
                      : 'border-border bg-canvas/60 text-ink-muted hover:border-border-strong'
                  }`}
                >
                  <Moon aria-hidden className="h-4 w-4" />
                  Modo Escuro
                </button>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Simulador de perfil RBAC"
              subtitle="Teste a visualização como Administrador, Analista ou Produtor"
            />
            <CardBody className="flex flex-wrap gap-2">
              {ROLES.map((r) => (
                <Button
                  key={r}
                  size="sm"
                  variant={user.role === r ? 'primary' : 'secondary'}
                  onClick={() => simulateRole(r)}
                >
                  {ROLE_LABEL[r]}
                </Button>
              ))}
            </CardBody>
          </Card>
        </div>

        <Card className="lg:col-span-2">
          <CardHeader
            title="Escopos de permissão (RBAC)"
            subtitle={`Permissões ativas para o perfil ${ROLE_LABEL[user.role]} conforme a matriz de segurança da API FastAPI`}
          />
          <CardBody>
            <ul className="divide-y divide-border">
              {PERMISSION_META.map((item) => {
                const allowed = hasPermission(user.role, item.key);
                return (
                  <li key={item.key} className="flex items-start justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-[13.5px] font-semibold text-ink">{item.label}</p>
                      <p className="mt-0.5 text-xs text-ink-muted">{item.description}</p>
                      <code className="mt-1 inline-block rounded bg-canvas px-1.5 py-0.5 font-mono text-[11px] text-ink-subtle">
                        {item.key}
                      </code>
                    </div>
                    <Badge tone={allowed ? 'success' : 'neutral'} dot>
                      {allowed ? (
                        <span className="inline-flex items-center gap-1">
                          <Check aria-hidden className="h-3 w-3" /> Liberado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <Shield aria-hidden className="h-3 w-3" /> Restrito
                        </span>
                      )}
                    </Badge>
                  </li>
                );
              })}
            </ul>
          </CardBody>
        </Card>
      </div>
    </>
  );
}

