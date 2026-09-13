import type { Metadata } from "next";
import { AccountOrdersView } from "@/components/site/account/AccountOrdersView";
import { catalogT } from "@/lib/catalog/i18n";
import { accountPageMetadata } from "@/lib/catalog/seo";

export const metadata: Metadata = accountPageMetadata({
  locale: "ru",
  title: catalogT("ru").pages.accountOrders,
});

export default function AccountOrdersPage() {
  return <AccountOrdersView />;
}
