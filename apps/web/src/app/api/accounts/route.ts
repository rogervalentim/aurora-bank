import type { NextRequest } from 'next/server';
import { sandboxHandlers, validationResponse } from '@/lib/handlers';
import { errorResponse, json, readJson } from '@/lib/http';
import { accountQuerySchema, createAccountBodySchema } from '@/lib/validation';

/** GET /api/accounts — lista contas, opcionalmente por status. */
export function GET(request: NextRequest): Response {
  try {
    const query = accountQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    return json(sandboxHandlers.listAccounts(query.status));
  } catch (error) {
    return validationResponse(error);
  }
}

/** POST /api/accounts — abre conta com status PENDING_KYC. */
export async function POST(request: NextRequest): Promise<Response> {
  const body = await readJson(request);
  const parsed = createAccountBodySchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(422, 'Dados da conta inválidos.', Object.fromEntries(
      parsed.error.issues.map((issue) => [issue.path.join('.') || '_', issue.message]),
    ));
  }
  return json(sandboxHandlers.createAccount(parsed.data), 201);
}
