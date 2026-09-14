"use client";

import { Suspense } from "react";
import { AuthDeepLink } from "@/components/site/auth/AuthModal";
import { AuthScreenSkeleton } from "@/components/site/auth/AuthPrimitives";

export function SignupView() {
  return (
    <Suspense fallback={<AuthScreenSkeleton fields={3} />}>
      <AuthDeepLink mode="signup" />
    </Suspense>
  );
}
