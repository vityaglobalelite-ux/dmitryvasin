"use client";

import { useCallback, useEffect, useState } from "react";
import { listMyAccess } from "@/lib/catalog/repo/access";
import { listMyOrders } from "@/lib/catalog/repo/orders";
import type { Access, Order, QueryState } from "@/lib/catalog/types";

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error("catalog_account");
}

export function useMyAccess(): QueryState<Access[]> {
  const [state, setState] = useState<QueryState<Access[]>>({
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    setState({ data: [], loading: true, error: null });

    listMyAccess()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({ data: [], loading: false, error: toError(error) });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

export function useMyOrders(): QueryState<Order[]> & { reload: () => void } {
  const [state, setState] = useState<QueryState<Order[]>>({
    data: [],
    loading: true,
    error: null,
  });
  const [tick, setTick] = useState(0);

  const reload = useCallback(() => {
    setTick((value) => value + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    listMyOrders()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({ data: [], loading: false, error: toError(error) });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [tick]);

  return { ...state, reload };
}
