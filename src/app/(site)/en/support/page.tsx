import type { Metadata } from "next";
import { SupportChatView } from "@/components/site/support/SupportChatView";
import { catalogT } from "@/lib/catalog/i18n";
import { publicPageMetadata } from "@/lib/catalog/seo";

const copy = catalogT("en");

export const metadata: Metadata = publicPageMetadata({
  locale: "en",
  path: "/support/",
  title: copy.pages.accountSupport,
  description:
    "Write to BeTango support without signing up. The reply will appear in this chat.",
});

export default function EnSupportPage() {
  return <SupportChatView />;
}
