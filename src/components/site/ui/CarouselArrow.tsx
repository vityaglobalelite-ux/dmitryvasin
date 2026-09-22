"use client";

import { siteFocusRing } from "@/components/site/ui/Button";
import { useLocale } from "@/lib/catalog/locale-context";

const labels = {
  ru: { prev: "Назад", next: "Дальше" },
  en: { prev: "Previous", next: "Next" },
} as const;

export function CarouselArrow({
  dir,
  onClick,
  tone = "solid",
  className,
  label,
}: {
  dir: "prev" | "next";
  onClick: () => void;
  tone?: "solid" | "glass";
  className?: string;
  label?: string;
}) {
  const locale = useLocale();
  const text = label ?? labels[locale][dir];

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
        "pointer-events-auto absolute top-1/2 z-30 flex size-11 -translate-y-1/2 items-center justify-center rounded-full transition-[transform,background-color,color,opacity] duration-200 ease-out",
        "hover:scale-105 active:scale-95 motion-reduce:transition-none motion-reduce:hover:scale-100",
        "max-[600px]:size-9",
        siteFocusRing,
        tone === "glass"
          ? "border border-white/45 bg-black/40 text-white shadow-[0_8px_24px_rgba(0,0,0,0.28)] backdrop-blur-md hover:bg-black/55"
          : "border border-white bg-white/95 text-text shadow-[0_10px_28px_rgba(76,13,50,0.18)] hover:bg-[image:var(--brand-gradient)] hover:text-white",
        dir === "prev" ? "left-3 max-[600px]:left-2" : "right-3 max-[600px]:right-2",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        aria-hidden
        className={dir === "prev" ? "rotate-180" : undefined}
      >
        <path
          d="M6.5 3.5L12 9l-5.5 5.5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
