import type { Metadata } from "next";
import { AccountWatchView } from "@/components/site/account/AccountWatchView";
import { catalogT } from "@/lib/catalog/i18n";
import { accountPageMetadata } from "@/lib/catalog/seo";
import { catalogIdStaticParams } from "@/lib/catalog/static-params";

export const metadata: Metadata = accountPageMetadata({
  locale: "ru",
  title: catalogT("ru").pages.accountWatch,
});

export function generateStaticParams() {
  return catalogIdStaticParams();
}

export const dynamicParams = false;

export default function AccountWatchPage() {
  return <AccountWatchView />;
}
