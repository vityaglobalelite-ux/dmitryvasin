"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ProgramTailCtx = {
  /** translateY for sections below program (px in Figma canvas space) */
  shift: number;
  setShift: (px: number) => void;
};

const Ctx = createContext<ProgramTailCtx | null>(null);

export function ProgramTailProvider({ children }: { children: ReactNode }) {
  const [shift, setShiftState] = useState(0);
  const setShift = useCallback((px: number) => {
    setShiftState((prev) => (Math.abs(prev - px) < 0.5 ? prev : px));
  }, []);
  const value = useMemo(() => ({ shift, setShift }), [shift, setShift]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useProgramTail() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useProgramTail must be used within ProgramTailProvider");
  }
  return ctx;
}

/** Sections after program — move with accordion open/close */
export function ProgramTail({ children }: { children: ReactNode }) {
  const { shift } = useProgramTail();
  return (
    <div
      className="absolute left-0 top-0 w-full will-change-transform"
      style={{
        transform: `translate3d(0, ${shift}px, 0)`,
        transition: "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      {children}
    </div>
  );
}
