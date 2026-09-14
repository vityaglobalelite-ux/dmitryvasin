"use client";

import { Suspense } from "react";
import { AuthDeepLink } from "@/components/site/auth/AuthModal";
import { AuthScreenSkeleton } from "@/components/site/auth/AuthPrimitives";

export function ForgotPasswordView() {
  return (
    <Suspense fallback={<AuthScreenSkeleton fields={1} />}>
      <AuthDeepLink mode="forgot" />
    </Suspense>
  );
}
