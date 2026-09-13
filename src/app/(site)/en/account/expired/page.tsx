import type { Metadata } from "next";
import { AccountExpiredView } from "@/components/site/account/AccountExpiredView";
import { catalogT } from "@/lib/catalog/i18n";
import { accountPageMetadata } from "@/lib/catalog/seo";

export const metadata: Metadata = accountPageMetadata({
  locale: "en",
  title: catalogT("en").pages.accountExpired,
});

export default function EnAccountExpiredPage() {
  return <AccountExpiredView />;
}
