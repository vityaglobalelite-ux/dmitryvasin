import type { Metadata } from "next";
import { SupportChatView } from "@/components/site/support/SupportChatView";
import { catalogT } from "@/lib/catalog/i18n";
import { publicPageMetadata } from "@/lib/catalog/seo";

const copy = catalogT("ru");

export const metadata: Metadata = publicPageMetadata({
  locale: "ru",
  path: "/support/",
  title: copy.pages.accountSupport,
  description:
    "Напишите в поддержку BeTango без регистрации. Ответ появится в этом чате.",
});

export default function SupportPage() {
  return <SupportChatView />;
}
