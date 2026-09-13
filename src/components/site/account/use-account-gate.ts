"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { hrefWithReturnUrl } from "@/components/site/auth/returnUrl";
import { useAuthUser } from "@/lib/catalog/hooks";
import { localeFromPathname, localizedSiteRoutes } from "@/lib/catalog/locale";
import type { AuthUser } from "@/lib/catalog/types";

function withTrailingSlash(pathname: string): string {
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

export function useAccountGate(): {
  user: AuthUser | null;
  pending: boolean;
} {
  const { data: user, loading } = useAuthUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading || user) return;
    const locale = localeFromPathname(pathname);
    const routes = localizedSiteRoutes(locale);
    router.replace(
      hrefWithReturnUrl(routes.login, withTrailingSlash(pathname)),
    );
  }, [loading, pathname, router, user]);

  return { user, pending: loading || !user };
}
