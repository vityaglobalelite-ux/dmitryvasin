"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AccountMaterialsEmpty } from "@/components/site/account/AccountMaterialsEmpty";
import { accountAssets } from "@/components/site/account/assets";
import { accountT } from "@/components/site/account/copy";
import {
  remainingAccess,
  remainingToneClass,
} from "@/components/site/account/remaining";
import {
  AccountMaterialCardSkeleton,
  AccountShell,
  AccountShellSkeleton,
} from "@/components/site/account/AccountShell";
import { useAccountGate } from "@/components/site/account/use-account-gate";
import {
  formatAccessLabel,
  formatDurationClock,
  lessonNoun,
  parseDifficulty,
  skillIconSrc,
} from "@/components/site/catalog/display";
import { catalogCardAssets } from "@/components/site/catalog/assets";
import { Button } from "@/components/site/ui/Button";
import { isAccessActive } from "@/lib/catalog/access";
import { useMyAccess } from "@/lib/catalog/hooks-account";
import { catalogT } from "@/lib/catalog/i18n";
import { productCopy } from "@/lib/catalog/locale";
import {
  useCatalogT,
  useLocale,
  useLocalizedRoutes,
} from "@/lib/catalog/locale-context";
import type { Access, Product, ProductType } from "@/lib/catalog/types";
import type { LocalizedSiteRoutes } from "@/lib/catalog/locale";

const SECTION_ORDER: ProductType[] = [
  "course",
  "lesson",
  "lifehack",
  "extra",
  "research",
  "peek",
];

function useNow(intervalMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}

function materialHref(
  access: Access,
  active: boolean,
  routes: LocalizedSiteRoutes,
): string {
  if (!active) return routes.accountExpired;
  if (access.product?.type === "course") {
    return routes.accountCourse(access.productId);
  }
  return routes.accountWatch(access.productId);
}

