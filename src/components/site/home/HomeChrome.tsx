"use client";

import { siteAssets } from "@/lib/catalog/assets";
import { clubPath } from "@/lib/club-config";
import { useCatalogT } from "@/lib/catalog/locale-context";

function Social({ size }: { size: 24 | 30 }) {
  const copy = useCatalogT();
  const wrap = size === 24 ? "size-10 rounded-3xl" : "size-[50px] rounded-[30px]";
  const items = [
    {
      href: "https://t.me/DmitryVasinTango",
      icon: siteAssets.telegram,
      label: copy.footer.telegram,
    },
    {
      href: "https://vk.ru/dmitryvasintango",
      icon: siteAssets.vk,
      label: copy.footer.vk,
    },
    {
      href: "mailto:Support@betango.dance",
      icon: siteAssets.mail,
      label: copy.footer.email,
    },
  ] as const;

  return (
    <>
      {items.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className={`inline-flex shrink-0 items-center justify-center overflow-hidden bg-[image:var(--brand-gradient)] transition-transform duration-150 hover:scale-105 active:scale-95 ${wrap}`}
          aria-label={item.label}
          target={item.href.startsWith("mailto:") ? undefined : "_blank"}
          rel={item.href.startsWith("mailto:") ? undefined : "noreferrer"}
        >
          <img
            src={`${item.icon}?v=fig`}
            alt=""
            width={size}
            height={size}
            className={size === 24 ? "size-6" : "size-[30px]"}
          />
        </a>
      ))}
    </>
  );
}

export function HomeFooterDesktop() {
  const copy = useCatalogT();
  const legal = [
    { href: clubPath("privacy-policy"), label: copy.footer.privacy },
    { href: clubPath("subscription-agreement"), label: copy.footer.offer },
    { href: clubPath("dmca-page"), label: copy.footer.dmca },
  ] as const;

  return (
    <footer
      id="contacts"
      className="absolute left-0 top-[9051px] z-20 h-[324px] w-[1920px] bg-light-gray"
    >
      <div className="absolute left-[241px] top-[100px] w-[520px] text-[16px] leading-[1.5] text-text">
        {copy.footer.rights.split("\n").map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
      <p className="absolute left-[241px] top-[212px] text-[16px] leading-[1.5] text-text">
        {copy.footer.copyright}
      </p>
      <nav className="absolute left-[848px] top-[100px] flex w-[297px] flex-col gap-5 text-[16px] leading-[1.5] text-text">
        {legal.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="transition-opacity hover:opacity-70"
          >
            {item.label}
          </a>
        ))}
      </nav>
      <div className="absolute left-[1510px] top-[100px] flex items-center gap-[10px]">
        <Social size={30} />
      </div>
    </footer>
  );
}

export function HomeFooterMobile() {
  const copy = useCatalogT();
  const legal = [
    { href: clubPath("privacy-policy"), label: copy.footer.privacy },
    { href: clubPath("subscription-agreement"), label: copy.footer.offer },
    { href: "#mailing-consent", label: copy.footer.mailing },
  ] as const;

  return (
    <footer
      id="contacts"
      className="absolute left-5 top-[9586px] z-20 flex w-[320px] flex-col gap-10"
    >
      <div className="flex items-center gap-2.5">
        <Social size={24} />
      </div>
      <nav className="flex flex-col gap-2.5 text-[13px] leading-[1.5] text-text">
        {legal.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="transition-opacity hover:opacity-70"
          >
            {item.label}
          </a>
        ))}
      </nav>
      <div className="text-[13px] leading-[1.5] text-text">
        {copy.footer.rights.split("\n").map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
      <p className="text-[13px] leading-[1.5] text-text">{copy.footer.copyright}</p>
    </footer>
  );
}
