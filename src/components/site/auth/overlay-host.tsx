"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

type OverlayHostContextValue = {
  host: HTMLElement | null;
  registerCanvasHost: (node: HTMLElement | null) => void;
};

const OverlayHostContext = createContext<OverlayHostContextValue | null>(null);

export function OverlayHostProvider({ children }: { children: ReactNode }) {
  const fallbackRef = useRef<HTMLDivElement>(null);
  const [fallbackHost, setFallbackHost] = useState<HTMLElement | null>(null);
  const [canvasHost, setCanvasHost] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    setFallbackHost(fallbackRef.current);
  }, []);

  const registerCanvasHost = useCallback((node: HTMLElement | null) => {
    setCanvasHost(node);
  }, []);

  const value = useMemo(
    () => ({ host: canvasHost ?? fallbackHost, registerCanvasHost }),
    [canvasHost, fallbackHost, registerCanvasHost],
  );

  return (
    <OverlayHostContext.Provider value={value}>
      {children}
      <div
        ref={fallbackRef}
        className="pointer-events-none fixed inset-0 z-[200] has-[dialog]:pointer-events-auto"
        hidden={canvasHost != null}
      />
    </OverlayHostContext.Provider>
  );
}

export function useOverlayHost(): HTMLElement | null {
  const ctx = useContext(OverlayHostContext);
  if (!ctx) {
    throw new Error("useOverlayHost must be used within OverlayHostProvider");
  }
  return ctx.host;
}

export function useRegisterCanvasOverlayHost(): RefObject<HTMLDivElement | null> {
  const ctx = useContext(OverlayHostContext);
  if (!ctx) {
    throw new Error(
      "useRegisterCanvasOverlayHost must be used within OverlayHostProvider",
    );
  }
  const { registerCanvasHost } = ctx;
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    registerCanvasHost(ref.current);
    return () => registerCanvasHost(null);
  }, [registerCanvasHost]);
  return ref;
}
