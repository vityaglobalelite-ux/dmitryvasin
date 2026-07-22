"use client";

import { footerLinks, socialLinks } from "@/lib/landing-data";
import { useIsMobile } from "@/lib/landing-mode";

/* Figma: Group 2332 / Rectangle 41 (0,14807,1920x324) — light footer */

function SocialIcon({
  href,
  label,
  icon,
  size,
  iconSize,
}: {
  href: string;
  label: string;
  icon: string;
  size: string;
  iconSize: string;
}) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      aria-label={label}
      className={`grid ${size} place-items-center rounded-[30px] bg-[image:var(--brand-gradient)] transition hover:brightness-110`}
    >
      <img src={icon} alt="" className={`${iconSize} object-contain`} />
    </a>
  );
}

function FooterMobile() {
  return (
    <footer
      id="contacts"
      className="absolute left-0 top-[17080px] h-[586px] w-[360px] bg-light-gray"
    >
      <div className="absolute left-[20px] top-[62px] flex flex-wrap gap-[10px]">
        {socialLinks.map((s) => (
          <SocialIcon
            key={s.label}
            href={s.href}
            label={s.label}
            icon={s.icon}
            size="size-[40px]"
            iconSize="size-[24px]"
          />
        ))}
      </div>

      <p className="absolute left-[20px] top-[122px] w-[224px] text-[12px] leading-[1.5] text-text">
        *Meta запрещена на территории РФ
      </p>

      <nav className="absolute left-[20px] top-[180px] flex w-[320px] flex-col gap-[10px]">
        {footerLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="text-[13px] font-normal leading-[1.5] text-text hover:text-accent-red"
            style={{ width: link.label.length > 40 ? 297 : 320 }}
          >
            {link.label}
          </a>
        ))}
      </nav>

      <p className="absolute left-[20px] top-[340px] w-[320px] text-[13px] font-normal leading-[1.5] text-text">
        Все&nbsp;права защищены, контент сайта принадлежит BeTango Global LLC
        Address: Florida, U.S.A. limited liability company with a registered
        agent address at 7901 4th St. N., Ste. 300, St. Petersburg, FL 33702
      </p>

      <p className="absolute left-[20px] top-[500px] w-[320px] text-[13px] font-normal leading-[1.5] text-text">
        © 2026
      </p>
    </footer>
  );
}

function FooterDesktop() {
  return (
    <footer
      id="contacts"
      className="absolute left-0 top-[14908px] h-[324px] w-[1920px] bg-light-gray"
    >
      <p className="absolute left-[241px] top-[100px] w-[520px] whitespace-pre-wrap text-[16px] leading-[1.5] text-text">
        {`Все права защищены, контент сайта принадлежит  
BeTango Global LLC 
Address: Florida, U.S.A. limited liability company with a registered agent address at 7901 4th St. N., Ste. 300, St. Petersburg, FL 33702 `}
      </p>
      <p className="absolute left-[241px] top-[212px] text-[16px] leading-[1.5] text-text">
        © 2026
      </p>

      <nav className="absolute left-[848px] top-[100px] flex w-[516px] flex-col gap-[20px]">
        {footerLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="text-[16px] leading-[1.5] text-text hover:text-accent-red"
            style={{ width: link.label.length > 40 ? 297 : undefined }}
          >
            {link.label}
          </a>
        ))}
      </nav>

      <div className="absolute left-[1450px] top-[100px] flex gap-[10px]">
        {socialLinks.map((s) => (
          <SocialIcon
            key={s.label}
            href={s.href}
            label={s.label}
            icon={s.icon}
            size="size-[50px]"
            iconSize="size-[30px]"
          />
        ))}
      </div>
      <p className="absolute left-[1456px] top-[170px] text-[12px] leading-[1.5] text-text">
        *Meta запрещена на территории РФ
      </p>
    </footer>
  );
}

export function Footer() {
  const isMobile = useIsMobile();
  return isMobile ? <FooterMobile /> : <FooterDesktop />;
}
