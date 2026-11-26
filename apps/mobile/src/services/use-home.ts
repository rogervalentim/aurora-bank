import { useCallback, useEffect, useState } from 'react';
import { router } from 'expo-router';
import type { AccountDTO, TransactionDTO } from '@/lib/types';
import { getHome } from '@/services/banking';
import { loadSession, type CustomerSession } from '@/services/session';
import { normalizeError } from '@/services/http';

interface HomeState {
  readonly session: CustomerSession | null;
  readonly account: AccountDTO | null;
  readonly transactions: readonly TransactionDTO[];
  readonly loading: boolean;
  readonly error: string | null;
}

const initialState: HomeState = {
  session: null,
  account: null,
  transactions: [],
  loading: true,
  error: null,
};

/** Carrega sessão + conta + extrato da Home. */
export function useHome(): HomeState & { readonly reload: () => void } {
  const [state, setState] = useState<HomeState>(initialState);

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    const session = await loadSession();
    if (!session) {
      router.replace('/onboarding');
      setState({ ...initialState, loading: false });
      return;
    }
    try {
      const home = await getHome(session.accountId);
      setState({
        session,
        account: home.account,
        transactions: home.transactions,
        loading: false,
        error: null,
      });
    } catch (cause) {
      setState({ session, account: null, transactions: [], loading: false, error: normalizeError(cause) });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { ...state, reload: () => void load() };
}