export function AccountMaterialsView() {
  const gate = useAccountGate();
  const access = useMyAccess();
  const now = useNow();
  const copy = accountT(useLocale());
  const locale = useLocale();

  const grouped = useMemo(() => {
    const rows = access.data.filter((row) => row.product);
    const byType = new Map<ProductType, Access[]>();
    for (const row of rows) {
      const type = row.product?.type;
      if (!type) continue;
      const list = byType.get(type) ?? [];
      list.push(row);
      byType.set(type, list);
    }
    return SECTION_ORDER.filter((type) => byType.has(type)).map((type) => ({
      type,
      items: byType.get(type) ?? [],
    }));
  }, [access.data]);

  if (gate.pending) {
    return <AccountShellSkeleton variant="cards" />;
  }

  if (access.loading) {
    return (
      <AccountShell email={gate.user?.email} active="materials">
        <header className="flex flex-col gap-5">
          <h1 className="text-[50px] font-medium leading-[1.1] tracking-[-1.5px] text-text max-[600px]:text-[28px] max-[600px]:tracking-[-0.84px]">
            {copy.materialsTitle}
          </h1>
          <div className="flex flex-col gap-5">
            {Array.from({ length: 3 }, (_, i) => (
              <AccountMaterialCardSkeleton key={i} />
            ))}
          </div>
        </header>
      </AccountShell>
    );
  }

  if (access.error) {
    return (
      <AccountShell email={gate.user?.email} active="materials">
        <h1 className="text-[50px] font-medium leading-[1.1] tracking-[-1.5px] text-text max-[600px]:text-[28px] max-[600px]:tracking-[-0.84px]">
          {copy.materialsTitle}
        </h1>
        <div className="mt-10 max-w-[640px] rounded-[30px] bg-light-gray p-10 max-[600px]:rounded-[10px] max-[600px]:p-[15px]">
          <p className="text-[24px] font-medium leading-[1.2] text-text max-[600px]:text-[16px] max-[600px]:leading-[1.3]">
            {copy.errorTitle}
          </p>
          <p className="mt-4 text-[16px] leading-[1.5] text-text/70 max-[600px]:text-[13px]">
            {copy.errorBody}
          </p>
          <Button
            type="button"
            className="mt-8"
            onClick={() => window.location.reload()}
          >
            {copy.retry}
          </Button>
        </div>
      </AccountShell>
    );
  }

  if (grouped.length === 0) {
    return (
      <AccountShell email={gate.user?.email} active="materials">
        <AccountMaterialsEmpty />
      </AccountShell>
    );
  }

  return (
    <AccountShell email={gate.user?.email} active="materials">
      <div className="flex flex-col gap-5">
        <h1 className="text-[50px] font-medium leading-[1.1] tracking-[-1.5px] text-text max-[600px]:text-[28px] max-[600px]:tracking-[-0.84px]">
          {copy.materialsTitle}
        </h1>
        {grouped.map((section) => (
          <section key={section.type} className="flex flex-col gap-5">
            <h2 className="text-[24px] font-medium leading-[1.1] tracking-[-0.72px] text-text max-[600px]:text-[16px] max-[600px]:leading-[1.3] max-[600px]:tracking-normal">
              {catalogT(locale).catalog.filters[section.type]}
            </h2>
            <div className="flex flex-col gap-5">
              {section.items.map((row) => (
                <MaterialCard key={row.productId} access={row} now={now} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </AccountShell>
  );
}

function MaterialCard({ access, now }: { access: Access; now: Date }) {
  const product = access.product;
  if (!product) return null;
  const locale = useLocale();
  const routes = useLocalizedRoutes();
  const ui = accountT(locale);

  const active = isAccessActive(access, now);
  const remaining = remainingAccess(access, now, locale);
  const href = materialHref(access, active, routes);
  const copy = productCopy(product, locale);
  const duration =
    product.type === "course" && product.lessonCount
      ? `${product.lessonCount} ${lessonNoun(product.lessonCount, locale)}`
      : formatDurationClock(product.durationSec, locale);
  const accessLabel = formatAccessLabel(product.accessDays, "overlay", locale);

  return (
    <article className="flex overflow-hidden rounded-[20px] bg-light-gray max-[600px]:flex-col">
      <Link
        href={href}
        className="relative block h-[275px] w-[467px] shrink-0 overflow-hidden rounded-[20px] bg-light-gray max-[1100px]:w-[min(100%,467px)] max-[600px]:h-[180px] max-[600px]:w-full max-[600px]:rounded-[10px]"
      >
        {product.coverUrl ? (
          <Image
            src={product.coverUrl}
            alt={copy.title}
            fill
            className={
              active
                ? "object-cover"
                : "object-cover opacity-60"
            }
            sizes="(max-width: 600px) 320px, 467px"
            unoptimized
          />
        ) : null}
        <div className="absolute inset-x-0 top-0 z-10 flex flex-wrap gap-2.5 p-2.5 max-[600px]:gap-1 max-[600px]:p-1.5">
          {duration ? <CoverChip>{duration}</CoverChip> : null}
          {accessLabel ? <CoverChip>{accessLabel}</CoverChip> : null}
        </div>
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-5 p-5 max-[600px]:p-[15px]">
        <MobileDifficulty product={product} />
        <SkillRow product={product} />
        <Link href={href}>
          <h3 className="text-[24px] font-medium leading-[1.2] text-black transition-opacity duration-150 hover:opacity-90 max-[600px]:text-[16px] max-[600px]:leading-[1.3] max-[600px]:text-text">
            {copy.title}
          </h3>
        </Link>
        <AccessMeter remaining={remaining} />
        <Button
          href={href}
          className="h-[45px] w-fit px-5 text-[16px] font-semibold max-[600px]:h-[50px] max-[600px]:w-full"
        >
          {active ? ui.open : ui.renew}
        </Button>
      </div>
    </article>
  );
}

function CoverChip({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center justify-center rounded-[20px] bg-light-gray px-2.5 py-2.5 text-[12px] font-medium leading-[1.2] text-black max-[600px]:border max-[600px]:border-white/50 max-[600px]:bg-black/20 max-[600px]:px-1.5 max-[600px]:py-1 max-[600px]:text-[10px] max-[600px]:text-white max-[600px]:backdrop-blur-[12px]">
      {children}
    </span>
  );
}

function MobileDifficulty({ product }: { product: Product }) {
  const t = useCatalogT();
  const level = parseDifficulty(product.level);
  return (
    <div className="hidden items-center gap-1.5 max-[600px]:flex">
      <span className="text-[10px] font-medium leading-normal text-[#1a1a1a]">
        {t.catalog.difficulty}
      </span>
      <img
        src={catalogCardAssets.difficulty[level]}
        alt=""
        width={56}
        height={14}
        className="h-[14px] w-[56px]"
      />
    </div>
  );
}

function SkillRow({ product }: { product: Product }) {
  if (product.skills.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-3.5 max-[600px]:gap-1">
      {product.skills.map((skill) => {
        const src = skillIconSrc(skill);
        return (
          <span
            key={skill}
            className="inline-flex items-center gap-2.5 rounded-[10px] bg-white p-2.5 max-[600px]:gap-1.5 max-[600px]:px-1.5 max-[600px]:py-1"
          >
            {src ? (
              <img
                src={src}
                alt=""
                width={20}
                height={20}
                className="size-5 max-[600px]:size-4"
              />
            ) : null}
            <span className="text-[14px] font-medium leading-normal text-[#1a1a1a] max-[600px]:text-[10px]">
              {skill}
            </span>
          </span>
        );
      })}
    </div>
  );
}

function AccessMeter({
  remaining,
}: {
  remaining: ReturnType<typeof remainingAccess>;
}) {
  const copy = accountT(useLocale());
  return (
    <div className="flex h-10 w-full flex-col justify-end gap-2.5">
      <div className="relative h-1.5 w-full overflow-hidden rounded-[10px] bg-[#d9d9d9]">
        <span
          className={`absolute inset-y-0 left-0 rounded-[10px] ${remainingToneClass(remaining.tone)}`}
          style={{ width: `${Math.round(remaining.ratio * 100)}%` }}
        />
      </div>
      <p className="flex min-h-4 items-center gap-1.5 text-[12px] font-medium leading-normal text-[#1a1a1a] max-[600px]:text-[10px] [font-variant-numeric:tabular-nums]">
        {remaining.expired ? (
          <>
            <img
              src={accountAssets.lock}
              alt=""
              width={16}
              height={16}
              className="size-4"
            />
            {copy.expired}
          </>
        ) : (
          remaining.label
        )}
      </p>
    </div>
  );
}
