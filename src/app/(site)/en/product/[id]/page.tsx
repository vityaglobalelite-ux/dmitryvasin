import type { Metadata } from "next";
import { ProductPageView } from "@/components/site/product/ProductPageView";
import { catalogT } from "@/lib/catalog/i18n";
import { publicPageMetadata } from "@/lib/catalog/seo";
import { catalogIdStaticParams } from "@/lib/catalog/static-params";

const copy = catalogT("en");

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return publicPageMetadata({
    locale: "en",
    path: `/product/${id}/`,
    title: copy.pages.product,
  });
}

export async function generateStaticParams() {
  return catalogIdStaticParams();
}

export const dynamicParams = false;

export default function EnProductPage() {
  return <ProductPageView />;
}
