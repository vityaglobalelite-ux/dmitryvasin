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
  /** Positive px removed from canvas / applied as -translateY when inactive */
  collapse: number;
  target: Date | null;
  active: boolean;
  ready: boolean;
};

const Ctx = createContext<CountdownTailCtx | null>(null);

export function CountdownTailProvider({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();
  const { target, active, ready } = usePriceIncreaseTarget();
  const collapse = active
    ? 0
    : isMobile
      ? COUNTDOWN_COLLAPSE.mobile
      : COUNTDOWN_COLLAPSE.desktop;
  const value = useMemo(
    () => ({ collapse, target, active, ready }),
    [collapse, target, active, ready],
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
  const { collapse } = useCountdownTail();
  return (
    <div
      className="absolute left-0 top-0 w-full will-change-transform"
      style={{
        transform: `translate3d(0, ${-collapse}px, 0)`,
        transition: "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      {children}
    </div>
  );
}
