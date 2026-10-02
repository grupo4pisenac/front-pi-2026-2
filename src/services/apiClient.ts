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
}

function buildUrl(path: string, query?: Query): string {
  const qs = new URLSearchParams();
  Object.entries(query ?? {}).forEach(([k, v]) => {
    if (v !== undefined && v !== '') qs.set(k, String(v));
  });
  const s = qs.toString();
  return `${BASE_URL}${path}${s ? `?${s}` : ''}`;
}

/** Token JWT emitido pelo Spring Security. Ajuste para o fluxo real de login. */
function authHeader(): Record<string, string> {
  const token = window.localStorage.getItem('barto.token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const res = await fetch(buildUrl(path, opts.query), {
    method: opts.method ?? 'GET',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...authHeader() },
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
    signal: opts.signal,
  });

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
