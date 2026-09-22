"use client";

import { siteFocusRing } from "@/components/site/ui/Button";
import { useLocale } from "@/lib/catalog/locale-context";

const labels = {
  ru: { prev: "Назад", next: "Дальше" },
  en: { prev: "Previous", next: "Next" },
} as const;

/**
 * stage — large media control on a hero (product, lesson).
 * frame — quiet in-card frame step. Hidden until the card is hovered.
 * rail — shelf scroll. Brand disc, positioned by the caller.
 */
export function CarouselArrow({
  dir,
  onClick,
  tone = "solid",
  variant = "stage",
  reveal = false,
  className,
  label,
}: {
  dir: "prev" | "next";
  onClick: () => void;
  tone?: "solid" | "glass";
  variant?: "stage" | "frame" | "rail";
  /** Frame controls stay invisible until the parent `group` is hovered or focused. */
  reveal?: boolean;
  className?: string;
  label?: string;
}) {
  const locale = useLocale();
  const text = label ?? labels[locale][dir];
  const icon = variant === "rail" ? 20 : variant === "frame" ? 14 : 18;

  return (
    <button
      type="button"
      aria-label={text}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick();
      }}
      className={[
        "absolute z-30 flex -translate-y-1/2 items-center justify-center rounded-full",
        "transition-[transform,background-color,color,opacity,filter] duration-200 ease-out",
        "active:scale-95 motion-reduce:transition-none motion-reduce:hover:scale-100",
        siteFocusRing,
        variant === "rail"
          ? [
              "size-[52px] text-white max-[600px]:size-11",
              "bg-[image:var(--brand-gradient)]",
              "shadow-[0_0_0_4px_#fff,0_16px_36px_rgba(76,13,50,0.28)]",
              "hover:scale-105 hover:brightness-105",
              "pointer-events-auto",
            ].join(" ")
          : variant === "frame"
            ? [
                "top-1/2 size-8 text-white max-[600px]:size-9",
                "border border-white/35 bg-black/40 shadow-[0_8px_18px_rgba(0,0,0,0.28)] backdrop-blur-md",
                "hover:scale-105 hover:bg-black/60",
                dir === "prev"
                  ? "left-3 max-[600px]:left-2"
                  : "right-3 max-[600px]:right-2",
                reveal
                  ? "pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100 focus-visible:pointer-events-auto focus-visible:opacity-100 max-[600px]:pointer-events-auto max-[600px]:opacity-100"
                  : "pointer-events-auto",
              ].join(" ")
            : [
                "pointer-events-auto top-1/2 size-11 max-[600px]:size-9",
                "hover:scale-105",
                dir === "prev"
                  ? "left-3 max-[600px]:left-2"
                  : "right-3 max-[600px]:right-2",
                tone === "glass"
                  ? "border border-white/45 bg-black/40 text-white shadow-[0_8px_24px_rgba(0,0,0,0.28)] backdrop-blur-md hover:bg-black/55"
                  : "border border-white bg-white/95 text-text shadow-[0_10px_28px_rgba(76,13,50,0.18)] hover:bg-[image:var(--brand-gradient)] hover:text-white",
              ].join(" "),
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 18 18"
        fill="none"
        aria-hidden
        className={dir === "prev" ? "rotate-180" : undefined}
      >
        <path
          d="M6.5 3.5L12 9l-5.5 5.5"
          stroke="currentColor"
          strokeWidth={variant === "rail" ? 2.15 : 1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
