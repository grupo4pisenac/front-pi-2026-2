import { ApiError, USE_MOCKS, isOfflineError, mockDelay, request } from './apiClient';

/** Resposta das três rotas de recuperação: `{ message }` */
interface MessageResponse {
  message: string;
}

export interface PasswordResetService {
  /** Etapa 1 — pede o código. O back responde 200 com a mesma mensagem exista o e-mail ou não. */
  requestCode(email: string): Promise<string>;
  /** Etapa 2 — confere o código sem gastá-lo (400 se inválido/expirado/bloqueado). */
  verifyCode(email: string, code: string): Promise<void>;
  /** Etapa 3 — gasta o código e troca a senha (400 se inválido/expirado/usado). */
  resetPassword(email: string, code: string, newPassword: string): Promise<void>;
}

const http: PasswordResetService = {
  requestCode: async (email) => {
    const data = await request<MessageResponse>('/auth/forgot-password', { method: 'POST', body: { email }, auth: false });
    return data.message;
  },
  verifyCode: async (email, code) => {
    await request<MessageResponse>('/auth/verify-reset-code', { method: 'POST', body: { email, code }, auth: false });
  },
  resetPassword: async (email, code, newPassword) => {
    // Atenção: o back espera `new_password` (snake_case), diferente do resto da API
    await request<MessageResponse>('/auth/reset-password', {
      method: 'POST',
      body: { email, code, new_password: newPassword },
      auth: false,
    });
  },
};

/** Modo mock (VITE_USE_MOCKS=true): o código aceito é sempre 123456, só para testar as telas. */
const MOCK_CODE = '123456';
const GENERIC_MESSAGE = 'Se o e-mail estiver cadastrado, enviaremos instruções para redefinir sua senha.';

const mock: PasswordResetService = {
  requestCode: () => mockDelay(GENERIC_MESSAGE, 300),
  verifyCode: async (_email, code) => {
    await mockDelay(undefined, 300);
    if (code !== MOCK_CODE) throw new ApiError(400, 'Código inválido ou expirado');
  },
  resetPassword: async (_email, code) => {
    await mockDelay(undefined, 300);
    if (code !== MOCK_CODE) throw new ApiError(400, 'Código inválido ou expirado');
  },
};

/** Servidor fora do ar vira uma mensagem clara, em vez de um erro de rede genérico. */
async function withOfflineMessage<T>(call: () => Promise<T>): Promise<T> {
  try {
    return await call();
  } catch (err) {
    if (isOfflineError(err)) {
      throw new ApiError(503, 'Servidor indisponível no momento. Tente novamente em instantes.');
    }
    throw err;
  }
}

export const passwordResetService: PasswordResetService = {
  requestCode: (email) => (USE_MOCKS ? mock.requestCode(email) : withOfflineMessage(() => http.requestCode(email))),
  verifyCode: (email, code) =>
    USE_MOCKS ? mock.verifyCode(email, code) : withOfflineMessage(() => http.verifyCode(email, code)),
  resetPassword: (email, code, newPassword) =>
    USE_MOCKS
      ? mock.resetPassword(email, code, newPassword)
      : withOfflineMessage(() => http.resetPassword(email, code, newPassword)),
};
