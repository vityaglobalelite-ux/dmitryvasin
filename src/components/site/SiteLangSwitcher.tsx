"use client";

import Link from "next/link";
import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { siteAssets } from "@/lib/catalog/assets";
import { useCatalogT, useLocale } from "@/lib/catalog/locale-context";
import { switchLocalePath } from "@/lib/catalog/locale";
import type { Locale } from "@/lib/catalog/types";

function useTargetHref(target: Locale): string {
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  return switchLocalePath(pathname, target, searchParams.toString());
}

function pillClass(active: boolean, side: "left" | "right"): string {
  const round = side === "left" ? "rounded-l-[20px] pl-[15px] pr-3" : "rounded-r-[20px] py-1.5 pl-3 pr-[15px]";
  if (active) {
    return `flex h-[35px] items-center justify-center ${round} bg-[image:var(--brand-gradient)] text-[16px] font-semibold text-white`;
  }
  return `flex h-[35px] items-center justify-center ${round} bg-[#eaeaea] text-[16px] text-text transition-opacity hover:opacity-80`;
}

function LangDesktopInner() {
  const locale = useLocale();
  const t = useCatalogT();
  const ruHref = useTargetHref("ru");
  const enHref = useTargetHref("en");

  return (
    <div className="flex items-center" role="group" aria-label={t.a11y.language}>
      {locale === "ru" ? (
        <span className={pillClass(true, "left")} aria-current="true">
          {t.nav.langRu}
        </span>
      ) : (
        <Link href={ruHref} className={pillClass(false, "left")} hrefLang="ru">
          {t.nav.langRu}
        </Link>
      )}
      {locale === "en" ? (
        <span className={pillClass(true, "right")} aria-current="true">
          {t.nav.langEn}
        </span>
      ) : (
        <Link href={enHref} className={pillClass(false, "right")} hrefLang="en">
          {t.nav.langEn}
        </Link>
      )}
    </div>
  );
}

function LangMobileInner() {
  const locale = useLocale();
  const t = useCatalogT();
  const other: Locale = locale === "en" ? "ru" : "en";
  const href = useTargetHref(other);

  return (
    <Link
      href={href}
      hrefLang={other}
      className="inline-flex h-8 items-center justify-center gap-0.5 rounded-[20px] border border-[#c9c9c9] bg-white px-2.5 text-[13px] leading-[1.5] text-[#252525] transition-opacity hover:opacity-80"
      aria-label={t.a11y.language}
    >
      {locale === "en" ? t.nav.langEn : t.nav.langRu}
      <img
        src={siteAssets.langChevron}
        alt=""
        width={6}
        height={4}
        className="h-[4px] w-[6px]"
      />
    </Link>
  );
}

const desktopFallback = (
  <div className="flex items-center" role="group" aria-label="Language">
    <span className={pillClass(true, "left")}>Ru</span>
    <span className={pillClass(false, "right")}>En</span>
  </div>
);

const mobileFallback = (
  <span className="inline-flex h-8 items-center justify-center gap-0.5 rounded-[20px] border border-[#c9c9c9] bg-white px-2.5 text-[13px] leading-[1.5] text-[#252525]">
    Ru
    <img
      src={siteAssets.langChevron}
      alt=""
      width={6}
      height={4}
      className="h-[4px] w-[6px]"
    />
  </span>
);

export function LangDesktop() {
  return (
    <Suspense fallback={desktopFallback}>
      <LangDesktopInner />
    </Suspense>
  );
}

export function LangMobile() {
  return (
    <Suspense fallback={mobileFallback}>
      <LangMobileInner />
    </Suspense>
  );
}
