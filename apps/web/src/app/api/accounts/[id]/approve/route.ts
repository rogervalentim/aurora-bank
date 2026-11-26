import { sandboxHandlers } from '@/lib/handlers';
import { errorResponse, json } from '@/lib/http';

/** PATCH /api/accounts/:id/approve — aprova o KYC e ativa a conta. */
export async function PATCH(_request: Request, context: { params: Promise<{ id: string }> }): Promise<Response> {
  const { id } = await context.params;
  const account = sandboxHandlers.approveAccount(id);
  if (!account) return errorResponse(404, 'Conta não encontrada.');
  return json(account);
}
