import type { NextRequest } from 'next/server';
import { sandboxHandlers } from '@/lib/handlers';
import { errorResponse, json, readJson } from '@/lib/http';
import { rejectionBodySchema } from '@/lib/validation';

/** PATCH /api/accounts/:id/reject — reprova o KYC com motivo. */
export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }): Promise<Response> {
  const { id } = await context.params;
  const parsed = rejectionBodySchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return errorResponse(422, 'Motivo da recusa inválido.', { reason: parsed.error.issues[0]?.message ?? '' });
  }
  const account = sandboxHandlers.rejectAccount(id, parsed.data.reason);
  if (!account) return errorResponse(404, 'Conta não encontrada.');
  return json(account);
}
