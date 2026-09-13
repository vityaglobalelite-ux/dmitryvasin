import type { Metadata } from "next";
import { ForgotPasswordView } from "@/components/site/auth/ForgotPasswordView";
import { authT } from "@/components/site/auth/copy";
import { publicPageMetadata } from "@/lib/catalog/seo";

export const metadata: Metadata = publicPageMetadata({
  locale: "en",
  path: "/forgot-password/",
  title: authT("en").meta.forgotPassword,
});

export default function EnForgotPasswordPage() {
  return <ForgotPasswordView />;
}
