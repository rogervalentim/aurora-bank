import type { NextRequest } from 'next/server';
import { sandboxHandlers } from '@/lib/handlers';
import { errorResponse, json, readJson } from '@/lib/http';
import { createLoanBodySchema, loanQuerySchema } from '@/lib/validation';

/** GET /api/loans/consignado — fila de propostas. */
export function GET(request: NextRequest): Response {
  const parsed = loanQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) return errorResponse(422, 'Filtro inválido.');
  return json(sandboxHandlers.listProposals(parsed.data.status));
}

/** POST /api/loans/consignado — envia proposta para a mesa (UNDER_REVIEW). */
export async function POST(request: NextRequest): Promise<Response> {
  const parsed = createLoanBodySchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return errorResponse(422, 'Proposta inválida.', Object.fromEntries(
      parsed.error.issues.map((issue) => [issue.path.join('.') || '_', issue.message]),
    ));
  }
  const proposal = sandboxHandlers.createProposal(parsed.data);
  if (!proposal) return errorResponse(404, 'Conta não encontrada.');
  if (!proposal.isWithinMargin) {
    return errorResponse(422, 'A parcela excede a margem consignável de 35% da renda mensal.', {
      amountCents: 'Valor acima da margem consignável.',
    });
  }
  return json(proposal, 201);
}
