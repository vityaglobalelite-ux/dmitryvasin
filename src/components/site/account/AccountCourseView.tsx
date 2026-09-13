"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  AccountBackLink,
  AccountShell,
  AccountShellSkeleton,
} from "@/components/site/account/AccountShell";
import { accountT } from "@/components/site/account/copy";
import { remainingAccess } from "@/components/site/account/remaining";
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

export function AccountCourseView() {
  const params = useParams();
  const id = paramId(params.id);
  const router = useRouter();
  const gate = useAccountGate();
  const entry = useAccessEntry(id, Boolean(gate.user) && !gate.pending);
  const locale = useLocale();
  const copyUi = accountT(locale);
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
    if (access.product.type !== "course") {
      router.replace(routes.accountWatch(id));
    }
  }, [entry.data, entry.loading, gate.pending, id, router, routes]);

  if (!id) return <ProductNotFound />;
  if (gate.pending || entry.loading) {
    return <AccountShellSkeleton variant="form" />;
  }

  const access = entry.data;
  if (!access || !isAccessActive(access) || access.product?.type !== "course") {
    return <AccountShellSkeleton variant="form" />;
  }

  const product = access.product;
  const copy = productCopy(product, locale);
  const remaining = remainingAccess(access, new Date(), locale);
  const program = copy.program?.trim() || copy.description.trim();

  return (
    <AccountShell email={gate.user?.email} active="materials">
      <div className="flex flex-col gap-5">
        <AccountBackLink />
        <h1 className="max-w-[799px] text-[50px] font-medium leading-[1.1] tracking-[-1.5px] text-text max-[600px]:text-[30px] max-[600px]:tracking-[-0.9px]">
          {copy.title}
        </h1>
        <div className="flex h-10 w-full flex-col justify-end gap-2.5">
          <div className="relative h-1.5 w-full overflow-hidden rounded-[10px] bg-[#d9d9d9]">
            <span
              className={`absolute inset-y-0 left-0 rounded-[10px] bg-[image:var(--brand-gradient)]`}
              style={{ width: `${Math.round(remaining.ratio * 100)}%` }}
            />
          </div>
          <p className="min-h-4 text-[12px] font-medium leading-normal text-[#1a1a1a] [font-variant-numeric:tabular-nums]">
            {remaining.label}
          </p>
        </div>
        <section className="rounded-[20px] bg-light-gray p-10 max-[600px]:rounded-[10px] max-[600px]:p-[15px]">
          <h2 className="text-[24px] font-medium leading-[1.2] text-text max-[600px]:text-[16px] max-[600px]:leading-[1.3]">
            {copyUi.programTitle}
          </h2>
          {program ? (
            <p className="mt-5 whitespace-pre-wrap text-[16px] leading-[1.5] text-text max-[600px]:text-[13px]">
              {program}
            </p>
          ) : (
            <p className="mt-5 text-[16px] leading-[1.5] text-text/70 max-[600px]:text-[13px]">
              {copyUi.programEmpty}
            </p>
          )}
        </section>
      </div>
    </AccountShell>
  );
}
