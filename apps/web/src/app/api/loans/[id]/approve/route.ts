import { sandboxHandlers } from '@/lib/handlers';
import { errorResponse, json } from '@/lib/http';

/** PATCH /api/loans/:id/approve — aprova o crédito e credita o valor na conta. */
export async function PATCH(_request: Request, context: { params: Promise<{ id: string }> }): Promise<Response> {
  const { id } = await context.params;
  const proposal = sandboxHandlers.approveProposal(id);
  if (!proposal) return errorResponse(404, 'Proposta não encontrada.');
  return json(proposal);
}
