"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useAuthModal } from "@/components/site/auth/AuthModal";
import { useAuthUser } from "@/lib/catalog/hooks";
import { localeFromPathname, localizedSiteRoutes } from "@/lib/catalog/locale";
import type { AuthUser } from "@/lib/catalog/types";
import { isAuthPromptSuppressed } from "@/lib/supabase/auth";

export function useAccountGate(): {
  user: AuthUser | null;
  pending: boolean;
} {
  const { data: user, loading } = useAuthUser();
  const { openAuth } = useAuthModal();
  const router = useRouter();
  const pathname = usePathname();
  const requested = useRef(false);

  useEffect(() => {
    if (loading) return;
    if (user) {
      requested.current = false;
      return;
    }
    const locale = localeFromPathname(pathname);
    const routes = localizedSiteRoutes(locale);
    if (isAuthPromptSuppressed()) {
      requested.current = true;
      router.replace(routes.home);
      return;
    }
    if (requested.current) return;
    requested.current = true;
    openAuth("login", {
      requireSession: true,
      onDismiss: () => {
        router.replace(routes.home);
      },
    });
  }, [loading, openAuth, pathname, router, user]);

  return { user, pending: loading || !user };
}
