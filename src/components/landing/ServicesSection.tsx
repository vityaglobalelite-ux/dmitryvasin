"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { services } from "@/lib/site-data";

type Service = (typeof services)[number];

function ServiceModal({
  service,
  onClose,
}: {
  service: Service;
  onClose: () => void;
}) {
  const { details } = service;

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
      aria-label={service.title}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-[#090808] p-6 md:p-10"
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

        <h2 className="pr-8 text-2xl font-black uppercase text-white md:text-3xl">
          {service.title}
        </h2>

        <div className="mt-6 space-y-4 text-base leading-relaxed text-white/90">
          {details.intro.length > 0 && (
            <ul className="space-y-1">
              {details.intro.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          )}

          {details.forItems.length > 0 && (
            <>
              <p className="font-semibold text-white">{details.forTitle}</p>
              <ul className="space-y-1 pl-2">
                {details.forItems.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </>
          )}

          <p className="font-semibold text-white">{details.goalTitle}</p>
          <ul className="space-y-1 pl-2">
            {details.goalItems.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>

          {"steps" in details && details.steps && (
            <>
              <p className="font-semibold text-white">{details.stepsTitle}</p>
              <ul className="space-y-1 pl-2">
                {details.steps.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </>
          )}

          <p className="pt-2 font-medium text-white">{service.summary}</p>
        </div>
      </div>
    </div>
  );
}

export function ServicesSection() {
  const [active, setActive] = useState<Service | null>(null);

  return (
    <section id="services" className="bg-[#090808] py-16 md:py-20">
      <div className="mx-auto grid max-w-[1200px] gap-8 px-4 md:grid-cols-2 md:px-6">
        {services.map((service) => (
          <article
            key={service.id}
            className="group overflow-hidden rounded-2xl bg-gradient-to-b from-[#181616]/90 to-[#eb0b0b]/40 p-1 shadow-lg"
          >
            <div className="overflow-hidden rounded-xl">
              <Image
                src={service.image}
                alt={service.title}
                width={560}
                height={360}
                className="h-[220px] w-full object-cover transition group-hover:scale-[1.02] md:h-[280px]"
              />
            </div>
            <div className="p-5">
              <h2 className="text-xl font-black uppercase leading-snug text-white md:text-2xl">
                {service.title}
              </h2>
              <p className="mt-3 text-sm text-white/80 md:text-base">
                {service.summary}
              </p>
              <button
                type="button"
                onClick={() => setActive(service)}
                className="mt-5 inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-gradient-to-t from-[#181616] to-[#eb0b0b] px-6 text-sm capitalize text-white transition hover:brightness-110"
              >
                подробнее
              </button>
            </div>
          </article>
        ))}
      </div>

      {active && (
        <ServiceModal service={active} onClose={() => setActive(null)} />
      )}
    </section>
  );
}
