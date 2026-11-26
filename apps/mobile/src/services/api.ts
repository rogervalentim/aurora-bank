import { createHttpClient } from './http';

/** Identificador da sessão do cliente (sandbox). */
const SESSION_KEY = 'aurora.customer.session';

let sessionId: string | null = null;

/** Cliente HTTP compartilhado pelo app. */
export const http = createHttpClient(() => sessionId);

/** Define a sessão usada no header `x-session-id`. */
export function setSessionId(id: string | null): void {
  sessionId = id;
}

export { SESSION_KEY };
