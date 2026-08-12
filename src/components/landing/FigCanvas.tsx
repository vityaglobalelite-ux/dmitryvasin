"use client";

import { useLayoutEffect, useEffect, useRef, useState } from "react";
import {
  CanvasZoomProvider,
  DESKTOP_CANVAS,
  getCanvasZoom,
  invalidateZoomViewportLock,
  isLandingLayoutFrozen,
  LandingModeProvider,
  MOBILE_CANVAS,
  supportsCssZoom,
  useLandingMode,
} from "@/lib/landing-mode";
import {
  CountdownTailProvider,
  useCountdownTail,
} from "@/lib/countdown-tail";
import { ProgramTailProvider, useProgramTail } from "@/lib/program-tail";
import { bindSectionScroll } from "@/lib/smooth-scroll";
import { StickyMobileCta } from "./StickyMobileCta";

/**
 * Fixed Figma canvas scaled uniformly to the viewport.
 * Phone → 360. Tablet/desktop → 1920, fitted by width AND first-screen height.
 */
function FigCanvasInner({ children }: { children: React.ReactNode }) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const mode = useLandingMode();
  const { shift } = useProgramTail();
  const { collapse: countdownCollapse } = useCountdownTail();
  const canvas = mode === "mobile" ? MOBILE_CANVAS : DESKTOP_CANVAS;
  /* shift < 0 when accordion collapses; countdownCollapse > 0 when banner hidden —
     must shrink canvas or empty gaps appear at the bottom */
  const height = canvas.h + shift - countdownCollapse;

  const [zoom, setZoom] = useState(1);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const el = canvasRef.current;
    const shell = shellRef.current;
    if (!el || !shell) return;

    let lastZoom = -1;

    const apply = (opts?: { relock?: boolean }) => {
      if (isLandingLayoutFrozen()) return;
      if (opts?.relock) invalidateZoomViewportLock();

      const next = getCanvasZoom(canvas.w, mode);
      if (Math.abs(next - lastZoom) < 0.0005) return;
      lastZoom = next;

      setZoom(next);
      document.documentElement.style.setProperty(
        "--canvas-zoom",
        String(next),
      );

      if (supportsCssZoom()) {
        el.style.zoom = String(next);
        el.style.transform = "";
        el.style.transformOrigin = "";
        shell.style.width = "";
        shell.style.height = "";
      } else {
        /* Firefox <126: zoom unsupported — scale + sized shell keeps scroll height correct */
        el.style.zoom = "";
        el.style.transform = `scale(${next})`;
        el.style.transformOrigin = "top left";
        shell.style.width = `${canvas.w * next}px`;
        shell.style.height = `${height * next}px`;
      }

      setReady(true);
      window.dispatchEvent(
        new CustomEvent("figcanvas:zoom", { detail: { zoom: next } }),
      );
    };

    const onResize = () => apply();
    const onOrientation = () => apply({ relock: true });

    apply({ relock: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onOrientation);
    window.visualViewport?.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onOrientation);
      window.visualViewport?.removeEventListener("resize", onResize);
    };
  }, [canvas.w, height, mode]);

  useEffect(() => bindSectionScroll(document), []);

  /* Lazy-load below-fold images; hero marks data-eager-images */
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
    <CanvasZoomProvider value={zoom}>
      <div
        ref={shellRef}
        className="fig-canvas-shell relative mx-auto"
        data-canvas-ready={ready ? "true" : "false"}
      >
        <div
          ref={canvasRef}
          className="fig-canvas relative overflow-hidden bg-white"
          style={{
            width: canvas.w,
            height,
            visibility: ready ? "visible" : "hidden",
          }}
          data-landing-mode={mode}
        >
          {children}
        </div>
      </div>
      <StickyMobileCta />
    </CanvasZoomProvider>
  );
}

export function FigCanvas({ children }: { children: React.ReactNode }) {
  return (
    <LandingModeProvider>
      <ProgramTailProvider>
        <CountdownTailProvider>
          <FigCanvasInner>{children}</FigCanvasInner>
        </CountdownTailProvider>
      </ProgramTailProvider>
    </LandingModeProvider>
  );
}
