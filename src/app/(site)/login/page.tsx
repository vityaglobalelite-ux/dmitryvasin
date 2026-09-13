import type { Metadata } from "next";
import { LoginView } from "@/components/site/auth/LoginView";
import { authT } from "@/components/site/auth/copy";
import { publicPageMetadata } from "@/lib/catalog/seo";

export const metadata: Metadata = publicPageMetadata({
  locale: "ru",
  path: "/login/",
  title: authT("ru").meta.login,
});

export default function LoginPage() {
  return <LoginView />;
}
