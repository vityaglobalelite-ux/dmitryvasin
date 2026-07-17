"use client";

import { useEffect, useRef } from "react";
import {
  DESKTOP_CANVAS,
  LandingModeProvider,
  MOBILE_CANVAS,
  useLandingMode,
} from "@/lib/landing-mode";

/**
 * Fixed design canvas scaled to the viewport width via CSS zoom.
 * Desktop: Figma 1920×15131. Mobile (≤767px): Figma Главная_360 360×17666.
 */
function FigCanvasInner({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const mode = useLandingMode();
  const canvas = mode === "mobile" ? MOBILE_CANVAS : DESKTOP_CANVAS;

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

  return (
    <div
      ref={ref}
      className="relative mx-auto overflow-hidden bg-white"
      style={{ width: canvas.w, height: canvas.h }}
      data-landing-mode={mode}
    >
      {children}
    </div>
  );
}

export function FigCanvas({ children }: { children: React.ReactNode }) {
  return (
    <LandingModeProvider>
      <FigCanvasInner>{children}</FigCanvasInner>
    </LandingModeProvider>
  );
}
