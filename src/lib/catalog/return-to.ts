"use client";

import { useEffect, useState } from "react";
import { stripLocalePrefix } from "@/lib/catalog/locale";

const STORAGE_KEY = "catalog:return-to";

function pathOnly(href: string): string {
  return href.split("?")[0] ?? href;
}

function isListHref(href: string): boolean {
  if (!href.startsWith("/") || href.startsWith("//")) return false;
  const stripped = stripLocalePrefix(pathOnly(href));
  return stripped === "/" || stripped === "/catalog/";
}

/** Remember the listing the person left to open a product (catalog filters or home). */
export function rememberReturnTo(): void {
  if (typeof window === "undefined") return;
  try {
    const href = `${window.location.pathname}${window.location.search}`;
    if (!isListHref(href)) return;
    sessionStorage.setItem(STORAGE_KEY, href);
  } catch {
    /* private mode / blocked storage */
  }
}

export function readReturnTo(fallback: string): string {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw || !isListHref(raw)) return fallback;
    return raw;
  } catch {
    return fallback;
  }
}

export function isHomeHref(href: string): boolean {
  return stripLocalePrefix(pathOnly(href)) === "/";
}

export function useCatalogReturnHref(fallback: string): string {
  const [href, setHref] = useState(fallback);
  useEffect(() => {
    setHref(readReturnTo(fallback));
  }, [fallback]);
  return href;
}
