import type { Metadata } from "next";
import { ForgotPasswordView } from "@/components/site/auth/ForgotPasswordView";
import { authT } from "@/components/site/auth/copy";
import { publicPageMetadata } from "@/lib/catalog/seo";

export const metadata: Metadata = publicPageMetadata({
  locale: "ru",
  path: "/forgot-password/",
  title: authT("ru").meta.forgotPassword,
});

export default function ForgotPasswordPage() {
  return <ForgotPasswordView />;
}
