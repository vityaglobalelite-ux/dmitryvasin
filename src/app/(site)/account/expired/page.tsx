import type { Metadata } from "next";
import { AccountExpiredView } from "@/components/site/account/AccountExpiredView";
import { catalogT } from "@/lib/catalog/i18n";
import { accountPageMetadata } from "@/lib/catalog/seo";

export const metadata: Metadata = accountPageMetadata({
  locale: "ru",
  title: catalogT("ru").pages.accountExpired,
});

export default function AccountExpiredPage() {
  return <AccountExpiredView />;
}
