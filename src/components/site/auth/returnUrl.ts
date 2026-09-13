import { siteRoutes } from "@/lib/catalog/routes";
import {
  localeFromPathname,
  localizedSiteRoutes,
  stripLocalePrefix,
  withTrailingSlash,
} from "@/lib/catalog/locale";
import type { Locale } from "@/lib/catalog/types";

const AUTH_PATHS = new Set<string>([
  siteRoutes.login,
  siteRoutes.signup,
  siteRoutes.forgotPassword,
]);

function stripQuery(path: string): string {
  const cut = path.indexOf("?");
  return cut === -1 ? path : path.slice(0, cut);
}

/** Static export 404s paths without a trailing slash (`/cart` vs `/cart/`). */
function withTrailingSlashKeepQuery(path: string): string {
  const hashIndex = path.indexOf("#");
  const withoutHash = hashIndex === -1 ? path : path.slice(0, hashIndex);
  const hash = hashIndex === -1 ? "" : path.slice(hashIndex);
  const queryIndex = withoutHash.indexOf("?");
  const pathname = queryIndex === -1 ? withoutHash : withoutHash.slice(0, queryIndex);
  const query = queryIndex === -1 ? "" : withoutHash.slice(queryIndex);
  return `${withTrailingSlash(pathname)}${query}${hash}`;
}

/**
 * Only same-origin relative paths. Reject protocol-relative (`//`),
 * schemes, and auth loops so login cannot bounce onto itself.
 */
export function safeReturnUrl(
  raw: string | null | undefined,
  locale: Locale = "ru",
): string {
  const fallback = localizedSiteRoutes(locale).account;
  if (!raw) return fallback;
  const value = raw.trim();
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return fallback;
  }
  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return fallback;
  }
  if (
    decoded.startsWith("//") ||
    decoded.includes("://") ||
    decoded.includes("\\")
  ) {
    return fallback;
  }
  const pathOnly = stripLocalePrefix(stripQuery(decoded));
  if (AUTH_PATHS.has(pathOnly)) return fallback;
  return withTrailingSlashKeepQuery(decoded);
}

export function hrefWithReturnUrl(href: string, returnUrl: string): string {
  const locale = localeFromPathname(href);
  const account = localizedSiteRoutes(locale).account;
  if (!returnUrl || returnUrl === account || returnUrl === siteRoutes.account) {
    return href;
  }
  const next = withTrailingSlashKeepQuery(returnUrl);
  if (next === account || next === siteRoutes.account) {
    return href;
  }
  const join = href.includes("?") ? "&" : "?";
  return `${href}${join}returnUrl=${encodeURIComponent(next)}`;
}
