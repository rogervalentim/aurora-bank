import axios, { type AxiosInstance, type AxiosError } from 'axios';
import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra as { apiUrl?: string } | undefined;

/** Base da API: `extra.apiUrl` do app.json ou o backoffice local. */
export const API_BASE_URL = extra?.apiUrl ?? 'http://localhost:3000';

/** Erro normalizado da API, com a mensagem que a tela deve exibir. */
export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status = 0) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/** Traduz qualquer falha (Axios, rede, timeout) em uma mensagem de produto. */
export function normalizeError(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  const axiosError = error as AxiosError<{ error?: { message?: string } | string }>;
  if (axiosError?.isAxiosError) {
    const payload = axiosError.response?.data;
    const message =
      typeof payload === 'string'
        ? payload
        : typeof payload?.error === 'string'
          ? payload.error
          : payload?.error?.message;
    if (message) return message;
    if (axiosError.code === 'ECONNABORTED') return 'A operação demorou demais. Tente novamente.';
    if (!axiosError.response) return 'Sem conexão com o Aurora Bank. Verifique sua internet.';
    return 'Não foi possível concluir a operação.';
  }
  if (error instanceof Error && error.message) return error.message;
  return 'Não foi possível concluir a operação.';
}

/** Cliente HTTP do app (JSON, timeout curto, sessão opcional no header). */
export function createHttpClient(getSessionId: () => string | null): AxiosInstance {
  const client = axios.create({ baseURL: API_BASE_URL, timeout: 15_000 });

  client.interceptors.request.use((config) => {
    const sessionId = getSessionId();
    if (sessionId) {
      config.headers.set('x-session-id', sessionId);
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      throw new ApiError(normalizeError(error), error.response?.status ?? 0);
    },
  );

  return client;
}
