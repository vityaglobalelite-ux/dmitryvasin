"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { siteFocusRing } from "@/components/site/ui/Button";
import { productAssets } from "@/components/site/product/assets";
import { productUi } from "@/components/site/product/copy";
import { useLocale } from "@/lib/catalog/locale-context";

const FRAME =
  "group/cover relative h-[564px] w-full overflow-hidden rounded-[20px] bg-light-gray max-[600px]:h-[180px] max-[600px]:rounded-[10px] min-[601px]:row-span-2";

export function CoverStage({
  urls,
  alt,
  locked,
  unlockDate,
}: {
  urls: string[];
  alt: string;
  locked: boolean;
  unlockDate: string;
}) {
  return (
    <div className={FRAME}>
      {urls.length > 1 ? (
        <CoverCarousel urls={urls} alt={alt} />
      ) : urls[0] ? (
        <Image
          src={urls[0]}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 600px) 320px, 710px"
          unoptimized
          priority
        />
      ) : null}
      {locked ? <PeekLockFill date={unlockDate} dimmed={urls.length > 0} /> : null}
    </div>
  );
}

function CoverCarousel({ urls, alt }: { urls: string[]; alt: string }) {
  const locale = useLocale();
  const ui = productUi(locale);
  const scroller = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const onScroll = useCallback(() => {
    const el = scroller.current;
    if (!el || el.clientWidth <= 0) return;
    const next = Math.round(el.scrollLeft / el.clientWidth);
    setIndex(Math.min(urls.length - 1, Math.max(0, next)));
  }, [urls.length]);

  const go = useCallback(
    (next: number) => {
      const el = scroller.current;
      if (!el) return;
      const clamped = Math.min(urls.length - 1, Math.max(0, next));
      el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
    },
    [urls.length],
  );

  return (
    <>
      <div
        ref={scroller}
        onScroll={onScroll}
        className="flex h-full snap-x snap-mandatory overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-roledescription="carousel"
        aria-label={alt}
      >
        {urls.map((url, i) => (
          <div
            key={`${url}-${i}`}
            className="relative h-full w-full shrink-0 snap-center"
          >
            <Image
              src={url}
              alt={i === 0 ? alt : ""}
              fill
              className="object-cover"
              sizes="(max-width: 600px) 320px, 710px"
              unoptimized
              priority={i === 0}
            />
          </div>
        ))}
      </div>
      <div className="absolute bottom-5 left-1/2 z-[3] flex -translate-x-1/2 items-center gap-2 max-[600px]:bottom-2.5">
        <button
          type="button"
          className="sr-only"
          onClick={() => go(index - 1)}
        >
          {ui.coverPrev}
        </button>
        {urls.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={ui.coverDot.replace("{n}", String(i + 1))}
            aria-current={i === index}
            onClick={() => go(i)}
            className={[
              "size-2.5 rounded-full transition-[transform,background-color] duration-200",
              siteFocusRing,
              i === index
                ? "scale-110 bg-white"
                : "bg-white/45 hover:bg-white/70",
            ].join(" ")}
          />
        ))}
        <button
          type="button"
          className="sr-only"
          onClick={() => go(index + 1)}
        >
          {ui.coverNext}
        </button>
      </div>
    </>
  );
}

function PeekLockFill({
  date,
  dimmed,
}: {
  date: string;
  dimmed: boolean;
}) {
  const ui = productUi(useLocale());
  return (
    <div
      className={[
        "absolute inset-0 z-[2] flex flex-col items-center justify-center gap-5 px-6 text-center max-[600px]:gap-3",
        dimmed ? "bg-[#f4f4f6]/92 backdrop-blur-[8px]" : "bg-light-gray",
        "pointer-events-none transition-colors duration-200 ease-out group-hover/cover:bg-[#f4f4f6]/80",
      ].join(" ")}
    >
      <img
        src={productAssets.lock}
        alt=""
        width={62}
        height={78}
        className="max-[600px]:h-[39px] max-[600px]:w-[31px] origin-center transition-transform duration-200 ease-out group-hover/cover:scale-110 motion-reduce:transition-none motion-reduce:group-hover/cover:scale-100"
      />
      <p className="text-[16px] leading-[1.5] text-text max-[600px]:text-[13px]">
        <span>{ui.peekOpens}</span>
        {date ? (
          <>
            <br />
            <strong className="font-bold">{date}</strong>
          </>
        ) : null}
      </p>
    </div>
  );
}
