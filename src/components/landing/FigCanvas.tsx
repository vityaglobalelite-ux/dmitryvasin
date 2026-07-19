"use client";

import { useEffect, useRef } from "react";
import {
  DESKTOP_CANVAS,
  LandingModeProvider,
  MOBILE_CANVAS,
  useLandingMode,
} from "@/lib/landing-mode";
import { ProgramTailProvider, useProgramTail } from "@/lib/program-tail";
import { bindSectionScroll } from "@/lib/smooth-scroll";

/**
 * Fixed design canvas scaled to the viewport width via CSS zoom.
 * Desktop: Figma 1920×15131. Mobile (≤767px): Figma Главная_360 360×17666.
 */
function FigCanvasInner({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const mode = useLandingMode();
  const { shift } = useProgramTail();
  const canvas = mode === "mobile" ? MOBILE_CANVAS : DESKTOP_CANVAS;
  const height = canvas.h + Math.max(0, shift);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const apply = () => {
      el.style.zoom = String(document.documentElement.clientWidth / canvas.w);
    };
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, [canvas.w]);

  useEffect(() => bindSectionScroll(document), []);

  /* Lazy-load below-fold images; hero marks data-eager-images */
  useEffect(() => {
    const root = ref.current;
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
      ref={ref}
      className="relative mx-auto overflow-hidden bg-white"
      style={{ width: canvas.w, height }}
      data-landing-mode={mode}
    >
      {children}
    </div>
  );
}

export function FigCanvas({ children }: { children: React.ReactNode }) {
  return (
    <LandingModeProvider>
      <ProgramTailProvider>
        <FigCanvasInner>{children}</FigCanvasInner>
      </ProgramTailProvider>
    </LandingModeProvider>
  );
}
