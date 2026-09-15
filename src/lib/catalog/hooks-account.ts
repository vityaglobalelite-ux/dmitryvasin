"use client";

import { useCallback, useEffect, useState } from "react";
import { listMyAccess } from "@/lib/catalog/repo/access";
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

export function useMyProfile(): QueryState<Profile | null> {
  const { data: user, loading: authLoading } = useAuthUser();
  const [state, setState] = useState<QueryState<Profile | null>>(() => {
    const cached = user?.id ? peekCachedProfile(user.id) : null;
    return {
      data: cached,
      loading: !cached && (authLoading || Boolean(user)),
      error: null,
    };
  });

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      clearProfileCache();
      setState({ data: null, loading: false, error: null });
      return;
    }

    const cached =
      peekCachedProfile(user.id) ?? hydrateProfileCache(user.id);
    if (cached) {
      setState({ data: cached, loading: false, error: null });
    } else {
      setState((prev) => ({ ...prev, loading: true, error: null }));
    }

    let cancelled = false;
    const userId = user.id;

    function apply(profile: Profile | null) {
      if (cancelled) return;
      if (profile) {
        setState({ data: profile, loading: false, error: null });
        return;
      }
      setState((prev) => ({
        data: prev.data,
        loading: false,
        error: null,
      }));
    }

    getMyProfile()
      .then(apply)
      .catch((error: unknown) => {
        if (cancelled) return;
        setState((prev) => ({
          data: prev.data,
          loading: false,
          error: toError(error),
        }));
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
  }, [authLoading, user?.id]);

  return state;
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

    setState({ data: [], loading: true, error: null });
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
