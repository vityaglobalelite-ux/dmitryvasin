"use client";

import {
  createContext,
  useContext,
  useLayoutEffect,
  useState,
  type ReactNode,
} from "react";

import { MOBILE_CANVAS_HEIGHT_SHRINK } from "@/lib/mobile-section-gaps";

/** Figma Дизайн height after payment bot-screen cards (+101) */
export const DESKTOP_CANVAS = { w: 1920, h: 15232 } as const;
/** Figma Главная_360 is 17666; shortened after mobile inter-section gap compression */
export const MOBILE_CANVAS = {
  w: 360,
  h: 17666 - MOBILE_CANVAS_HEIGHT_SHRINK,
} as const;

/**
 * Portrait-phone short side only (≈ CSS width).
 * 600 keeps large phones on 360; iPad Mini (744+) and up stay on desktop 1920 —
 * so tablets never get a tiny phone column with side gutters.
 */
export const MOBILE_MAX_WIDTH = 600;

/**
 * Desktop hero height (HeroDesktop h-[900px]).
 * Tablets/PCs: fit this frame + width, never above Figma 1:1.
 */
export const DESKTOP_VIEWPORT_FRAME_H = 900;

/** Never blow past Figma 1:1 on wide monitors. */
export const MAX_DESKTOP_CANVAS_ZOOM = 1;

/** Relock zoom viewport only on real width / orientation changes — not URL-bar show/hide. */
const VIEWPORT_WIDTH_RELOCK_PX = 48;

export type LandingMode = "desktop" | "mobile";

const LandingModeContext = createContext<LandingMode>("desktop");
const CanvasZoomContext = createContext(1);

type LockedZoomViewport = {
  w: number;
  h: number;
  aspect: "portrait" | "landscape";
};

let lockedZoomViewport: LockedZoomViewport | null = null;

export function useLandingMode() {
  return useContext(LandingModeContext);
}

export function useIsMobile() {
  return useLandingMode() === "mobile";
}

export function useCanvasZoom() {
  return useContext(CanvasZoomContext);
}

export function CanvasZoomProvider({
  value,
  children,
}: {
  value: number;
  children: ReactNode;
}) {
  return (
    <CanvasZoomContext.Provider value={value}>
      {children}
    </CanvasZoomContext.Provider>
  );
}

/** Live viewport — used for mobile/desktop mode detection. */
export function getViewportSize() {
  const w =
    window.visualViewport?.width ?? document.documentElement.clientWidth;
  const h =
    window.visualViewport?.height ?? document.documentElement.clientHeight;
  return { w, h };
}

function aspectOf(w: number, h: number): "portrait" | "landscape" {
  return h >= w ? "portrait" : "landscape";
}

/**
 * Stable size for canvas zoom.
 * Mobile browser chrome show/hide changes visualViewport height (and sometimes
 * width by a few px) on scroll — that must NOT rescale the whole Figma canvas.
 * Relock only when orientation flips or width jumps meaningfully.
 */
export function getZoomViewportSize() {
  const raw = getViewportSize();
  const aspect = aspectOf(raw.w, raw.h);

  if (
    !lockedZoomViewport ||
    lockedZoomViewport.aspect !== aspect ||
    Math.abs(raw.w - lockedZoomViewport.w) >= VIEWPORT_WIDTH_RELOCK_PX
  ) {
    lockedZoomViewport = { w: raw.w, h: raw.h, aspect };
  }

  return { w: lockedZoomViewport.w, h: lockedZoomViewport.h };
}

export function invalidateZoomViewportLock() {
  lockedZoomViewport = null;
}

/**
 * Mobile 360 only for portrait phones.
 * - Landscape phone → desktop (360 can’t fill a wide short screen)
 * - Tablet (short side > 600) → desktop
 */
export function isMobileViewport(w?: number, h?: number) {
  const size =
    w !== undefined && h !== undefined ? { w, h } : getViewportSize();
  const shortSide = Math.min(size.w, size.h);
  const portrait = size.h >= size.w;
  return portrait && shortSide <= MOBILE_MAX_WIDTH;
}

/**
 * Mobile: always fill WIDTH (vw/360) — no side letterboxing.
 * Desktop/tablet: min(vw/1920, vh/900, 1) — same first screen on every PC/tablet.
 * Uses locked zoom viewport so URL-bar collapse doesn’t change scale.
 */
export function getCanvasZoom(canvasWidth: number, mode: LandingMode) {
  const { w, h } = getZoomViewportSize();

  if (mode === "mobile") {
    return w / canvasWidth;
  }

  return Math.min(
    w / canvasWidth,
    h / DESKTOP_VIEWPORT_FRAME_H,
    MAX_DESKTOP_CANVAS_ZOOM,
  );
}

export function supportsCssZoom() {
  return typeof CSS !== "undefined" && CSS.supports("zoom", "1");
}

export function LandingModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<LandingMode>("desktop");

  useLayoutEffect(() => {
    const apply = () => {
      setMode(isMobileViewport() ? "mobile" : "desktop");
    };
    apply();
    window.addEventListener("resize", apply);
    window.addEventListener("orientationchange", apply);
    window.visualViewport?.addEventListener("resize", apply);
    return () => {
      window.removeEventListener("resize", apply);
      window.removeEventListener("orientationchange", apply);
      window.visualViewport?.removeEventListener("resize", apply);
    };
  }, []);

  return (
    <LandingModeContext.Provider value={mode}>
      {children}
    </LandingModeContext.Provider>
  );
}
