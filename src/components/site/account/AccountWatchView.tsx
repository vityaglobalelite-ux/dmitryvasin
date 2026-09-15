"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { AccountPlayer } from "@/components/site/account/AccountPlayer";
import {
  AccountBackLink,
  AccountShell,
  AccountShellSkeleton,
  accountMediaBleedClass,
} from "@/components/site/account/AccountShell";
import { useAccessEntry } from "@/components/site/account/use-access-entry";
import { useAccountGate } from "@/components/site/account/use-account-gate";
import { isAccessActive } from "@/lib/catalog/access";
import { CATALOG_STATIC_PARAM_STUB } from "@/lib/catalog/static-params";
import { productCopy } from "@/lib/catalog/locale";
import { useLocale, useLocalizedRoutes } from "@/lib/catalog/locale-context";
import { ProductNotFound } from "@/components/site/product/ProductStates";

function paramId(value: string | string[] | undefined): string | null {
  if (typeof value !== "string") return null;
  if (!value || value === CATALOG_STATIC_PARAM_STUB) return null;
  return value;
}

export function AccountWatchView() {
  const params = useParams();
  const id = paramId(params.id);
  const router = useRouter();
  const gate = useAccountGate();
  const entry = useAccessEntry(id, Boolean(gate.user) && !gate.pending);
  const locale = useLocale();
  const routes = useLocalizedRoutes();

  useEffect(() => {
    if (gate.pending || entry.loading || !id) return;
    const access = entry.data;
    if (!access || !access.product) {
      router.replace(routes.product(id));
      return;
    }
    if (!isAccessActive(access)) {
      router.replace(routes.accountExpired);
      return;
    }
    if (access.product.type === "course") {
      router.replace(routes.accountCourse(id));
    }
  }, [entry.data, entry.loading, gate.pending, id, router, routes]);

  if (!id) return <ProductNotFound />;
  if (gate.pending || entry.loading) {
    return <AccountShellSkeleton variant="player" />;
  }

  const access = entry.data;
  if (
    !access ||
    !isAccessActive(access) ||
    access.product?.type === "course" ||
    !access.product
  ) {
    return <AccountShellSkeleton variant="player" />;
  }

  const product = access.product;
  const copy = productCopy(product, locale);

  return (
    <AccountShell email={gate.user?.email} active="materials">
      <div className="flex w-full min-w-0 flex-col gap-[39px] max-[600px]:gap-5">
        <div
          className={`relative w-full min-w-0 overflow-hidden rounded-[30px] bg-black ${accountMediaBleedClass}`}
        >
          {product.coverUrl ? (
            <Image
              src={product.coverUrl}
              alt={copy.title || product.id}
              width={1280}
              height={720}
              className="pointer-events-none absolute inset-0 h-full w-full object-cover"
              unoptimized
            />
          ) : null}
          <div className="relative w-full min-w-0">
            <AccountPlayer productId={product.id} locale={locale} />
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <AccountBackLink />
          <h1 className="max-w-[843px] text-[30px] font-medium leading-[1.1] tracking-[-0.9px] text-text max-[600px]:text-[16px] max-[600px]:leading-[1.3] max-[600px]:tracking-normal">
            {copy.title}
          </h1>
          {copy.short || copy.description ? (
            <p className="max-w-[843px] text-[16px] leading-[1.5] text-text max-[600px]:text-[13px]">
              {copy.short || copy.description}
            </p>
          ) : null}
        </div>
      </div>
    </AccountShell>
  );
}
