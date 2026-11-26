import { NextResponse } from 'next/server';
import type { ApiErrorBody } from '@/lib/types';

/** Resposta JSON com `no-store` — dados operacionais nunca em cache. */
export function json<T>(data: T, status = 200): NextResponse<T> {
  return NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
}

/** Erro padronizado da API REST. */
export function errorResponse(status: number, message: string, fields?: Readonly<Record<string, string>>): NextResponse<ApiErrorBody> {
  const code =
    status === 400
      ? 'BAD_REQUEST'
      : status === 401
        ? 'UNAUTHORIZED'
        : status === 403
          ? 'FORBIDDEN'
          : status === 404
            ? 'NOT_FOUND'
            : status === 422
              ? 'UNPROCESSABLE_ENTITY'
              : 'INTERNAL';

  const body: ApiErrorBody = fields ? { code, status, message, fields } : { code, status, message };
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

/** Lê o corpo JSON com segurança (sem lançar em corpo vazio/inválido). */
export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
