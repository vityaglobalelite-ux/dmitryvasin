import type { ReactNode } from "react";

export function CatalogEmpty({
  kicker,
  title,
  body,
  action,
}: {
  kicker?: string;
  title: string;
  body: string;
  action: ReactNode;
}) {
  return (
    <section className="relative mt-16 flex min-h-[min(52vh,560px)] flex-col justify-center max-[600px]:mt-10 max-[600px]:min-h-[min(46vh,400px)]">
      {kicker ? (
        <p className="text-[13px] font-semibold uppercase tracking-[0.22em] text-plum/40">
          {kicker}
        </p>
      ) : null}
      <h2 className="mt-6 max-w-[740px] text-[40px] font-medium leading-[1.1] tracking-[-1.2px] text-text max-[600px]:mt-4 max-[600px]:text-[24px] max-[600px]:tracking-[-0.72px]">
        {title}
      </h2>
      <div
        aria-hidden
        className="mt-6 h-px w-24 bg-[image:var(--brand-gradient)] max-[600px]:mt-4 max-[600px]:w-16"
      />
      <p className="mt-6 max-w-[34rem] text-[16px] leading-[1.5] text-text/70 max-[600px]:mt-4 max-[600px]:text-[14px]">
        {body}
      </p>
      <div className="mt-10 max-[600px]:mt-8">{action}</div>
    </section>
  );
}
