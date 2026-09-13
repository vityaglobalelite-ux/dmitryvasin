import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutView } from "@/components/site/cart/CheckoutView";
import { catalogT } from "@/lib/catalog/i18n";
import { publicPageMetadata } from "@/lib/catalog/seo";

const copy = catalogT("ru");

export const metadata: Metadata = publicPageMetadata({
  locale: "ru",
  path: "/checkout/",
  title: copy.pages.checkout,
});

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutView />
    </Suspense>
  );
}
