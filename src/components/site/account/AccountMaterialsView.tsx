"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { accountAssets } from "@/components/site/account/assets";
import { AccountDiscover } from "@/components/site/account/AccountDiscover";
import { AccountMaterialsEmpty } from "@/components/site/account/AccountMaterialsEmpty";
import { accountT } from "@/components/site/account/copy";
import { AccessMeter } from "@/components/site/account/AccessMeter";
import { remainingAccess } from "@/components/site/account/remaining";
import {
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
import { isAccessActive, isPeekWatchable } from "@/lib/catalog/access";
import { POSTURE_BUNDLE } from "@/lib/catalog/ids";
import { useMyAccess, useMyWatchProgress } from "@/lib/catalog/hooks-account";
import { catalogT } from "@/lib/catalog/i18n";
import { productCopy } from "@/lib/catalog/locale";
import {
  useCatalogT,
  useLocale,
  useLocalizedRoutes,
} from "@/lib/catalog/locale-context";
import { getPublishedProduct } from "@/lib/catalog/repo/products";
import type {
  Access,
  Locale,
  Product,
  ProductType,
  WatchProgress,
} from "@/lib/catalog/types";
import type { LocalizedSiteRoutes } from "@/lib/catalog/locale";
import {
  formatWatchClock,
  remainingWatchSec,
  watchPercent,
} from "@/lib/catalog/watch-progress";

const LIBRARY_SECTION_ORDER: ProductType[] = [
  "course",
  "lesson",
  "lifehack",
  "peek",
];

const LIBRARY_TYPES = new Set<ProductType>(LIBRARY_SECTION_ORDER);

function useNow(intervalMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}

function formatUnlockDate(iso: string, locale: Locale): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function mergePostureAccess(block1: Access, block2: Access, product: Product): Access {
  const expiresAt =
    new Date(block1.expiresAt).getTime() < new Date(block2.expiresAt).getTime()
      ? block1.expiresAt
      : block2.expiresAt;
  return {
    ...block1,
    productId: POSTURE_BUNDLE.fullId,
    expiresAt,
    status:
      block1.status === "active" && block2.status === "active"
        ? "active"
        : block1.status,
    product,
  };
}

/** One posture course card when full or both blocks; hide redundant block rows. */
function prepareLibraryAccess(
  rows: Access[],
  fullCourseProduct: Product | null,
): Access[] {
  const withProduct = rows.filter((row) => row.product);
  const byId = new Map(withProduct.map((row) => [row.productId, row]));

  const full = byId.get(POSTURE_BUNDLE.fullId);
  const block1 = byId.get(POSTURE_BUNDLE.block1Id);
  const block2 = byId.get(POSTURE_BUNDLE.block2Id);
  const unified = Boolean(full) || (Boolean(block1) && Boolean(block2));
  const canSynthesize =
    unified && !full && Boolean(block1) && Boolean(block2) && Boolean(fullCourseProduct);

  const hidden = new Set<string>();
  if (unified && (full || canSynthesize)) {
    hidden.add(POSTURE_BUNDLE.block1Id);
    hidden.add(POSTURE_BUNDLE.block2Id);
  }

  const result: Access[] = [];
  for (const row of withProduct) {
    if (!row.product?.type || !LIBRARY_TYPES.has(row.product.type)) continue;
    if (hidden.has(row.productId)) continue;
    result.push(row);
  }

  if (canSynthesize && block1 && block2 && fullCourseProduct) {
    result.push(mergePostureAccess(block1, block2, fullCourseProduct));
  }

  return result;
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
  const progress = useMyWatchProgress();
  const now = useNow();
  const copy = accountT(useLocale());
  const locale = useLocale();
  const [fullCourseProduct, setFullCourseProduct] = useState<Product | null>(
    null,
  );

  const needsPostureFullProduct = useMemo(() => {
    const ids = new Set(access.data.map((row) => row.productId));
    return (
      !ids.has(POSTURE_BUNDLE.fullId) &&
      ids.has(POSTURE_BUNDLE.block1Id) &&
      ids.has(POSTURE_BUNDLE.block2Id)
    );
  }, [access.data]);

  useEffect(() => {
    if (!needsPostureFullProduct) {
      setFullCourseProduct(null);
      return undefined;
    }
    let cancelled = false;
    void getPublishedProduct(POSTURE_BUNDLE.fullId, locale).then((product) => {
      if (!cancelled) setFullCourseProduct(product);
    });
    return () => {
      cancelled = true;
    };
  }, [needsPostureFullProduct, locale]);

  const progressByProduct = useMemo(() => {
    const map = new Map<string, WatchProgress>();
    for (const row of progress.data) map.set(row.productId, row);
    return map;
  }, [progress.data]);

  const libraryRows = useMemo(
    () => prepareLibraryAccess(access.data, fullCourseProduct),
    [access.data, fullCourseProduct],
  );

  const ownedIds = useMemo(() => {
    const ids = new Set<string>();
    for (const row of access.data) ids.add(row.productId);
    for (const row of libraryRows) ids.add(row.productId);
    return ids;
  }, [access.data, libraryRows]);

  const grouped = useMemo(() => {
    const byType = new Map<ProductType, Access[]>();
    for (const row of libraryRows) {
      const type = row.product?.type;
      if (!type || !LIBRARY_TYPES.has(type)) continue;
      const list = byType.get(type) ?? [];
      list.push(row);
      byType.set(type, list);
    }
    return LIBRARY_SECTION_ORDER.filter((type) => byType.has(type)).map(
      (type) => ({
        type,
        items: byType.get(type) ?? [],
      }),
    );
  }, [libraryRows]);

  if (gate.pending || (access.loading && access.data.length === 0 && !access.error)) {
    return <AccountShellSkeleton variant="cards" />;
  }

  if (access.error && access.data.length === 0) {
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
        <div className="flex flex-col gap-12">
          <AccountMaterialsEmpty />
          <AccountDiscover ownedIds={ownedIds} />
        </div>
      </AccountShell>
    );
  }

  return (
    <AccountShell email={gate.user?.email} active="materials">
      <div className="flex flex-col gap-12">
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
                <MaterialCard
                  key={row.productId}
                  access={row}
                  now={now}
                  progress={progressByProduct.get(row.productId) ?? null}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
      <AccountDiscover ownedIds={ownedIds} />
      </div>
    </AccountShell>
  );
}

