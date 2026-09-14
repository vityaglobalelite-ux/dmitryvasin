"use client";

import { Suspense } from "react";
import { AuthDeepLink } from "@/components/site/auth/AuthModal";

export function LoginView() {
  return (
    <Suspense fallback={null}>
      <AuthDeepLink mode="login" />
    </Suspense>
  );
}
