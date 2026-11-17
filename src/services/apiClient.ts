export const USE_MOCKS = (import.meta.env.VITE_USE_MOCKS ?? 'true') !== 'false';
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type Query = Record<string, string | number | boolean | undefined>;

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Query;
  signal?: AbortSignal;
  /** false = não tenta renovar o token em 401 (login/refresh) */
  auth?: boolean;
}

/* ─────────────────────────── Tokens JWT ─────────────────────────── */

const ACCESS_KEY = 'barto.token';
const REFRESH_KEY = 'barto.refreshToken';

export const tokenStorage = {
  get access(): string | null {
    return window.localStorage.getItem(ACCESS_KEY);
  },
  get refresh(): string | null {
    return window.localStorage.getItem(REFRESH_KEY);
  },
  set(accessToken: string, refreshToken: string) {
    window.localStorage.setItem(ACCESS_KEY, accessToken);
    window.localStorage.setItem(REFRESH_KEY, refreshToken);
  },
  clear() {
    window.localStorage.removeItem(ACCESS_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
  },
};

export const LOGIN_PATH = '/login';

/* ─────────────── Aviso exibido na tela de login após um redirect ─────────────── */

const LOGIN_NOTICE_KEY = 'barto.loginNotice';

export const loginNotice = {
  set(message: string) {
    try {
      window.sessionStorage.setItem(LOGIN_NOTICE_KEY, message);
    } catch {
      /* storage indisponível: segue sem o aviso */
    }
  },
  peek(): string | null {
    try {
      return window.sessionStorage.getItem(LOGIN_NOTICE_KEY);
    } catch {
      return null;
    }
  },
  clear() {
    try {
      window.sessionStorage.removeItem(LOGIN_NOTICE_KEY);
    } catch {
      /* nada a limpar */
    }
  },
};

export const SESSION_EXPIRED_MESSAGE = 'Sua sessão expirou ou não é mais válida. Entre novamente.';

/** Sessão expirada e sem refresh válido: limpa os tokens e volta para o login com um aviso. */
function redirectToLogin() {
  tokenStorage.clear();
  loginNotice.set(SESSION_EXPIRED_MESSAGE);
  if (window.location.pathname !== LOGIN_PATH) {
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.assign(`${LOGIN_PATH}?next=${next}`);
  }
}

/* ─────────────────────────── HTTP ─────────────────────────── */

function buildUrl(path: string, query?: Query): string {
  const qs = new URLSearchParams();
  Object.entries(query ?? {}).forEach(([k, v]) => {
    if (v !== undefined && v !== '') qs.set(k, String(v));
  });
  const s = qs.toString();
  return `${BASE_URL}${path}${s ? `?${s}` : ''}`;
}

function authHeader(): Record<string, string> {
  const token = tokenStorage.access;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Requisições paralelas que recebem 401 compartilham a mesma renovação
let refreshing: Promise<boolean> | null = null;

function refreshTokens(): Promise<boolean> {
  const refreshToken = tokenStorage.refresh;
  if (!refreshToken) return Promise.resolve(false);
  refreshing ??= fetch(buildUrl('/auth/refresh'), {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })
    .then(async (res) => {
      if (!res.ok) return false;
      const data = (await res.json()) as { accessToken: string; refreshToken: string };
      tokenStorage.set(data.accessToken, data.refreshToken);
      return true;
    })
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

function send(path: string, opts: RequestOptions): Promise<Response> {
  return fetch(buildUrl(path, opts.query), {
    method: opts.method ?? 'GET',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...authHeader() },
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
    signal: opts.signal,
  });
}

const DEFAULT_MESSAGES: Record<number, string> = {
  400: 'Requisição inválida.',
  401: 'Não autorizado. Verifique suas credenciais e entre novamente.',
  403: 'Você não tem permissão para realizar esta ação.',
  404: 'Recurso não encontrado.',
  422: 'Dados inválidos. Revise os campos e tente novamente.',
  429: 'Muitas tentativas. Aguarde um instante e tente novamente.',
};

/** Usa a mensagem do backend (`message` ou `detail` do FastAPI); senão, uma mensagem padrão pelo status. */
function errorMessage(status: number, body: unknown): string {
  if (typeof body === 'object' && body !== null) {
    if ('message' in body && typeof body.message === 'string' && body.message) return body.message;
    if ('detail' in body && typeof body.detail === 'string' && body.detail) return body.detail;
  }
  return DEFAULT_MESSAGES[status] ?? `Falha na requisição (${status}).`;
}

export async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  let res = await send(path, opts);

  if (res.status === 401 && opts.auth !== false) {
    if (await refreshTokens()) res = await send(path, opts);
    if (res.status === 401) redirectToLogin();
  }

  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = undefined;
    }
    throw new ApiError(res.status, errorMessage(res.status, body), body);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/**
 * Executa a chamada HTTP real ao backend FastAPI; se o servidor local estiver desligado
 * (erro de rede ou proxy 502/503/504/500 sem JSON da API), usa o espelho local com a mesma
 * regra de negócio do backend para manter o sistema 100% operacional.
 */
export async function withFallback<T>(httpCall: () => Promise<T>, fallbackCall: () => Promise<T>): Promise<T> {
  if (USE_MOCKS) return fallbackCall();
  try {
    return await httpCall();
  } catch (err) {
    if (isOfflineError(err)) {
      return fallbackCall();
    }
    throw err;
  }
}

/** Erro de rede ou 5xx sem o JSON da API: o backend está fora do ar (ou ainda acordando). */
export function isOfflineError(err: unknown): boolean {
  return (
    !(err instanceof ApiError) ||
    (err.status >= 500 && (err.body === undefined || typeof err.body !== 'object'))
  );
}

/** Latência rápida para transições fluidas */
export function mockDelay<T>(value: T, ms = 140): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(structuredClone(value)), ms));
}
