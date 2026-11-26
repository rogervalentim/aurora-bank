import type { NextRequest } from 'next/server';
import { sandboxHandlers } from '@/lib/handlers';
import { errorResponse, json, readJson } from '@/lib/http';
import { rejectionBodySchema } from '@/lib/validation';

/** PATCH /api/loans/:id/reject — recusa a proposta com motivo. */
export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }): Promise<Response> {
  const { id } = await context.params;
  const parsed = rejectionBodySchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return errorResponse(422, 'Motivo da recusa inválido.', { reason: parsed.error.issues[0]?.message ?? '' });
  }
  const proposal = sandboxHandlers.rejectProposal(id, parsed.data.reason);
  if (!proposal) return errorResponse(404, 'Proposta não encontrada.');
  return json(proposal);
}
