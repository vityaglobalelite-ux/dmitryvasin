import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutView } from "@/components/site/cart/CheckoutView";
import { catalogT } from "@/lib/catalog/i18n";
import { publicPageMetadata } from "@/lib/catalog/seo";

const copy = catalogT("en");

export const metadata: Metadata = publicPageMetadata({
  locale: "en",
  path: "/checkout/",
  title: copy.pages.checkout,
});

export default function EnCheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutView />
    </Suspense>
  );
}
