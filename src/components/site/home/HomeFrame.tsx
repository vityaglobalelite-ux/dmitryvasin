import type { CSSProperties, ReactNode } from "react";

type HomeFrameProps = {
  width: 1920 | 360;
  height: number;
  children: ReactNode;
};

/**
 * Locked Figma artboard scaled to viewport width.
 * Desktop 1920 / phone 360 — same breakpoint as the shop chrome (≤600).
 * Does not import club FigCanvas / landing-mode.
 */
export function HomeFrame({ width, height, children }: HomeFrameProps) {
  const isDesktop = width === 1920;
  const shell: CSSProperties = {
    height: `calc(min(100vw, ${width}px) * ${height} / ${width})`,
  };
  const inner: CSSProperties = {
    width,
    height,
    transform: `translateX(-50%) scale(calc(min(100vw, ${width}px) / ${width}))`,
  };

  return (
    <div
      className={
        isDesktop
          ? "relative hidden w-full overflow-x-clip min-[601px]:block"
          : "relative hidden w-full overflow-x-clip max-[600px]:block"
      }
      style={shell}
    >
      <div className="absolute left-1/2 top-0 origin-top" style={inner}>
        {children}
      </div>
    </div>
  );
}

export function HomePad({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "mx-auto w-full max-w-[1920px] px-[12.5%] max-[600px]:px-5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
