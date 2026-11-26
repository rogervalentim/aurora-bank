import type { AnalystSession } from '@/lib/types';

/** Credenciais fixas do sandbox: não há Firebase configurado neste ambiente. */
export const DEMO_ANALYST = {
  email: 'analista@aurorabank.com',
  password: 'aurora2025',
} as const;

const DEMO_SESSION: AnalystSession = {
  uid: 'analyst_demo',
  email: DEMO_ANALYST.email,
  displayName: 'Analista Aurora',
  role: 'analyst',
};

const SESSION_KEY = 'aurora.backoffice.session';

/** Autentica o analista (Firebase Auth no ambiente real, sandbox aqui). */
export async function signInAnalyst(email: string, password: string): Promise<AnalystSession> {
  if (email.trim().toLowerCase() !== DEMO_ANALYST.email || password !== DEMO_ANALYST.password) {
    throw new Error('Credenciais inválidas.');
  }
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(DEMO_SESSION));
  }
  return DEMO_SESSION;
}

/** Encerra a sessão do analista. */
export async function signOutAnalyst(): Promise<void> {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(SESSION_KEY);
  }
}

/** Sessão atual, se houver. */
export function getSession(): AnalystSession | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<AnalystSession>;
    return parsed.role === 'analyst' && typeof parsed.email === 'string' ? DEMO_SESSION : null;
  } catch {
    return null;
  }
}
