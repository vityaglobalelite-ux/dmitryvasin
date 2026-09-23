"use client";

import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  getPublishedProduct,
  listPublishedProducts,
  PUBLIC_PRODUCT_TYPES,
} from "@/lib/catalog/repo/products";
import type {
  AuthUser,
  Locale,
  Product,
  ProductType,
  PublicProductType,
  QueryState,
} from "@/lib/catalog/types";
import {
  getSession,
  mapAuthUser,
  onAuthStateChange,
  peekCachedAuthUser,
  peekCachedSessionUser,
  rememberAuthUser,
} from "@/lib/supabase/auth";

function publicProductTypeFilter(
  type?: ProductType,
): PublicProductType | undefined {
  if (!type) return undefined;
  return (PUBLIC_PRODUCT_TYPES as readonly string[]).includes(type)
    ? (type as PublicProductType)
    : undefined;
}

/** A fetch result tagged with the request it answers. */
type Answer<T> = { key: string; data: T; error: Error | null };

const NO_PRODUCTS: Product[] = [];

export function useProducts(
  opts: { type?: ProductType; locale?: Locale } = {},
): QueryState<Product[]> {
  const type = publicProductTypeFilter(opts.type);
  const locale = opts.locale ?? "ru";
  const key = `${type ?? ""}:${locale}`;
  const [answer, setAnswer] = useState<Answer<Product[]> | null>(null);

  useEffect(() => {
    let cancelled = false;
    const requestKey = `${type ?? ""}:${locale}`;
    listPublishedProducts({ type, locale })
      .then((data) => {
        if (!cancelled) setAnswer({ key: requestKey, data, error: null });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setAnswer({
          key: requestKey,
          data: NO_PRODUCTS,
          error: error instanceof Error ? error : new Error("products"),
        });
      });
    return () => {
      cancelled = true;
    };
  }, [type, locale]);

  // An answer for other filters is stale: show loading, never old rows.
  return useMemo(
    () =>
      answer?.key === key
        ? { data: answer.data, loading: false, error: answer.error }
        : { data: NO_PRODUCTS, loading: true, error: null },
    [answer, key],
  );
}

export function useProduct(
  id: string | null,
  locale: Locale = "ru",
): QueryState<Product | null> {
  const key = id ? `${id}:${locale}` : null;
  const [answer, setAnswer] = useState<Answer<Product | null> | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const requestKey = `${id}:${locale}`;
    getPublishedProduct(id, locale)
      .then((data) => {
        if (!cancelled) setAnswer({ key: requestKey, data, error: null });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setAnswer({
          key: requestKey,
          data: null,
          error: error instanceof Error ? error : new Error("product"),
        });
      });
    return () => {
      cancelled = true;
    };
  }, [id, locale]);

  return useMemo(() => {
    if (!key) return { data: null, loading: false, error: null };
    if (answer?.key === key) {
      return { data: answer.data, loading: false, error: answer.error };
    }
    return { data: null, loading: true, error: null };
  }, [answer, key]);
}

export function useAuthUser(): QueryState<AuthUser | null> {
  const cached = peekCachedAuthUser();
  const [state, setState] = useState<QueryState<AuthUser | null>>(() => ({
    data: cached === undefined ? null : cached,
    loading: cached === undefined,
    error: null,
  }));

  useEffect(() => {
    let cancelled = false;

    function applySession(session: Session | null) {
      rememberAuthUser(session?.user ? mapAuthUser(session.user) : null);
      if (!cancelled) {
        setState({
          data: peekCachedAuthUser() ?? null,
          loading: false,
          error: null,
        });
      }
    }

    getSession()
      .then((session) => {
        applySession(session);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setState({
          data: peekCachedAuthUser() ?? null,
          loading: false,
          error: error instanceof Error ? error : new Error("auth"),
        });
      });

    const { unsubscribe } = onAuthStateChange((_event, session) => {
      applySession(session);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return state;
}

/** Any durable session, including anonymous support visitors. */
export function useSessionUser(): QueryState<AuthUser | null> {
  const cached = peekCachedSessionUser();
  const [state, setState] = useState<QueryState<AuthUser | null>>(() => ({
    data: cached === undefined ? null : cached,
    loading: cached === undefined,
    error: null,
  }));

  useEffect(() => {
    let cancelled = false;

    function apply(user: AuthUser | null) {
      rememberAuthUser(user);
      if (!cancelled) {
        setState({ data: user, loading: false, error: null });
      }
    }

    getSession()
      .then((session) => {
        apply(session?.user ? mapAuthUser(session.user) : null);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setState({
          data: peekCachedSessionUser() ?? null,
          loading: false,
          error: error instanceof Error ? error : new Error("auth"),
        });
      });

    const { unsubscribe } = onAuthStateChange((_event, session) => {
      apply(session?.user ? mapAuthUser(session.user) : null);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return state;
}
