'use client';

import { useCallback, useEffect, useState } from 'react';
import { HttpError } from '@/services/errors';

export interface AsyncState<T> {
  readonly data: T | null;
  readonly loading: boolean;
  readonly error: string | null;
  readonly reload: () => void;
}

/** Executa uma promise de carregamento com estados loading / error / empty. */
export function useAsync<T>(loader: () => Promise<T>, deps: readonly unknown[] = []): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => setNonce((value) => value + 1), []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    loader()
      .then((result) => {
        if (active) setData(result);
      })
      .catch((cause: unknown) => {
        if (!active) return;
        setError(cause instanceof HttpError ? cause.message : 'Não foi possível carregar os dados.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  return { data, loading, error, reload };
}
