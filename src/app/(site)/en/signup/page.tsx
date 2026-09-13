import type { Metadata } from "next";
import { SignupView } from "@/components/site/auth/SignupView";
import { authT } from "@/components/site/auth/copy";
import { publicPageMetadata } from "@/lib/catalog/seo";

export const metadata: Metadata = publicPageMetadata({
  locale: "en",
  path: "/signup/",
  title: authT("en").meta.signup,
});

export default function EnSignupPage() {
  return <SignupView />;
}
