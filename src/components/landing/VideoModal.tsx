"use client";

import { useEffect } from "react";

type VideoModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  videoSrc: string;
  poster?: string;
};

export function VideoModal({
  open,
  onClose,
  title,
  description,
  videoSrc,
  poster,
}: VideoModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#090808]/95 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="relative w-full max-w-5xl rounded-2xl bg-[#090808] p-6 md:p-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-white/80 transition hover:text-white"
          aria-label="Закрыть"
        >
          <svg width="24" height="24" viewBox="0 0 23 23" fill="none">
            <rect
              x="10.3"
              y="-3.7"
              width="2"
              height="30"
              fill="currentColor"
              transform="rotate(-45 11.3 11.3)"
            />
            <rect
              x="10.3"
              y="-3.7"
              width="2"
              height="30"
              fill="currentColor"
              transform="rotate(45 11.3 11.3)"
            />
          </svg>
        </button>

        <h2 className="mb-2 text-center text-3xl font-black uppercase text-white md:text-5xl">
          <span className="bg-[#eb0b0b] px-2">{title}</span>
        </h2>
        <p className="mx-auto mb-6 max-w-xl text-center text-base text-white/90 md:text-lg">
          {description}
        </p>

        <div className="overflow-hidden rounded-2xl shadow-[0_0_30px_4px_rgba(235,11,11,0.8)]">
          <video
            key={videoSrc}
            className="aspect-video w-full bg-black object-cover"
            controls
            autoPlay
            playsInline
            poster={poster}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        </div>
      </div>
    </div>
  );
}
