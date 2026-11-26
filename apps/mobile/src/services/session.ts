import AsyncStorage from '@react-native-async-storage/async-storage';
import { setSessionId } from './api';

const SESSION_KEY = 'aurora.customer.session';

export interface CustomerSession {
  readonly userId: string;
  readonly fullName: string;
  readonly accountId: string;
  readonly email: string;
}

/** Lê a sessão salva no aparelho. */
export async function loadSession(): Promise<CustomerSession | null> {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CustomerSession;
    setSessionId(parsed.userId);
    return parsed;
  } catch {
    return null;
  }
}

/** Salva a sessão do cliente e a injeta no cliente HTTP. */
export async function saveSession(session: CustomerSession): Promise<void> {
  setSessionId(session.userId);
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

/** Encerra a sessão. */
export async function clearSession(): Promise<void> {
  setSessionId(null);
  await AsyncStorage.removeItem(SESSION_KEY);
}
