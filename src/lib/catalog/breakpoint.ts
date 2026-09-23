/**
 * Phone chrome uses the 360-frame; otherwise desktop 1920.
 * Same rules as privateclub `landing-mode` — do not import landing modules.
 */
export const SITE_MOBILE_MAX_WIDTH = 600;

/** Catalog home hero frame (Figma desktop first screen). */
export const SITE_DESKTOP_VIEWPORT_FRAME_H = 900;

/** Never blow past Figma 1:1 on wide monitors. */
export const SITE_MAX_DESKTOP_CANVAS_ZOOM = 1;

/**
 * Visual (scaled) home canvas width in px, set on <html> while the canvas is
 * mounted. The site header lives outside the canvas and aligns to its column.
 */
export const SITE_CANVAS_WIDTH_VAR = "--site-canvas-w";

/** Relock zoom viewport only on real width / orientation changes — not URL-bar show/hide. */
const VIEWPORT_WIDTH_RELOCK_PX = 48;

export type SiteCanvasMode = "desktop" | "mobile";

type LockedZoomViewport = {
  w: number;
  h: number;
  aspect: "portrait" | "landscape";
};

let lockedZoomViewport: LockedZoomViewport | null = null;

/**
 * Layout viewport, not the visual one. The on-screen keyboard and pinch-zoom
 * shrink `visualViewport` — a portrait phone with the keyboard up reads as
 * landscape and would swap the 360 canvas for the 1920 one mid-typing.
 */
export function getSiteViewportSize() {
  const root = document.documentElement;
  return { w: root.clientWidth, h: root.clientHeight };
}

function aspectOf(w: number, h: number): "portrait" | "landscape" {
  return h >= w ? "portrait" : "landscape";
}

/**
 * Stable size for canvas zoom.
 * Mobile browser chrome show/hide changes visualViewport height (and sometimes
 * width by a few px) on scroll — that must NOT rescale the whole Figma canvas.
 */
export function getSiteZoomViewportSize() {
  const raw = getSiteViewportSize();
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

export function invalidateSiteZoomViewportLock() {
  lockedZoomViewport = null;
}

/**
 * Mobile 360 only for portrait phones.
 * Landscape phone → desktop (360 can’t fill a wide short screen).
 * Tablet (short side > 600) → desktop.
 */
export function isSiteMobileViewport(w?: number, h?: number) {
  const size =
    w !== undefined && h !== undefined ? { w, h } : getSiteViewportSize();
  const shortSide = Math.min(size.w, size.h);
  const portrait = size.h >= size.w;
  return portrait && shortSide <= SITE_MOBILE_MAX_WIDTH;
}

/**
 * Mobile: always fill WIDTH (vw/360) — no side letterboxing.
 * Desktop/tablet: min(vw/1920, vh/900, 1) — same first screen as privateclub.
 */
export function getSiteCanvasZoom(canvasWidth: number, mode: SiteCanvasMode) {
  const { w, h } = getSiteZoomViewportSize();

  if (mode === "mobile") {
    const layout = document.documentElement.clientWidth || w;
    // Floor so 360 × zoom cannot round above the layout viewport.
    // A fraction of a pixel of horizontal overflow makes Chrome arm
    // pull-to-refresh on the left and right edges.
    const zoom = Math.floor((layout * 1000) / canvasWidth) / 1000;
    return zoom > 0 ? zoom : layout / canvasWidth;
  }

  return Math.min(
    w / canvasWidth,
    h / SITE_DESKTOP_VIEWPORT_FRAME_H,
    SITE_MAX_DESKTOP_CANVAS_ZOOM,
  );
}

export function supportsCssZoom() {
  return typeof CSS !== "undefined" && CSS.supports("zoom", "1");
}

/**
 * iPhone/iPad Safari: CSS `zoom` can leave fonts unscaled (or boosted), so
 * absolute Figma text overlaps. Prefer transform scale on touch devices.
 */
export function prefersTransformCanvasScale() {
  if (typeof window === "undefined") return false;
  try {
    if (navigator.maxTouchPoints > 0) return true;
    return window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  } catch {
    return false;
  }
}
