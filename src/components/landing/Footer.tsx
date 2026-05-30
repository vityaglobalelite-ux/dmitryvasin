import Image from "next/image";
import Link from "next/link";
import { socialLinks } from "@/lib/site-data";

function SocialIcon({ link }: { link: (typeof socialLinks)[number] }) {
  return (
    <a
      href={link.href}
      target={link.href.startsWith("mailto:") ? undefined : "_blank"}
      rel={
        link.href.startsWith("mailto:") ? undefined : "noopener noreferrer"
      }
      aria-label={link.label}
      className="inline-flex h-[4.5rem] w-[4.5rem] shrink-0 transition hover:opacity-80"
    >
      <Image
        src={link.icon}
        alt={link.label}
        width={72}
        height={72}
        className="h-[4.5rem] w-[4.5rem]"
      />
    </a>
  );
}

export function Footer() {
  const topSocialLinks = socialLinks.slice(0, 4);
  const bottomSocialLinks = socialLinks.slice(4);

  return (
    <footer className="relative w-full bg-[#090808] py-[4.5rem] md:py-24">
      <div className="flex w-full flex-col gap-[3.75rem] px-4 md:flex-row md:items-start md:gap-9 md:px-6 lg:px-10">
        <div className="min-w-0 flex-1 basis-0 text-xl leading-relaxed text-white/90">
          <p>© Все права защищены, контент сайта</p>
          <p>принадлежит Дмитрию Васину</p>
          <p className="mt-3">ИП Васин Д.В.</p>
          <p>ИНН 771574228268</p>
          <p>ОГРНИП 307770000362132</p>
        </div>

        <nav className="flex min-w-0 flex-1 basis-0 flex-col items-center text-2xl leading-snug text-white">
          <div className="w-fit text-left">
            <div className="flex flex-col gap-3">
              <Link href="/oferta">Договор оферты</Link>
              <Link href="/politika">Политика конфиденциальности</Link>
              <Link href="/soglasie">
                Согласие на получение
                <br />
                рекламной и информационной
                <br />
                рассылки
              </Link>
            </div>
          </div>
        </nav>

        <div className="flex min-w-0 flex-1 basis-0 flex-col items-center">
          <div className="w-fit text-left">
            <div className="grid grid-cols-4 gap-[1.125rem]">
              {topSocialLinks.map((link) => (
                <SocialIcon key={link.href} link={link} />
              ))}
              {bottomSocialLinks.map((link) => (
                <SocialIcon key={link.href} link={link} />
              ))}
            </div>
            <p className="mt-6 text-lg italic text-white/60">
              *Meta запрещена на территории РФ
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
