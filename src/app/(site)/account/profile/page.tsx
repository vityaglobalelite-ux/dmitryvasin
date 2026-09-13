import type { Metadata } from "next";
import { AccountProfileView } from "@/components/site/account/AccountProfileView";
import { catalogT } from "@/lib/catalog/i18n";
import { accountPageMetadata } from "@/lib/catalog/seo";

export const metadata: Metadata = accountPageMetadata({
  locale: "ru",
  title: catalogT("ru").pages.accountProfile,
});

export default function AccountProfilePage() {
  return <AccountProfileView />;
}
