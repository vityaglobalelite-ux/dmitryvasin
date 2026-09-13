import { siteRoutes } from "@/lib/catalog/routes";
import type { Locale, Product, ProductI18n } from "@/lib/catalog/types";

export const EN_PREFIX = "/en";

type PathParts = {
  pathname: string;
  query: string;
  hash: string;
};

function splitPath(input: string): PathParts {
  const hashIndex = input.indexOf("#");
  const withoutHash = hashIndex === -1 ? input : input.slice(0, hashIndex);
  const hash = hashIndex === -1 ? "" : input.slice(hashIndex);
  const queryIndex = withoutHash.indexOf("?");
  const pathname = queryIndex === -1 ? withoutHash : withoutHash.slice(0, queryIndex);
  const query = queryIndex === -1 ? "" : withoutHash.slice(queryIndex);
  return { pathname, query, hash };
}

export function withTrailingSlash(pathname: string): string {
  if (!pathname || pathname === "/") return "/";
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

export function localeFromPathname(pathname: string): Locale {
  const trimmed = pathname.replace(/\/+$/, "") || "/";
  if (trimmed === EN_PREFIX || trimmed.startsWith(`${EN_PREFIX}/`)) return "en";
  return "ru";
}

export function stripLocalePrefix(pathname: string): string {
  const { pathname: raw } = splitPath(pathname);
  const trimmed = raw.replace(/\/+$/, "") || "/";
  if (trimmed === EN_PREFIX) return "/";
  if (trimmed.startsWith(`${EN_PREFIX}/`)) {
    return withTrailingSlash(trimmed.slice(EN_PREFIX.length) || "/");
  }
  return withTrailingSlash(raw || "/");
}

export function withLocalePrefix(path: string, locale: Locale): string {
  const { pathname, query, hash } = splitPath(path);
  const stripped = stripLocalePrefix(pathname);
  const localized =
    locale === "en"
      ? stripped === "/"
        ? `${EN_PREFIX}/`
        : `${EN_PREFIX}${stripped}`
      : stripped;
  return `${localized}${query}${hash}`;
}

export function switchLocalePath(
  pathname: string,
  target: Locale,
  search = "",
): string {
  const next = withLocalePrefix(pathname, target);
  if (!search) return next;
  const params = new URLSearchParams(search.replace(/^\?/, ""));
  const rawReturn = params.get("returnUrl");
  if (rawReturn) {
    const trimmed = rawReturn.trim();
    if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
      params.set("returnUrl", withLocalePrefix(trimmed, target));
    }
  }
  const qs = params.toString();
  if (!qs) return next;
  const join = next.includes("?") ? "&" : "?";
  return `${next}${join}${qs}`;
}

export function localizedSiteRoutes(locale: Locale) {
  const loc = (path: string) => withLocalePrefix(path, locale);
  return {
    home: loc(siteRoutes.home),
    catalog: loc(siteRoutes.catalog),
    product: (id: string) => loc(siteRoutes.product(id)),
    cart: loc(siteRoutes.cart),
    checkout: loc(siteRoutes.checkout),
    login: loc(siteRoutes.login),
    signup: loc(siteRoutes.signup),
    forgotPassword: loc(siteRoutes.forgotPassword),
    account: loc(siteRoutes.account),
    accountCourse: (id: string) => loc(siteRoutes.accountCourse(id)),
    accountWatch: (id: string) => loc(siteRoutes.accountWatch(id)),
    accountProfile: loc(siteRoutes.accountProfile),
    accountOrders: loc(siteRoutes.accountOrders),
    accountSupport: loc(siteRoutes.accountSupport),
    accountExpired: loc(siteRoutes.accountExpired),
  };
}

export type LocalizedSiteRoutes = ReturnType<typeof localizedSiteRoutes>;

/** Catalog product strings for the active locale. Missing en rows stay empty. */
export function productCopy(product: Product, locale: Locale): ProductI18n {
  return product.i18n[locale];
}
