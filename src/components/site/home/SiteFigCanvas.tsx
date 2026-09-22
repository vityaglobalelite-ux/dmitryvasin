"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRegisterCanvasOverlayHost } from "@/components/site/auth/overlay-host";
import {
  getSiteCanvasZoom,
  invalidateSiteZoomViewportLock,
  isSiteMobileViewport,
  prefersTransformCanvasScale,
  supportsCssZoom,
  type SiteCanvasMode,
} from "@/lib/catalog/breakpoint";

/** Figma «Главная десктоп» 572:1864 */
export const SITE_DESKTOP_CANVAS = { w: 1920, h: 9375 } as const;
/** Figma «Главная_360» 722:4311 */
export const SITE_MOBILE_CANVAS = { w: 360, h: 10116 } as const;

export type { SiteCanvasMode };

/**
 * Locked Figma artboard scaled from the top-left.
 * Mode and zoom are split the same way as privateclub FigCanvas:
 * pick 360 vs 1920 first, then scale the current artboard.
 * Never combine left:50% + translateX(-50%) with scale — that shifts origin.
 */
export function SiteFigCanvas({
  children,
  mobileHeight,
}: {
  children: (mode: SiteCanvasMode) => ReactNode;
  /** Shorter than Figma when the home catalog rail has fewer than 3 cards. */
  mobileHeight?: number;
}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const overlayHostRef = useRegisterCanvasOverlayHost();
  const [mode, setMode] = useState<SiteCanvasMode>("desktop");
  const [ready, setReady] = useState(false);

  const canvas =
    mode === "mobile"
      ? { w: SITE_MOBILE_CANVAS.w, h: mobileHeight ?? SITE_MOBILE_CANVAS.h }
      : SITE_DESKTOP_CANVAS;

  useLayoutEffect(() => {
    const applyMode = () => {
      const next: SiteCanvasMode = isSiteMobileViewport() ? "mobile" : "desktop";
      setMode((prev) => (prev === next ? prev : next));
    };
    applyMode();
    window.addEventListener("resize", applyMode);
    window.addEventListener("orientationchange", applyMode);
    window.visualViewport?.addEventListener("resize", applyMode);
    return () => {
      window.removeEventListener("resize", applyMode);
      window.removeEventListener("orientationchange", applyMode);
      window.visualViewport?.removeEventListener("resize", applyMode);
    };
  }, []);

  useLayoutEffect(() => {
    const el = canvasRef.current;
    const shell = shellRef.current;
    if (!el || !shell) return;

    let lastZoom = -1;

    const apply = (opts?: { relock?: boolean }) => {
      if (opts?.relock) invalidateSiteZoomViewportLock();

      const next = getSiteCanvasZoom(canvas.w, mode);
      if (Math.abs(next - lastZoom) < 0.0005) {
        setReady(true);
        return;
      }
      lastZoom = next;

      const useTransform =
        prefersTransformCanvasScale() || !supportsCssZoom();

      el.dataset.canvasScale = String(next);

      if (useTransform) {
        el.style.zoom = "";
        el.style.transform = `scale(${next})`;
        el.style.transformOrigin = "top left";
        const fitted =
          mode === "mobile"
            ? Math.min(canvas.w * next, document.documentElement.clientWidth)
            : canvas.w * next;
        shell.style.width = `${fitted}px`;
        shell.style.height = `${canvas.h * next}px`;
        shell.style.overflow = "hidden";
      } else {
        el.style.zoom = String(next);
        el.style.transform = "";
        el.style.transformOrigin = "";
        // CSS zoom rounds the border box up. A specified shell width clips
        // that fraction so the document never scrolls sideways.
        shell.style.width = mode === "mobile" ? "100%" : "";
        shell.style.minWidth = mode === "mobile" ? "0" : "";
        shell.style.height = "";
        shell.style.overflow = mode === "mobile" ? "hidden" : "";
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
  }, [canvas.h, canvas.w, mode]);

  /* Same as privateclub FigCanvas: hero marks data-eager-images */
  useEffect(() => {
    const root = canvasRef.current;
    if (!root) return;
    root.querySelectorAll("img").forEach((img) => {
      if (img.closest("[data-eager-images]")) {
        if (!img.hasAttribute("decoding")) {
          img.setAttribute("decoding", "async");
        }
        return;
      }
      if (!img.hasAttribute("loading")) {
        img.setAttribute("loading", "lazy");
      }
      if (!img.hasAttribute("decoding")) {
        img.setAttribute("decoding", "async");
      }
    });
  }, [mode]);

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
        <div className="relative z-0">{children(mode)}</div>
        <div
          ref={overlayHostRef}
          className="pointer-events-none absolute inset-0 z-[200] has-[dialog]:pointer-events-auto"
        />
      </div>
    </div>
  );
}
