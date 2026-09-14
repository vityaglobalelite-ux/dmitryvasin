"use client";

import { CatalogProductGrid } from "@/components/site/catalog/ProductCard";
import { ProductCardSkeleton } from "@/components/site/ui/Skeleton";
import { useCatalogT } from "@/lib/catalog/locale-context";

export type PlaceholderPageKey = keyof ReturnType<typeof useCatalogT>["pages"];

export function RoutePlaceholder({
  page,
  variant = "quiet",
}: {
  page: PlaceholderPageKey;
  variant?: "quiet" | "catalog" | "bare";
}) {
  const copy = useCatalogT();
  const title = copy.pages[page];
  const body = variant === "catalog" ? copy.empty.catalog : copy.empty.quiet;
  const count = variant === "catalog" ? 3 : variant === "quiet" ? 1 : 0;

  return (
    <main className="mx-auto w-full flex-1 px-[12.5%] py-16 max-[600px]:px-5 max-[600px]:py-10">
      <h1 className="max-w-[833px] text-[50px] font-medium leading-[55px] tracking-[-1.5px] text-text max-[600px]:text-[24px] max-[600px]:leading-[1.1] max-[600px]:tracking-[-0.72px]">
        {title}
      </h1>
      <p className="mt-5 max-w-[640px] text-[16px] leading-[1.5] text-text/70 max-[600px]:text-[13px]">
        {body}
      </p>
      {count > 0 ? (
        variant === "catalog" ? (
          <CatalogProductGrid className="mt-10">
            {Array.from({ length: count }, (_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </CatalogProductGrid>
        ) : (
          <div className="mt-10 max-w-[467px]">
            {Array.from({ length: count }, (_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )
      ) : null}
    </main>
  );
}