function MaterialCard({
  access,
  now,
  progress,
}: {
  access: Access;
  now: Date;
  progress: WatchProgress | null;
}) {
  const product = access.product;
  if (!product) return null;
  const locale = useLocale();
  const routes = useLocalizedRoutes();
  const ui = accountT(locale);

  const active = isAccessActive(access, now);
  const peekLocked =
    active && product.type === "peek" && !isPeekWatchable(product, now);
  const unlockLabel =
    peekLocked && product.availableAt
      ? formatUnlockDate(product.availableAt, locale)
      : "";
  const remaining = remainingAccess(access, now, locale);
  const href = materialHref(access, active, routes);
  const copy = productCopy(product, locale);
  const duration =
    product.type === "course" && product.lessonCount
      ? `${product.lessonCount} ${lessonNoun(product.lessonCount, locale)}`
      : formatDurationClock(product.durationSec, locale);
  const accessLabel = formatAccessLabel(product.accessDays, "overlay", locale);
  const cta = !active
    ? ui.renew
    : peekLocked && unlockLabel
      ? ui.peekLockedCta.replace("{date}", unlockLabel)
      : product.type === "course"
        ? ui.open
        : progress?.completed
          ? ui.watchAgain
          : watchPercent(progress, product.durationSec) > 0
            ? ui.continueWatching
            : ui.open;

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
              active && !peekLocked
                ? "object-cover"
                : "object-cover opacity-60"
            }
            sizes="(max-width: 600px) 320px, 467px"
            unoptimized
          />
        ) : null}
        {peekLocked ? (
          <div className="pointer-events-none absolute inset-0 z-[11] flex items-center justify-center bg-black/25">
            <span className="inline-flex size-14 items-center justify-center rounded-full bg-black/50 backdrop-blur-md max-[600px]:size-12">
              <img
                src={accountAssets.lock}
                alt=""
                width={28}
                height={28}
                className="size-7 max-[600px]:size-6"
              />
            </span>
          </div>
        ) : null}
        <div className="absolute inset-x-0 top-0 z-10 flex flex-wrap gap-2.5 p-2.5 max-[600px]:gap-1 max-[600px]:p-1.5">
          {duration ? <CoverChip>{duration}</CoverChip> : null}
          {peekLocked && unlockLabel ? (
            <CoverChip>
              {ui.peekAvailableFrom.replace("{date}", unlockLabel)}
            </CoverChip>
          ) : accessLabel ? (
            <CoverChip>{accessLabel}</CoverChip>
          ) : null}
        </div>
        {!peekLocked ? (
          <CoverWatchMeter
            progress={progress}
            fallbackDurationSec={product.durationSec}
            watchedLabel={ui.watched}
            leftLabel={ui.watchLeft}
          />
        ) : null}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-5 p-5 max-[600px]:p-[15px]">
        <MobileDifficulty product={product} />
        <SkillRow product={product} />
        <Link href={href}>
          <h3 className="text-[24px] font-medium leading-[1.2] text-black transition-opacity duration-150 hover:opacity-90 max-[600px]:text-[16px] max-[600px]:leading-[1.3] max-[600px]:text-text">
            {copy.title}
          </h3>
        </Link>
        <AccessMeter remaining={remaining} showExpiredIcon />
        <Button
          href={href}
          className="h-[45px] w-fit px-5 text-[16px] font-semibold max-[600px]:h-[50px] max-[600px]:w-full"
        >
          {cta}
        </Button>
      </div>
    </article>
  );
}

function CoverWatchMeter({
  progress,
  fallbackDurationSec,
  watchedLabel,
  leftLabel,
}: {
  progress: WatchProgress | null;
  fallbackDurationSec: number;
  watchedLabel: string;
  leftLabel: string;
}) {
  const percent = watchPercent(progress, fallbackDurationSec);
  if (!progress || percent <= 0) return null;
  const left = remainingWatchSec(progress, fallbackDurationSec);
  const caption = progress.completed
    ? watchedLabel
    : left > 0
      ? `${percent}% · ${leftLabel.replace("{time}", formatWatchClock(left))}`
      : `${percent}%`;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10">
      <div className="absolute inset-x-0 bottom-0 h-[88px] bg-gradient-to-t from-black/80 via-black/35 to-transparent max-[600px]:h-[72px]" />
      <div className="relative flex flex-col gap-2 px-2.5 pb-2.5 max-[600px]:gap-1.5 max-[600px]:px-2 max-[600px]:pb-2">
        <span className="w-fit rounded-[20px] bg-black/70 px-2.5 py-1.5 text-[12px] font-medium leading-none text-white backdrop-blur-[12px] [font-variant-numeric:tabular-nums] max-[600px]:px-2 max-[600px]:py-1 max-[600px]:text-[11px]">
          {caption}
        </span>
        <div
          className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/40"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-label={caption}
        >
          <span
            className="absolute inset-y-0 left-0 rounded-full bg-[image:var(--brand-gradient)] transition-[width] duration-500 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
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
