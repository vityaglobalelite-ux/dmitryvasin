"use client";

import { useEffect, useState } from "react";
import {
  getPublishedProduct,
  listPublishedProducts,
} from "@/lib/catalog/repo/products";
import type {
  AuthUser,
  Product,
  ProductType,
  QueryState,
} from "@/lib/catalog/types";
import { getSession, mapAuthUser, onAuthStateChange } from "@/lib/supabase/auth";

export function useProducts(opts: { type?: ProductType } = {}): QueryState<
  Product[]
> {
  const [state, setState] = useState<QueryState<Product[]>>({
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    setState({ data: [], loading: true, error: null });
    listPublishedProducts({ type: opts.type })
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
  }, [opts.type]);

  return state;
}

export function useProduct(id: string | null): QueryState<Product | null> {
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
    getPublishedProduct(id)
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
  }, [id]);

  return state;
}

export function useAuthUser(): QueryState<AuthUser | null> {
  const [state, setState] = useState<QueryState<AuthUser | null>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    getSession()
      .then((session) => {
        if (cancelled) return;
        setState({
          data: session?.user ? mapAuthUser(session.user) : null,
          loading: false,
          error: null,
        });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setState({
          data: null,
          loading: false,
          error: error instanceof Error ? error : new Error("auth"),
        });
      });

    const { unsubscribe } = onAuthStateChange((_event, session) => {
      if (cancelled) return;
      setState({
        data: session?.user ? mapAuthUser(session.user) : null,
        loading: false,
        error: null,
      });
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return state;
}
