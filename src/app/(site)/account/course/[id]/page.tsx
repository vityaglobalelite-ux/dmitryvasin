import type { Metadata } from "next";
import { AccountCourseView } from "@/components/site/account/AccountCourseView";
import { catalogT } from "@/lib/catalog/i18n";
import { accountPageMetadata } from "@/lib/catalog/seo";
import { catalogIdStaticParams } from "@/lib/catalog/static-params";

export const metadata: Metadata = accountPageMetadata({
  locale: "ru",
  title: catalogT("ru").pages.accountCourse,
});

export function generateStaticParams() {
  return catalogIdStaticParams();
}

export const dynamicParams = false;

export default function AccountCoursePage() {
  return <AccountCourseView />;
}
