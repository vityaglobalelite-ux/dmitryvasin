"use client";

import { Suspense } from "react";
import { AuthDeepLink } from "@/components/site/auth/AuthModal";

export function SignupView() {
  return (
    <Suspense fallback={null}>
      <AuthDeepLink mode="signup" />
    </Suspense>
  );
}
