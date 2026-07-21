import Link from "next/link";
import type { LegalBlock, LegalDocMeta } from "@/lib/legal-docs";
import { legalNav } from "@/lib/legal-docs";
import { siteConfig } from "@/lib/site-data";

function Block({ block }: { block: LegalBlock }) {
  if (block.type === "h2") {
    return (
      <h2 className="legal-h2 mt-10 scroll-mt-24 text-[18px] font-semibold leading-[1.3] tracking-[-0.02em] text-text-dark first:mt-0 md:text-[22px]">
        {block.text}
      </h2>
    );
  }
  return (
    <p className="mt-4 text-[15px] font-normal leading-[1.65] text-text md:text-[16px] md:leading-[1.7]">
      {block.text}
    </p>
  );
}

export function LegalPage({ doc }: { doc: LegalDocMeta }) {
  return (
    <div className="legal-page min-h-screen bg-[#f7f5f3] text-text">
      <header className="sticky top-0 z-20 border-b border-black/5 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-[64px] w-full max-w-[920px] items-center justify-between px-5 md:px-8">
          <Link
            href="/"
            className="text-[13px] font-semibold uppercase tracking-[-0.02em] text-plum transition hover:text-accent-red"
          >
            ← На главную
          </Link>
          <span className="hidden text-[12px] text-text/60 sm:inline">
            {siteConfig.url.replace(/^https?:\/\//, "")}
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[920px] px-5 pb-20 pt-10 md:px-8 md:pb-28 md:pt-14">
        <div className="overflow-hidden rounded-[28px] bg-white shadow-[0_12px_40px_rgba(37,37,37,0.06)] md:rounded-[36px]">
          <div
            className="px-6 pb-8 pt-10 md:px-12 md:pb-10 md:pt-14"
            style={{
              backgroundImage:
                "linear-gradient(135deg, rgba(219,12,37,0.08) 0%, rgba(239,185,145,0.16) 45%, rgba(255,255,255,0) 70%)",
            }}
          >
            <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-accent-orange">
              BeTango Global LLC
            </p>
            <h1 className="mt-3 max-w-[18ch] text-[28px] font-semibold leading-[1.15] tracking-[-0.03em] text-text-dark md:max-w-none md:text-[42px]">
              {doc.titleRu}
            </h1>
            {doc.titleEn ? (
              <p className="mt-3 text-[14px] leading-[1.5] text-text/70 md:text-[16px]">
                {doc.titleEn}
              </p>
            ) : null}
            <div
              className="mt-6 h-[3px] w-[72px] rounded-full"
              style={{ backgroundImage: "var(--brand-gradient)" }}
              aria-hidden
            />
          </div>

          <article className="px-6 pb-12 pt-2 md:px-12 md:pb-16">
            {doc.blocks.map((block, i) => (
              <Block key={`${block.type}-${i}`} block={block} />
            ))}
          </article>
        </div>

        <nav className="mt-10 rounded-[24px] bg-white/70 p-6 shadow-[0_8px_24px_rgba(37,37,37,0.04)] md:p-8">
          <p className="text-[13px] font-medium uppercase tracking-[0.06em] text-text/50">
            Другие документы
          </p>
          <ul className="mt-4 flex flex-col gap-3">
            {legalNav
              .filter((l) => l.href !== `/${doc.slug}/`)
              .map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[15px] font-medium text-text-dark underline decoration-accent-orange/30 underline-offset-4 transition hover:text-accent-red hover:decoration-accent-red"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
          </ul>
        </nav>
      </main>
    </div>
  );
}
