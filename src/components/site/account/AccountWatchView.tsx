"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { accountAssets } from "@/components/site/account/assets";
import {
  AccountBackLink,
  AccountShell,
  AccountShellSkeleton,
  accountMediaBleedClass,
} from "@/components/site/account/AccountShell";
import { accountT } from "@/components/site/account/copy";
import { useAccessEntry } from "@/components/site/account/use-access-entry";
import { useAccountGate } from "@/components/site/account/use-account-gate";
import { isAccessActive, isPeekWatchable } from "@/lib/catalog/access";
import { CATALOG_STATIC_PARAM_STUB } from "@/lib/catalog/static-params";
import { productCopy } from "@/lib/catalog/locale";
import type { Locale } from "@/lib/catalog/types";
import { useLocale, useLocalizedRoutes } from "@/lib/catalog/locale-context";
import { ProductNotFound } from "@/components/site/product/ProductStates";
import { AccountPlayer } from "@/components/site/account/AccountPlayer";

function paramId(value: string | string[] | undefined): string | null {
  if (typeof value !== "string") return null;
  if (!value || value === CATALOG_STATIC_PARAM_STUB) return null;
  return value;
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

function useNow(intervalMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}

export function AccountWatchView() {
  const params = useParams();
  const id = paramId(params.id);
  const router = useRouter();
  const gate = useAccountGate();
  const entry = useAccessEntry(id, Boolean(gate.user) && !gate.pending);
  const locale = useLocale();
  const routes = useLocalizedRoutes();
  const ui = accountT(locale);
  const now = useNow();

  useEffect(() => {
    if (gate.pending || entry.loading || !id) return;
    const access = entry.data;
    if (!access || !access.product) {
      router.replace(routes.product(id));
      return;
    }
    if (!isAccessActive(access, now)) {
      router.replace(routes.accountExpired);
      return;
    }
    if (access.product.type === "course") {
      router.replace(routes.accountCourse(id));
    }
  }, [entry.data, entry.loading, gate.pending, id, now, router, routes]);

  if (!id) return <ProductNotFound />;
  if (gate.pending || entry.loading) {
    return <AccountShellSkeleton variant="player" />;
  }

  const access = entry.data;
  if (
    !access ||
    !isAccessActive(access, now) ||
    access.product?.type === "course" ||
    !access.product
  ) {
    return <AccountShellSkeleton variant="player" />;
  }

  const product = access.product;
  const copy = productCopy(product, locale);
  const peekLocked =
    product.type === "peek" && !isPeekWatchable(product, now);
  const unlockLabel =
    product.availableAt
      ? formatUnlockDate(product.availableAt, locale)
      : "";

  return (
    <AccountShell email={gate.user?.email} active="materials">
      <div className="flex w-full min-w-0 flex-col gap-[39px] max-[600px]:gap-5">
        <div
          className={`relative w-full min-w-0 overflow-hidden rounded-[30px] bg-[var(--player-stage-bg,#0a0608)] ${accountMediaBleedClass}`}
        >
          {peekLocked ? (
            <PeekLockedStage
              posterUrl={product.coverUrl}
              title={copy.title}
              unlockLabel={unlockLabel}
              heading={ui.peekLockedTitle}
              body={ui.peekLockedBody.replace("{date}", unlockLabel)}
            />
          ) : (
            <AccountPlayer
              productId={product.id}
              locale={locale}
              posterUrl={product.coverUrl}
            />
          )}
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

function PeekLockedStage({
  posterUrl,
  title,
  unlockLabel,
  heading,
  body,
}: {
  posterUrl: string;
  title: string;
  unlockLabel: string;
  heading: string;
  body: string;
}) {
  return (
    <div className="relative aspect-video w-full min-h-[280px] max-[600px]:min-h-[200px]">
      {posterUrl ? (
        <Image
          src={posterUrl}
          alt=""
          fill
          className="object-cover opacity-35"
          sizes="(max-width: 600px) 100vw, 900px"
          unoptimized
          priority
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/40" />
      <div className="relative flex h-full flex-col items-center justify-center gap-5 px-8 py-12 text-center max-[600px]:gap-4 max-[600px]:px-5 max-[600px]:py-8">
        <span className="inline-flex size-16 items-center justify-center rounded-full bg-white/10 backdrop-blur-md max-[600px]:size-14">
          <img
            src={accountAssets.lock}
            alt=""
            width={32}
            height={32}
            className="size-8 max-[600px]:size-7"
          />
        </span>
        <div className="flex max-w-[520px] flex-col gap-3">
          <p className="text-[24px] font-medium leading-[1.2] text-white max-[600px]:text-[18px]">
            {heading}
          </p>
          {unlockLabel ? (
            <p className="text-[16px] leading-[1.5] text-white/85 max-[600px]:text-[13px]">
              {body}
            </p>
          ) : (
            <p className="text-[16px] leading-[1.5] text-white/85 max-[600px]:text-[13px]">
              {title}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
