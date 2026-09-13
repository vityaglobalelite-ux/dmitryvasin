"use client";

import { clubPath } from "@/lib/club-config";
import { siteAssets } from "@/lib/catalog/assets";
import { useCatalogT } from "@/lib/catalog/locale-context";
import { LangDesktop } from "@/components/site/SiteLangSwitcher";

export function SiteFooter() {
  const copy = useCatalogT();

  const legalDesktop = [
    { href: clubPath("privacy-policy"), label: copy.footer.privacy },
    { href: clubPath("subscription-agreement"), label: copy.footer.offer },
    { href: clubPath("dmca-page"), label: copy.footer.dmca },
  ] as const;

  const legalMobile = [
    { href: clubPath("privacy-policy"), label: copy.footer.privacy },
    { href: clubPath("subscription-agreement"), label: copy.footer.offer },
    { href: "#mailing-consent", label: copy.footer.mailing },
  ] as const;

  const social = [
    {
      href: "https://t.me/DmitryVasinTango",
      icon: siteAssets.telegram,
      label: copy.footer.telegram,
      size: 30,
    },
    {
      href: "https://vk.ru/dmitryvasintango",
      icon: siteAssets.vk,
      label: copy.footer.vk,
      size: 30,
    },
    {
      href: "mailto:Support@betango.dance",
      icon: siteAssets.mail,
      label: copy.footer.email,
      size: 30,
    },
  ] as const;

  return (
    <footer className="mt-auto bg-light-gray max-[600px]:bg-white">
      <div className="hidden min-[601px]:block">
        <div className="flex items-start justify-between gap-10 px-[12.5%] py-[100px]">
          <div className="max-w-[520px] text-[16px] leading-[1.5] text-text">
            {copy.footer.rights.split("\n").map((line) => (
              <p key={line}>{line}</p>
            ))}
            <p className="mt-8">{copy.footer.copyright}</p>
          </div>
          <nav className="flex max-w-[297px] flex-col gap-5 text-[16px] leading-[1.5] text-text">
            {legalDesktop.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="transition-opacity hover:opacity-70"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex flex-col items-end gap-5">
            <LangDesktop />
            <SocialRow items={social} iconSize={30} />
          </div>
        </div>
      </div>

      <div className="hidden flex-col items-start gap-10 px-5 py-10 max-[600px]:flex">
        <div className="flex w-full items-center justify-between gap-4">
          <SocialRow items={social} iconSize={24} />
          <LangDesktop />
        </div>
        <p className="text-[12px] leading-[1.5] text-text">{copy.footer.metaBan}</p>
        <nav className="flex flex-col gap-2.5 text-[13px] leading-[1.5] text-text">
          {legalMobile.map((item) => (
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
      </div>
    </footer>
  );
}

function SocialRow({
  items,
  iconSize,
}: {
  items: readonly {
    href: string;
    icon: string;
    label: string;
    size: number;
  }[];
  iconSize: 24 | 30;
}) {
  const wrap = iconSize === 24 ? "size-10 rounded-3xl" : "size-[34px] rounded-[30px]";
  return (
    <div className="flex items-center gap-2.5">
      {items.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className={`inline-flex items-center justify-center bg-[image:var(--brand-gradient)] transition-transform duration-150 hover:scale-105 active:scale-95 ${wrap}`}
          aria-label={item.label}
          target={item.href.startsWith("mailto:") ? undefined : "_blank"}
          rel={item.href.startsWith("mailto:") ? undefined : "noreferrer"}
        >
          <img
            src={item.icon}
            alt=""
            width={iconSize}
            height={iconSize}
            className={iconSize === 24 ? "size-6" : "size-[30px]"}
          />
        </a>
      ))}
    </div>
  );
}
