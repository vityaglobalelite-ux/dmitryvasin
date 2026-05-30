import Link from "next/link";
import { socialLinks } from "@/lib/site-data";

export function Footer() {
  return (
    <footer className="bg-[#090808] py-12 md:py-16">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-4 md:grid-cols-[1fr_auto_auto] md:px-6">
        <div className="max-w-xs text-sm text-white/90">
          <p>© Все права защищены, контент сайта принадлежит Дмитрию Васину</p>
          <p className="mt-2">ИП Васин Д.В.</p>
          <p>ИНН 771574228268</p>
          <p>ОГРНИП 307770000362132</p>
        </div>

        <nav className="flex flex-col gap-3 text-base text-white">
          <Link href="/oferta">Договор оферты</Link>
          <Link href="/politika">Политика конфиденциальности</Link>
          <Link href="/soglasie">
            Согласие на получение рекламной и информационной рассылки
          </Link>
        </nav>

        <div>
          <div className="flex flex-wrap gap-3">
            {socialLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 min-w-[48px] items-center justify-center rounded-full border border-[#eb0b0b]/40 px-3 text-sm text-white transition hover:bg-[#eb0b0b]/20"
              >
                {link.label}
              </a>
            ))}
          </div>
          <p className="mt-4 text-xs italic text-white/60">
            *Meta запрещена на территории РФ
          </p>
        </div>
      </div>
    </footer>
  );
}
