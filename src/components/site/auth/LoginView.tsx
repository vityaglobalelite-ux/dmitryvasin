"use client";

import { Suspense } from "react";
import { AuthDeepLink } from "@/components/site/auth/AuthModal";
import { AuthScreenSkeleton } from "@/components/site/auth/AuthPrimitives";

export function LoginView() {
  return (
    <Suspense fallback={<AuthScreenSkeleton fields={2} />}>
      <AuthDeepLink mode="login" />
    </Suspense>
  );
}
