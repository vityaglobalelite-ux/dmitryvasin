import type { Metadata } from "next";
import { CartView } from "@/components/site/cart/CartView";
import { catalogT } from "@/lib/catalog/i18n";
import { publicPageMetadata } from "@/lib/catalog/seo";

const copy = catalogT("en");

export const metadata: Metadata = publicPageMetadata({
  locale: "en",
  path: "/cart/",
  title: copy.pages.cart,
});

export default function EnCartPage() {
  return <CartView />;
}
