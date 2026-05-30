"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { reviews } from "@/lib/site-data";

type Review = (typeof reviews)[number];

function ReviewModal({
  review,
  onClose,
}: {
  review: Review;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#090808]/95 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Отзыв: ${review.name}`}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-gradient-to-b from-[#181616] to-[#eb0b0b]/80 p-6 md:p-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-white/80 transition hover:text-white"
          aria-label="Закрыть"
        >
          ✕
        </button>

        <h3 className="text-2xl font-black uppercase text-white">
          {review.name}
        </h3>
        <p className="mt-2 text-sm italic text-white/80">{review.role}</p>
        <p className="mt-6 text-base leading-relaxed text-white">
          «{review.fullText}»
        </p>
      </div>
    </div>
  );
}

export function ReviewsSection() {
  const [active, setActive] = useState<Review | null>(null);

  return (
    <section id="otzivy" className="bg-[#090808] py-16 md:py-20">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <h2 className="text-center text-4xl font-black uppercase text-white md:text-6xl">
          отзывы
        </h2>
        <p className="mx-auto mt-4 max-w-md text-center text-base text-white md:text-xl">
          Листай и читай: вот, каких успехов другие уже добились в танго с моей
          помощью →
        </p>
      </div>

      <div className="mt-10 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="mx-auto flex w-max gap-5 px-4 md:px-[max(1.5rem,calc((100vw-1200px)/2))]">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="relative w-[340px] shrink-0 overflow-hidden rounded-2xl bg-gradient-to-b from-[#050505]/90 to-[#eb0b0b]/60 p-5 shadow-[0_4px_30px_rgba(235,11,11,1)]"
            >
              <div className="relative mx-auto mb-4 h-48 w-full overflow-hidden">
                <Image
                  src={review.image}
                  alt={review.name}
                  fill
                  className="object-contain object-top"
                  sizes="340px"
                />
              </div>
              <h3 className="text-xl font-black uppercase text-white">
                {review.name}
              </h3>
              <p className="mt-2 text-sm italic text-white/80">{review.role}</p>
              <p className="mt-4 text-base text-white">
                {review.excerpt}
                <span className="bg-[#eb0b0b] px-1">{review.highlight}</span>
                {review.tail}
              </p>
              <button
                type="button"
                onClick={() => setActive(review)}
                className="mt-3 text-sm text-white/70 underline transition hover:text-white"
              >
                Читать больше...
              </button>
            </article>
          ))}
        </div>
      </div>

      {active && (
        <ReviewModal review={active} onClose={() => setActive(null)} />
      )}
    </section>
  );
}
