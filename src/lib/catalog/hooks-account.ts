"use client";

import { useCallback, useEffect, useState } from "react";
import { listMyAccess } from "@/lib/catalog/repo/access";
import {
  beginAccessFetch,
  beginOrdersFetch,
  clearAccountListsCache,
  hydrateAccessCache,
  hydrateOrdersCache,
  isAccessFetchCurrent,
  isOrdersFetchCurrent,
  peekCachedAccess,
  peekCachedOrders,
  writeAccessCache,
  writeOrdersCache,
} from "@/lib/catalog/repo/account-lists-cache";
import { listMyOrders } from "@/lib/catalog/repo/orders";
import { listMyWatchProgress } from "@/lib/catalog/repo/progress";
import {
  clearProfileCache,
  getMyProfile,
  hydrateProfileCache,
  onProfileChanged,
  peekCachedProfile,
} from "@/lib/catalog/repo/profile";
import type { Access, Order, Profile, QueryState, WatchProgress } from "@/lib/catalog/types";
import { onWatchProgressChanged } from "@/lib/catalog/watch-progress";
import { useAuthUser } from "@/lib/catalog/hooks";

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error("catalog_account");
}

type Settled<T> = { data: T; error: Error | null };

/** Called from async callbacks only; `prev` is the data shown for this request. */
type Settle<T> = (next: (prev: T) => Settled<T>) => void;

type AccountQuery<T> = {
  empty: T;
  /** Session cache for this user — painted instantly while the fetch runs. */
  readCache: (userId: string) => T | null;
  clearCache: () => void;
  /** Starts the fetch (and any subscriptions); returns the cleanup. */
  start: (userId: string, settle: Settle<T>) => () => void;
};

type AccountQueryResult<T> = QueryState<T> & { reload: () => void };

/**
 * Per-user account data. A result belongs to one request (user + reload
 * attempt); anything else is derived during render — cache for a new user,
 * empty when signed out — so a switch never paints the previous user's rows.
 */
function useAccountQuery<T>(query: AccountQuery<T>): AccountQueryResult<T> {
  const { data: user, loading: authLoading } = useAuthUser();
  const userId = user?.id ?? null;
  const [attempt, setAttempt] = useState(0);
  const [settled, setSettled] = useState<(Settled<T> & { key: string }) | null>(null);
  const key = userId ? `${userId}:${attempt}` : null;

  // Drop a result once its request is gone (sign-out, other user, reload).
  if (settled && settled.key !== key) setSettled(null);

  const reload = useCallback(() => setAttempt((value) => value + 1), []);

  useEffect(() => {
    if (authLoading) return;
    if (!userId) {
      query.clearCache();
      return;
    }
    const requestKey = `${userId}:${attempt}`;
    return query.start(userId, (next) => {
      setSettled((prev) => {
        const shown =
          prev?.key === requestKey
            ? prev.data
            : (query.readCache(userId) ?? query.empty);
        return { key: requestKey, ...next(shown) };
      });
    });
  }, [attempt, authLoading, query, userId]);

  if (settled && settled.key === key) {
    return { data: settled.data, loading: false, error: settled.error, reload };
  }
  if (!authLoading && !userId) {
    return { data: query.empty, loading: false, error: null, reload };
  }
  const cached = userId ? query.readCache(userId) : null;
  return { data: cached ?? query.empty, loading: !cached, error: null, reload };
}

const NO_ROWS: never[] = [];

const profileQuery: AccountQuery<Profile | null> = {
  empty: null,
  readCache: (userId) => peekCachedProfile(userId) ?? hydrateProfileCache(userId),
  clearCache: clearProfileCache,
  start(userId, settle) {
    let cancelled = false;

    // A missing row keeps what is shown (cache) instead of blanking it.
    function apply(profile: Profile | null) {
      if (cancelled) return;
      settle((prev) => ({ data: profile ?? prev, error: null }));
    }

    getMyProfile()
      .then(apply)
      .catch((error: unknown) => {
        if (cancelled) return;
        settle((prev) => ({ data: prev, error: toError(error) }));
      });

    const unsubscribe = onProfileChanged(() => {
      const snapshot = peekCachedProfile(userId);
      if (snapshot) apply(snapshot);
      getMyProfile({ fresh: true })
        .then(apply)
        .catch(() => undefined);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  },
};

const accessQuery: AccountQuery<Access[]> = {
  empty: NO_ROWS,
  readCache: (userId) => peekCachedAccess(userId) ?? hydrateAccessCache(userId),
  clearCache: clearAccountListsCache,
  start(userId, settle) {
    let cancelled = false;
    const gen = beginAccessFetch();

    listMyAccess()
      .then((data) => {
        if (cancelled || !isAccessFetchCurrent(gen)) return;
        writeAccessCache(userId, data);
        settle(() => ({ data, error: null }));
      })
      .catch((error: unknown) => {
        if (cancelled || !isAccessFetchCurrent(gen)) return;
        settle((prev) => ({ data: prev, error: toError(error) }));
      });

    return () => {
      cancelled = true;
    };
  },
};

const ordersQuery: AccountQuery<Order[]> = {
  empty: NO_ROWS,
  readCache: (userId) => peekCachedOrders(userId) ?? hydrateOrdersCache(userId),
  clearCache: clearAccountListsCache,
  start(userId, settle) {
    let cancelled = false;
    const gen = beginOrdersFetch();

    listMyOrders()
      .then((data) => {
        if (cancelled || !isOrdersFetchCurrent(gen)) return;
        writeOrdersCache(userId, data);
        settle(() => ({ data, error: null }));
      })
      .catch((error: unknown) => {
        if (cancelled || !isOrdersFetchCurrent(gen)) return;
        settle((prev) => ({ data: prev, error: toError(error) }));
      });

    return () => {
      cancelled = true;
    };
  },
};

export function useMyProfile(): AccountQueryResult<Profile | null> {
  return useAccountQuery(profileQuery);
}

export function useMyAccess(): AccountQueryResult<Access[]> {
  return useAccountQuery(accessQuery);
}

export function useMyOrders(): AccountQueryResult<Order[]> {
  return useAccountQuery(ordersQuery);
}

export function useMyWatchProgress(): QueryState<WatchProgress[]> {
  const [state, setState] = useState<QueryState<WatchProgress[]>>({
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    function applyList(data: WatchProgress[]) {
      if (!cancelled) setState({ data, loading: false, error: null });
    }

    listMyWatchProgress()
      .then(applyList)
      .catch(() => {
        if (!cancelled) setState({ data: [], loading: false, error: null });
      });

    const unsubscribe = onWatchProgressChanged((row) => {
      setState((prev) => {
        const rest = prev.data.filter((item) => item.productId !== row.productId);
        return { ...prev, data: [row, ...rest] };
      });
    });

    const onFocus = () => {
      listMyWatchProgress()
        .then(applyList)
        .catch(() => undefined);
    };
    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      unsubscribe();
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  return state;
}
