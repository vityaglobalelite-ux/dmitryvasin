"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { safeReturnUrl } from "@/components/site/auth/returnUrl";
import { useAuthUser } from "@/lib/catalog/hooks";
import { useLocale } from "@/lib/catalog/locale-context";

export function useAuthReturnUrl(): string {
  const searchParams = useSearchParams();
  const locale = useLocale();
  return safeReturnUrl(searchParams.get("returnUrl"), locale);
}

/** Redirects signed-in visitors away from auth screens. */
export function useSignedInRedirect(returnUrl: string): {
  blocked: boolean;
} {
  const { data: user, loading } = useAuthUser();
  const router = useRouter();

  useEffect(() => {
    if (loading || !user) return;
    router.replace(returnUrl);
  }, [loading, returnUrl, router, user]);

  return { blocked: loading || Boolean(user) };
}
