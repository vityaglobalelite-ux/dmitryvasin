"use client";

import { useEffect, useState } from "react";
import { POSTURE_BUNDLE } from "@/lib/catalog/ids";
import { getPublishedProduct } from "@/lib/catalog/repo/products";
import type { Locale, Product } from "@/lib/catalog/types";

/**
 * The full posture course, for owners of both blocks without a full-course
 * row. `pending` holds until the answer for this locale is in — callers must
 * not treat "no product yet" as "no access".
 */
export function usePostureFullProduct(
  needed: boolean,
  locale: Locale,
): { product: Product | null; pending: boolean } {
  const [answer, setAnswer] = useState<{
    locale: Locale;
    product: Product | null;
  } | null>(null);

  useEffect(() => {
    if (!needed) return;
    let cancelled = false;
    getPublishedProduct(POSTURE_BUNDLE.fullId, locale)
      // Unreachable product reads as missing, never as a stuck load.
      .catch(() => null)
      .then((product) => {
        if (!cancelled) setAnswer({ locale, product });
      });
    return () => {
      cancelled = true;
    };
  }, [needed, locale]);

  if (!needed) return { product: null, pending: false };
  if (answer?.locale !== locale) return { product: null, pending: true };
  return { product: answer.product, pending: false };
}
