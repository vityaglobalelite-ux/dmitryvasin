"use client";

import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

/**
 * One page-level layer for site dialogs — above every chrome piece
 * (the fixed header included), same size on the home canvas and inner pages.
 */
const OverlayHostContext = createContext<HTMLElement | null | undefined>(undefined);

export function OverlayHostProvider({ children }: { children: ReactNode }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [host, setHost] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    setHost(hostRef.current);
  }, []);

  return (
    <OverlayHostContext.Provider value={host}>
      {children}
      <div
        ref={hostRef}
        className="pointer-events-none fixed inset-0 z-[200] has-[dialog]:pointer-events-auto"
      />
    </OverlayHostContext.Provider>
  );
}

export function useOverlayHost(): HTMLElement | null {
  const host = useContext(OverlayHostContext);
  if (host === undefined) {
    throw new Error("useOverlayHost must be used within OverlayHostProvider");
  }
  return host;
}
