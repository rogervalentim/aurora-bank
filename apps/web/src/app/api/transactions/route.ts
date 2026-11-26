import { sandboxHandlers } from '@/lib/handlers';
import { json } from '@/lib/http';

/** GET /api/transactions — extrato consolidado (mais recentes primeiro). */
export function GET(): Response {
  return json(sandboxHandlers.transactions());
}
