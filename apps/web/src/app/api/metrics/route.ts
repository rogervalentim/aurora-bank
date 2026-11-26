import { sandboxHandlers } from '@/lib/handlers';
import { json } from '@/lib/http';

/** GET /api/metrics — KPIs do dashboard operacional. */
export function GET(): Response {
  return json(sandboxHandlers.metrics());
}
