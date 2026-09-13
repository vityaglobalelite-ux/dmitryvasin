import type { Metadata } from "next";
import { AccountProfileView } from "@/components/site/account/AccountProfileView";
import { catalogT } from "@/lib/catalog/i18n";
import { accountPageMetadata } from "@/lib/catalog/seo";

export const metadata: Metadata = accountPageMetadata({
  locale: "en",
  title: catalogT("en").pages.accountProfile,
});

export default function EnAccountProfilePage() {
  return <AccountProfileView />;
}
