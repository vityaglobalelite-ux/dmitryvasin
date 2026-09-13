import type { Metadata } from "next";
import { SupportChatView } from "@/components/site/support/SupportChatView";
import { catalogT } from "@/lib/catalog/i18n";
import { accountPageMetadata } from "@/lib/catalog/seo";

export const metadata: Metadata = accountPageMetadata({
  locale: "ru",
  title: catalogT("ru").pages.accountSupport,
});

export default function AccountSupportPage() {
  return <SupportChatView />;
}
