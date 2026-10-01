'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ApiError, apiGet } from './api';
import type { ListMeta } from './types';

type ApiState<T> = {
  data: T | null;
  meta: ListMeta | null;
  error: string | null;
  loading: boolean;
  reload: () => void;
};

type Result<T> = { path: string; data: T | null; meta: ListMeta | null; error: string | null };

const EMPTY: Result<never> = { path: '', data: null, meta: null, error: null };

/**
 * Fetches `path` whenever it changes.
 *
 * The result stores which path it belongs to, so "still loading" is derived
 * from `result.path !== path` instead of extra state updates: one fetch means
 * one render, not three. The request is aborted on cleanup, so a fast filter
 * change can never overwrite newer data.
 */
export function useApi<T>(path: string): ApiState<T> {
  const [result, setResult] = useState<Result<T>>(EMPTY);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    apiGet<{ data: T; meta?: ListMeta }>(path, controller.signal)
      .then((payload) => {
        setResult({ path, data: payload.data, meta: payload.meta ?? null, error: null });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        const error = err instanceof ApiError ? err.message : 'Could not load data';
        setResult({ path, data: null, meta: null, error });
      });

    return () => controller.abort();
  }, [path, nonce]);

  const loading = result.path !== path;
  const reload = useCallback(() => setNonce((value) => value + 1), []);

  // Rows already on screen stay visible while the next request runs,
  // so filtering never blanks the table.
  return { data: result.data, meta: result.meta, error: loading ? null : result.error, loading, reload };
}

/** Delays a fast changing value (like the search box) to limit requests. */
export function useDebounced<T>(value: T, delay = 350) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export type UrlFilters = Record<string, string>;

/**
 * Keeps search, filters and pagination in the URL.
 * Every list screen gets shareable links and a working browser back button for
 * free, and the page number never gets out of sync with the current filters.
 */
function useUrlFilters(defaults: UrlFilters) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters: UrlFilters = { ...defaults };
  for (const key of Object.keys(defaults)) {
    const value = searchParams.get(key);
    if (value !== null) filters[key] = value;
  }

  const setFilters = useCallback(
    (patch: UrlFilters) => {
      const next = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(patch)) {
        if (!value || value === defaults[key]) next.delete(key);
        else next.set(key, value);
      }
      // Changing a filter always sends the user back to the first page.
      if (!('page' in patch)) next.delete('page');

      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [defaults, pathname, router, searchParams]
  );

  return [filters, setFilters] as const;
}

/**
 * Debounced search box.
 *
 * The local value updates on every keystroke so typing feels instant, while the
 * URL - and therefore the request - only follows after a short pause. This also
 * keeps typing inside the component instead of an effect in every screen.
 */
export function useSearchBox(defaults: UrlFilters) {
  const [filters, setFilters] = useUrlFilters(defaults);
  const [value, setValue] = useState(filters.search);
  const debounced = useDebounced(value);

  useEffect(() => {
    if (debounced === filters.search) return;
    setFilters({ search: debounced, page: '1' });
  }, [debounced, filters.search, setFilters]);

  return [filters, setFilters, value, setValue] as const;
}
