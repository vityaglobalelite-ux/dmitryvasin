import type { Metadata } from "next";
import { SupportChatView } from "@/components/site/support/SupportChatView";
import { catalogT } from "@/lib/catalog/i18n";
import { accountPageMetadata } from "@/lib/catalog/seo";

export const metadata: Metadata = accountPageMetadata({
  locale: "en",
  title: catalogT("en").pages.accountSupport,
});

export default function EnAccountSupportPage() {
  return <SupportChatView />;
}
