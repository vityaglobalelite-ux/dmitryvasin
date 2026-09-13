"use client";

import { Skeleton } from "@/components/site/ui/Skeleton";
import { Button } from "@/components/site/ui/Button";
import { useCatalogT, useLocalizedRoutes } from "@/lib/catalog/locale-context";
import { productAssets } from "@/components/site/product/assets";

export function ProductHeroWash() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 h-[520px] overflow-hidden max-[600px]:h-[240px]"
    >
      <img
        src={productAssets.heroWash}
        alt=""
        width={1920}
        height={1120}
        className="absolute left-1/2 top-[-80px] h-[560px] w-[1920px] max-w-none -translate-x-1/2 object-cover max-[600px]:top-[-40px] max-[600px]:h-[280px]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white from-[12%] via-white/80 to-white" />
    </div>
  );
}

/** Cover + text-column geometry matching Figma 607:399 / 678:1913. */
export function ProductSkeleton() {
  return (
    <main className="relative flex flex-1 flex-col overflow-x-clip bg-white">
      <ProductHeroWash />
      <div className="relative mx-auto w-full max-w-[1440px] px-[12.5%] pb-24 pt-16 max-[600px]:px-5 max-[600px]:pb-16 max-[600px]:pt-6">
        <div className="grid items-start gap-x-[8%] gap-y-10 min-[601px]:grid-cols-[minmax(0,588px)_minmax(0,710px)] min-[601px]:justify-between">
          <div className="flex flex-col gap-5">
            <Skeleton className="h-4 w-48 rounded-[8px] max-[600px]:h-3 max-[600px]:w-40" />
            <div className="flex flex-wrap gap-2.5">
              <Skeleton className="h-[45px] w-[120px] rounded-[30px] max-[600px]:h-6 max-[600px]:w-[84px]" />
              <Skeleton className="h-[45px] w-[140px] rounded-[30px] max-[600px]:h-6 max-[600px]:w-[96px]" />
              <Skeleton className="h-[45px] w-[168px] rounded-[30px] max-[600px]:h-6 max-[600px]:w-[110px]" />
            </div>
            <Skeleton className="h-[120px] w-full rounded-[16px] max-[600px]:h-[72px]" />
            <Skeleton className="h-[72px] w-[90%] rounded-[12px] max-[600px]:h-14" />
          </div>
          <Skeleton className="h-[564px] w-full rounded-[20px] max-[600px]:h-[180px] max-[600px]:rounded-[10px] min-[601px]:row-span-2" />
          <div className="flex flex-col gap-8">
            <div className="flex flex-wrap gap-3.5">
              <Skeleton className="h-10 w-[144px] rounded-[10px] max-[600px]:h-7 max-[600px]:w-[104px]" />
              <Skeleton className="h-10 w-[120px] rounded-[10px] max-[600px]:h-7 max-[600px]:w-[88px]" />
            </div>
            <div className="flex items-center gap-10 max-[600px]:flex-col max-[600px]:items-start max-[600px]:gap-5">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-[21px] w-[90px]" />
                <Skeleton className="h-9 w-[140px]" />
              </div>
              <Skeleton className="h-[60px] w-[200px] rounded-[60px] max-[600px]:h-[50px] max-[600px]:w-[160px]" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export function ProductNotFound() {
  const t = useCatalogT();
  const routes = useLocalizedRoutes();
  return (
    <main className="relative flex flex-1 flex-col overflow-x-clip bg-white">
      <ProductHeroWash />
      <div className="relative mx-auto flex w-full max-w-[1440px] flex-1 flex-col items-start justify-center px-[12.5%] py-24 max-[600px]:px-5 max-[600px]:py-16">
        <div className="max-w-[720px] rounded-[30px] bg-light-gray px-16 py-14 max-[600px]:px-5 max-[600px]:py-10">
          <p className="text-[14px] font-semibold uppercase tracking-[0.04em] text-plum/70">
            404
          </p>
          <h1 className="mt-4 text-[50px] font-medium leading-[1.1] tracking-[-1.5px] text-text max-[600px]:text-[24px] max-[600px]:tracking-[-0.72px]">
            {t.product.notFoundTitle}
          </h1>
          <p className="mt-5 max-w-[520px] text-[16px] leading-[1.5] text-text/70 max-[600px]:text-[13px]">
            {t.product.notFoundBody}
          </p>
          <Button href={routes.catalog} className="mt-10">
            {t.product.toCatalog}
          </Button>
        </div>
      </div>
    </main>
  );
}
