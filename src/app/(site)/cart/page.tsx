import type { Metadata } from "next";
import { CartView } from "@/components/site/cart/CartView";
import { catalogT } from "@/lib/catalog/i18n";
import { publicPageMetadata } from "@/lib/catalog/seo";

const copy = catalogT("ru");

export const metadata: Metadata = publicPageMetadata({
  locale: "ru",
  path: "/cart/",
  title: copy.pages.cart,
});

export default function CartPage() {
  return <CartView />;
}
