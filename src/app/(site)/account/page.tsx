import type { Metadata } from "next";
import { AccountMaterialsView } from "@/components/site/account/AccountMaterialsView";
import { catalogT } from "@/lib/catalog/i18n";
import { accountPageMetadata } from "@/lib/catalog/seo";

export const metadata: Metadata = accountPageMetadata({
  locale: "ru",
  title: catalogT("ru").pages.account,
});

export default function AccountPage() {
  return <AccountMaterialsView />;
}
