import type { CSSProperties, ReactNode } from "react";

/** Absolute Figma box on the locked home canvas. */
export function Layer({
  x,
  y,
  w,
  h,
  z,
  className,
  children,
  style,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  z?: number;
  className?: string;
  children?: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        zIndex: z,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Desktop RU line breaks locked to Figma — do not use on mobile. */
export function FigLines({
  lines,
  className,
  as: Tag = "p",
}: {
  lines: readonly string[];
  className?: string;
  as?: "p" | "h2";
}) {
  return (
    <Tag className={className}>
      {lines.map((line, i) => (
        <span key={i}>
          {i > 0 ? <br /> : null}
          {line}
        </span>
      ))}
    </Tag>
  );
}
