"use client";

import { Suspense } from "react";
import { AuthDeepLink } from "@/components/site/auth/AuthModal";

export function ForgotPasswordView() {
  return (
    <Suspense fallback={null}>
      <AuthDeepLink mode="forgot" />
    </Suspense>
  );
}
