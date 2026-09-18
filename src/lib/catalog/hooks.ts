"use client";

import { useEffect, useState } from "react";
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

export function useProducts(
  opts: { type?: ProductType; locale?: Locale } = {},
): QueryState<Product[]> {
  const [state, setState] = useState<QueryState<Product[]>>({
    data: [],
    loading: true,
    error: null,
  });
  const locale = opts.locale ?? "ru";

  useEffect(() => {
    let cancelled = false;
    setState({ data: [], loading: true, error: null });
    listPublishedProducts({
      type: publicProductTypeFilter(opts.type),
      locale,
    })
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            data: [],
            loading: false,
            error: error instanceof Error ? error : new Error("products"),
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [opts.type, locale]);

  return state;
}

export function useProduct(
  id: string | null,
  locale: Locale = "ru",
): QueryState<Product | null> {
  const [state, setState] = useState<QueryState<Product | null>>({
    data: null,
    loading: Boolean(id),
    error: null,
  });

  useEffect(() => {
    if (!id) {
      setState({ data: null, loading: false, error: null });
      return;
    }
    let cancelled = false;
    setState({ data: null, loading: true, error: null });
    getPublishedProduct(id, locale)
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            data: null,
            loading: false,
            error: error instanceof Error ? error : new Error("product"),
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id, locale]);

  return state;
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
