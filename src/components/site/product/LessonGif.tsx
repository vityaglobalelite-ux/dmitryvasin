"use client";

import { useState } from "react";
import { Skeleton } from "@/components/site/ui/Skeleton";

/** Fixed frame so GIF load never shifts the program list. */
const FRAME =
  "relative h-[176px] w-[264px] shrink-0 overflow-hidden rounded-[10px] bg-[#ececf0] max-[600px]:h-[132px] max-[600px]:w-[198px]";

export function LessonGif({ src }: { src: string }) {
  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");

  return (
    <div className={FRAME}>
      {phase !== "ready" ? (
        <Skeleton className="absolute inset-0 rounded-[10px]" />
      ) : null}
      {phase !== "error" ? (
        <img
          src={src}
          alt=""
          width={264}
          height={176}
          decoding="async"
          loading="lazy"
          draggable={false}
          className={[
            "absolute inset-0 size-full object-cover",
            phase === "ready" ? "opacity-100" : "opacity-0",
          ].join(" ")}
          aria-hidden
          onLoad={() => setPhase("ready")}
          onError={() => setPhase("error")}
        />
      ) : null}
    </div>
  );
}

export function LessonGifRow({ urls }: { urls: string[] }) {
  if (urls.length === 0) return null;
  return (
    <div className="flex gap-2.5 overflow-x-auto pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {urls.map((url) => (
        <LessonGif key={url} src={url} />
      ))}
    </div>
  );
}
