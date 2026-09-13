/**
 * Catalog routes. `trailingSlash: true` — all paths end with `/`.
 * Canonical paths are Russian (`/`). English lives under `/en/` via
 * `localizedSiteRoutes` in `locale.ts`.
 */
export const siteRoutes = {
  home: "/",
  catalog: "/catalog/",
  product: (id: string) => `/product/${id}/` as const,
  cart: "/cart/",
  checkout: "/checkout/",
  login: "/login/",
  signup: "/signup/",
  forgotPassword: "/forgot-password/",
  account: "/account/",
  accountCourse: (id: string) => `/account/course/${id}/` as const,
  accountWatch: (id: string) => `/account/watch/${id}/` as const,
  accountProfile: "/account/profile/",
  accountOrders: "/account/orders/",
  accountSupport: "/account/support/",
  accountExpired: "/account/expired/",
} as const;

export type SiteRouteKey = keyof typeof siteRoutes;
