import type { ApiErrorBody } from '@/lib/types';

/** Erro de API já normalizado, lançado pela camada de serviço. */
export class HttpError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields?: Readonly<Record<string, string>>;

  constructor(body: ApiErrorBody) {
    super(body.message);
    this.name = 'HttpError';
    this.status = body.status;
    this.code = body.code;
    if (body.fields) {
      this.fields = body.fields;
    }
  }
}

/** Mapa status HTTP → código normalizado (SPEC §7). */
const CODE_BY_STATUS: Readonly<Record<number, string>> = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  422: 'UNPROCESSABLE_ENTITY',
  500: 'INTERNAL',
};

/** Normaliza qualquer falha em um `ApiErrorBody` tipado. */
export function normalizeError(status: number, payload: unknown): ApiErrorBody {
  const code = CODE_BY_STATUS[status] ?? 'INTERNAL';
  const message =
    typeof payload === 'object' && payload !== null && 'message' in payload && typeof payload.message === 'string'
      ? payload.message
      : defaultMessage(status);
  const fields =
    typeof payload === 'object' && payload !== null && 'fields' in payload
      ? (payload.fields as Record<string, string>)
      : undefined;

  return fields ? { code, status, message, fields } : { code, status, message };
}

function defaultMessage(status: number): string {
  switch (status) {
    case 400:
      return 'Requisição inválida.';
    case 401:
      return 'Sessão expirada. Entre novamente.';
    case 403:
      return 'Seu perfil não tem permissão para esta ação.';
    case 422:
      return 'Não foi possível validar os dados enviados.';
    default:
      return 'Serviço indisponível. Tente novamente.';
  }
}
