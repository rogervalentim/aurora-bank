import { z } from 'zod';
import type { ApiErrorBody } from '@/lib/types';

/** Erro de validação com o mapa campo → mensagem. */
export class ValidationError extends Error {
  readonly fields: Readonly<Record<string, string>>;

  constructor(error: z.ZodError) {
    super('Não foi possível validar os dados enviados.');
    this.name = 'ValidationError';
    this.fields = toFieldMap(error);
  }

  toBody(): ApiErrorBody {
    return { code: 'UNPROCESSABLE_ENTITY', status: 422, message: this.message, fields: this.fields };
  }
}

/** Achata os issues do Zod em `campo → primeira mensagem`. */
export function toFieldMap(error: z.ZodError): Readonly<Record<string, string>> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_';
    fields[key] ??= issue.message;
  }
  return fields;
}
