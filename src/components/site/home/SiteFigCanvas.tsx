"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { SITE_MOBILE_MAX_WIDTH } from "@/lib/catalog/breakpoint";

/** Figma «Главная десктоп» 572:1864 */
export const SITE_DESKTOP_CANVAS = { w: 1920, h: 8704 } as const;
/** Figma «Главная_360» 722:4311 */
export const SITE_MOBILE_CANVAS = { w: 360, h: 10116 } as const;

/** Desktop: Figma 1920 1:1. Scale only when the window is narrower. */
const MAX_ZOOM = 1;
const VIEWPORT_WIDTH_RELOCK_PX = 48;

export type SiteCanvasMode = "desktop" | "mobile";

type LockedViewport = {
  w: number;
  h: number;
  aspect: "portrait" | "landscape";
};

function viewportSize() {
  const w =
    window.visualViewport?.width ?? document.documentElement.clientWidth;
  const h =
    window.visualViewport?.height ?? document.documentElement.clientHeight;
  return { w, h };
}

function supportsCssZoom() {
  return typeof CSS !== "undefined" && CSS.supports("zoom", "1");
}

function prefersTransformCanvasScale() {
  if (typeof window === "undefined") return false;
  try {
    if (navigator.maxTouchPoints > 0) return true;
    return window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  } catch {
    return false;
  }
}

/**
 * Locked Figma artboard scaled from the top-left.
 * Never combine left:50% + translateX(-50%) with scale — that shifts origin.
 */
export function SiteFigCanvas({
  children,
}: {
  children: (mode: SiteCanvasMode) => ReactNode;
}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const lockRef = useRef<LockedViewport | null>(null);
  const [mode, setMode] = useState<SiteCanvasMode>("desktop");
  const [ready, setReady] = useState(false);

  const canvas =
    mode === "mobile" ? SITE_MOBILE_CANVAS : SITE_DESKTOP_CANVAS;

  useLayoutEffect(() => {
    const el = canvasRef.current;
    const shell = shellRef.current;
    if (!el || !shell) return;

    let lastZoom = -1;

    const lockedViewport = () => {
      const raw = viewportSize();
      const aspect = raw.h >= raw.w ? "portrait" : "landscape";
      const prev = lockRef.current;
      if (
        !prev ||
        prev.aspect !== aspect ||
        Math.abs(raw.w - prev.w) >= VIEWPORT_WIDTH_RELOCK_PX
      ) {
        lockRef.current = { w: raw.w, h: raw.h, aspect };
      }
      return lockRef.current!;
    };

    const apply = (opts?: { relock?: boolean }) => {
      const nextMode: SiteCanvasMode =
        viewportSize().w <= SITE_MOBILE_MAX_WIDTH ? "mobile" : "desktop";
      setMode((prev) => (prev === nextMode ? prev : nextMode));

      const size = nextMode === "mobile" ? SITE_MOBILE_CANVAS : SITE_DESKTOP_CANVAS;
      if (opts?.relock) lockRef.current = null;
      const vp = lockedViewport();

      const next =
        nextMode === "mobile"
          ? vp.w / size.w
          : Math.min(vp.w / size.w, MAX_ZOOM);

      if (Math.abs(next - lastZoom) < 0.0005 && ready) return;
      lastZoom = next;

      const useTransform =
        prefersTransformCanvasScale() || !supportsCssZoom();

      if (useTransform) {
        el.style.zoom = "";
        el.style.transform = `scale(${next})`;
        el.style.transformOrigin = "top left";
        shell.style.width = `${size.w * next}px`;
        shell.style.height = `${size.h * next}px`;
        shell.style.overflow = "hidden";
      } else {
        el.style.zoom = String(next);
        el.style.transform = "";
        el.style.transformOrigin = "";
        shell.style.width = "";
        shell.style.height = "";
        shell.style.overflow = "";
      }

      setReady(true);
    };

    apply({ relock: true });
    const onResize = () => apply();
    const onOrientation = () => apply({ relock: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onOrientation);
    window.visualViewport?.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onOrientation);
      window.visualViewport?.removeEventListener("resize", onResize);
    };
  }, [mode, ready]);

  return (
    <div
      ref={shellRef}
      className="fig-canvas-shell relative mx-auto"
      data-canvas-ready={ready ? "true" : "false"}
    >
      <div
        ref={canvasRef}
        className="fig-canvas relative overflow-hidden bg-white"
        style={{ width: canvas.w, height: canvas.h }}
        data-site-canvas={mode}
      >
        {children(mode)}
      </div>
    </div>
  );
}
