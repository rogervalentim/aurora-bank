import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { HttpError, normalizeError } from './errors';

/** Provedor do token do Firebase (injetável para testes e SSR). */
export type TokenProvider = () => Promise<string | null>;

let tokenProvider: TokenProvider = async () => null;

/** Define a origem do `Bearer` token — o app registra `firebase/auth` aqui. */
export function setTokenProvider(provider: TokenProvider): void {
  tokenProvider = provider;
}

/** URL base configurável via `.env` (API_BASE_URL). */
export function resolveBaseUrl(): string {
  return process.env['NEXT_PUBLIC_API_BASE_URL'] ?? '';
}

/** Cria a instância Axios com os interceptors padronizados. */
export function createApiClient(instance?: AxiosInstance): AxiosInstance {
  const client =
    instance ??
    axios.create({
      baseURL: resolveBaseUrl(),
      timeout: 15_000,
      headers: { 'Content-Type': 'application/json' },
    });

  client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    const token = await tokenProvider();
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      const status = error.response?.status ?? 500;
      throw new HttpError(normalizeError(status, error.response?.data));
    },
  );

  return client;
}

/** Cliente HTTP compartilhado pelas telas. */
export const api = createApiClient();
