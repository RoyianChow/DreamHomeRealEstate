"use client";

import { useEffect, useState } from "react";
import type { ApiResult } from "@/lib/types";

type RecordsState<T> = {
  rows: T[];
  isLoading: boolean;
  error: string | null;
  /** Re-runs the loader - called after every successful create or update. */
  reload: () => Promise<void>;
};

type Snapshot<T> = { rows: T[]; isLoading: boolean; error: string | null };

function toSnapshot<T>(result: ApiResult<T[]>): Snapshot<T> {
  return result.ok
    ? { rows: result.data, isLoading: false, error: null }
    : { rows: [], isLoading: false, error: result.message };
}

/**
 * Loads a list from the API and exposes the loading / error / empty states the
 * tables need. Every page uses this instead of its own fetch-and-set logic, so
 * "refresh the list after save" behaves identically across Staff, Branch and
 * Client.
 *
 * `loader` must be a stable reference - pass one of the api-client functions.
 */
export function useRecords<T>(loader: () => Promise<ApiResult<T[]>>): RecordsState<T> {
  const [snapshot, setSnapshot] = useState<Snapshot<T>>({
    rows: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const result = await loader();
      // Ignore a response that arrives after the component has gone away.
      if (!cancelled) setSnapshot(toSnapshot(result));
    })();

    return () => {
      cancelled = true;
    };
  }, [loader]);

  /** Manual refresh: after a save, or from the Refresh list button. */
  async function reload() {
    setSnapshot((current) => ({ ...current, isLoading: true }));
    setSnapshot(toSnapshot(await loader()));
  }

  return { ...snapshot, reload };
}
