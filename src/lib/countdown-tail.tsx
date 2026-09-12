"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useIsMobile } from "@/lib/landing-mode";
import { usePriceIncreaseTarget } from "@/lib/price-increase";

/**
 * Extra Figma-px inserted under the tariffs heading for join-status copy.
 * Cards, countdown, payment stack, and canvas height all move by this amount
 * so countdown↔payment gap and COUNTDOWN_COLLAPSE stay as in Figma.
 */
export const TARIFF_STATUS_EXTRA_Y = {
  desktop: 52,
  mobile: 108,
} as const;

/** Point-join addon row under the 3 main tariff cards. */
export const TARIFF_ADDON_LAYOUT = {
  desktop: {
    mainTop: 10458,
    mainCardH: 636,
    gapAfterMain: 40,
    headingH: 90,
    headingToCards: 28,
    cardH: 560,
    cardW: 710,
    cardGap: 20,
    cardX: [240, 970] as const,
  },
  mobile: {
    lastMainTop: 13431,
    mainCardH: 498,
    gapAfterMain: 24,
    headingH: 92,
    headingToCards: 16,
    cardH: 456,
    cardGap: 20,
  },
} as const;

function addonExtraY(
  layout: {
    gapAfterMain: number;
    headingH: number;
    headingToCards: number;
    cardH: number;
    cardGap?: number;
  },
  stacked: boolean,
) {
  const secondCard = stacked ? (layout.cardGap ?? 0) + layout.cardH : 0;
  return (
    layout.gapAfterMain +
    layout.headingH +
    layout.headingToCards +
    layout.cardH +
    secondCard
  );
}

export const TARIFF_ADDONS_EXTRA_Y = {
  desktop: addonExtraY(TARIFF_ADDON_LAYOUT.desktop, false),
  mobile: addonExtraY(TARIFF_ADDON_LAYOUT.mobile, true),
} as const;

/**
 * Figma space reserved for CountdownSection between tariffs and payment.
 * When countdown is inactive, shift Payment/Reviews/Footer up by this amount
 * and shrink FigCanvas height the same way ProgramTail does.
 *
 * Desktop: tariffs bottom 11094 → payment 11624; keep 120px gap → 410.
 * Mobile:  tariffs bottom 13929 → payment 14420; keep 120px in raw coords
 *          (with MobileYShift payment−tariffs = −80 this yields TARGET_GAP 40).
 */
export const COUNTDOWN_COLLAPSE = {
  desktop: 410,
  mobile: 371,
} as const;

type CountdownTailCtx = {
  /** Positive px removed from canvas / applied as -translateY when banner hidden */
  collapse: number;
  /** Positive px added for tariffs join-status copy (shifts cards) */
  extra: number;
  /** extra + addon row — shifts countdown, payment stack, canvas height */
  tailExtra: number;
  target: Date | null;
  /** Countdown still running (sales open) */
  active: boolean;
  /** Unused after cutover: sales stay open, closed phase is never set */
  closed: boolean;
  salesOpen: boolean;
  ready: boolean;
};

const Ctx = createContext<CountdownTailCtx | null>(null);

export function CountdownTailProvider({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();
  const { target, active, closed, salesOpen, ready } = usePriceIncreaseTarget();
  const showBanner = active;
  const extra = isMobile
    ? TARIFF_STATUS_EXTRA_Y.mobile
    : TARIFF_STATUS_EXTRA_Y.desktop;
  const addons = isMobile
    ? TARIFF_ADDONS_EXTRA_Y.mobile
    : TARIFF_ADDONS_EXTRA_Y.desktop;
  const tailExtra = extra + addons;
  const collapse = showBanner
    ? 0
    : isMobile
      ? COUNTDOWN_COLLAPSE.mobile
      : COUNTDOWN_COLLAPSE.desktop;
  const value = useMemo(
    () => ({
      collapse,
      extra,
      tailExtra,
      target,
      active,
      closed,
      salesOpen,
      ready,
    }),
    [collapse, extra, tailExtra, target, active, closed, salesOpen, ready],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCountdownTail() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useCountdownTail must be used within CountdownTailProvider");
  }
  return ctx;
}

/** Sections below countdown — pull up when price-increase banner is hidden */
export function CountdownTail({ children }: { children: ReactNode }) {
  const { collapse, tailExtra } = useCountdownTail();
  return (
    <div
      className="absolute left-0 top-0 w-full"
      style={{
        transform: `translate3d(0, ${tailExtra - collapse}px, 0)`,
        /* No transition — FigCanvas height jumps with collapse; animating
           only transform left a 450ms gap/overlap under the footer. */
      }}
    >
      {children}
    </div>
  );
}
