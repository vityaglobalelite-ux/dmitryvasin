"use client";

import { useEffect, useState } from "react";
import { getMyAccess } from "@/lib/catalog/repo/access";
import type { Access, QueryState } from "@/lib/catalog/types";

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error("catalog_access_entry");
}

export function useAccessEntry(
  productId: string | null,
  enabled: boolean,
): QueryState<Access | null> {
  const key = enabled && productId ? productId : "";
  const [fetched, setFetched] = useState<{
    key: string;
    data: Access | null;
    error: Error | null;
  }>({ key: "", data: null, error: null });

  useEffect(() => {
    if (!productId || !enabled) return undefined;

    let cancelled = false;
    const requestKey = productId;

    void getMyAccess(productId)
      .then((data) => {
        if (!cancelled) setFetched({ key: requestKey, data, error: null });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setFetched({
            key: requestKey,
            data: null,
            error: toError(error),
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, productId]);

  if (!key) {
    return { data: null, loading: false, error: null };
  }

  if (fetched.key !== key) {
    return { data: null, loading: true, error: null };
  }

  return {
    data: fetched.data,
    loading: false,
    error: fetched.error,
  };
}
