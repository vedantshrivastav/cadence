import { useCallback, useEffect, useRef, useState } from 'react';

interface ApiState<T> {
  data: T | null;
  error: string | null;
  /** First load (show a spinner). */
  loading: boolean;
  /** Pull-to-refresh in progress. */
  refreshing: boolean;
  /** Pull-to-refresh: keeps showing old data while reloading. */
  refresh: () => Promise<void>;
  /** Hard reload: shows the loading state again (e.g. "Try again" button). */
  reload: () => Promise<void>;
}

/** Runs `fetcher` on mount and exposes loading / error / refresh state. */
export function useApi<T>(fetcher: () => Promise<T>): ApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Always call the latest fetcher without re-running the effect every render.
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const mounted = useRef(true);
  useEffect(() => () => { mounted.current = false; }, []);

  const run = useCallback(async (mode: 'load' | 'refresh') => {
    if (mode === 'load') setLoading(true);
    else setRefreshing(true);
    try {
      const result = await fetcherRef.current();
      if (mounted.current) {
        setData(result);
        setError(null);
      }
    } catch (e) {
      if (mounted.current) setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      if (mounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    run('load');
  }, [run]);

  return {
    data,
    error,
    loading,
    refreshing,
    refresh: useCallback(() => run('refresh'), [run]),
    reload: useCallback(() => run('load'), [run]),
  };
}
