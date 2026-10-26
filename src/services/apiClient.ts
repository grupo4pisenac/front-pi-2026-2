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

/** Sessão expirada e sem refresh válido: limpa os tokens e volta para o login. */
function redirectToLogin() {
  tokenStorage.clear();
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
    const message =
      typeof body === 'object' && body !== null && 'message' in body && typeof body.message === 'string'
        ? body.message
        : `Falha na requisição (${res.status})`;
    throw new ApiError(res.status, message, body);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/** Latência simulada para os mocks — deixa skeletons e transições visíveis em dev. */
export function mockDelay<T>(value: T, ms = 450 + Math.random() * 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(structuredClone(value)), ms));
}
