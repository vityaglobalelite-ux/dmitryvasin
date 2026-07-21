"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { MOBILE_CANVAS_HEIGHT_SHRINK } from "@/lib/mobile-section-gaps";

export const DESKTOP_CANVAS = { w: 1920, h: 15131 } as const;
/** Figma Главная_360 is 17666; shortened after mobile inter-section gap compression */
export const MOBILE_CANVAS = {
  w: 360,
  h: 17666 - MOBILE_CANVAS_HEIGHT_SHRINK,
} as const;
/** Viewport max-width that uses Figma Главная_360 (360×17666). */
export const MOBILE_MAX_WIDTH = 767;

export type LandingMode = "desktop" | "mobile";

const LandingModeContext = createContext<LandingMode>("desktop");

export function useLandingMode() {
  return useContext(LandingModeContext);
}

export function useIsMobile() {
  return useLandingMode() === "mobile";
}

export function LandingModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<LandingMode>("desktop");

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`);
    const apply = () => setMode(mq.matches ? "mobile" : "desktop");
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return (
    <LandingModeContext.Provider value={mode}>
      {children}
    </LandingModeContext.Provider>
  );
}
