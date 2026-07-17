"use client";

import { footerLinks, socialLinks } from "@/lib/landing-data";
import { useIsMobile } from "@/lib/landing-mode";

/* Figma: Group 2332 / Rectangle 41 (0,14807,1920x324) — light footer */

const socialRow1 = socialLinks.slice(0, 4);
const socialRow2 = socialLinks.slice(4, 7);

function FooterMobile() {
  return (
    <footer
      id="contacts"
      className="absolute left-0 top-[17080px] h-[586px] w-[360px] bg-light-gray"
    >
      {/* Social row 1 — y 17142 → rel 62 */}
      <div className="absolute left-[20px] top-[62px] flex gap-[10px]">
        {socialRow1.map((s) => (
          <a
            key={s.label}
            href={s.href}
            aria-label={s.label}
            className="grid size-[40px] place-items-center rounded-[30px] bg-[image:var(--brand-gradient)] transition hover:brightness-110"
          >
            <img src={s.icon} alt="" className="size-[24px]" />
          </a>
        ))}
      </div>
      {/* Social row 2 — y 17192 → rel 112 */}
      <div className="absolute left-[20px] top-[112px] flex gap-[10px]">
        {socialRow2.map((s) => (
          <a
            key={s.label}
            href={s.href}
            aria-label={s.label}
            className="grid size-[40px] place-items-center rounded-[30px] bg-[image:var(--brand-gradient)] transition hover:brightness-110"
          >
            <img src={s.icon} alt="" className="size-[24px]" />
          </a>
        ))}
      </div>

      {/* Meta disclaimer — 20,17247 → rel 167 */}
      <p className="absolute left-[20px] top-[167px] w-[224px] text-[12px] leading-[1.5] text-text">
        *Meta запрещена на территории РФ
      </p>

      {/* Frame 2408 — 20,17305 → rel 225 */}
      <nav className="absolute left-[20px] top-[225px] flex w-[320px] flex-col gap-[10px]">
        {footerLinks.map((link) => (
          <a
            key={link}
            href="#"
            className="text-[13px] font-normal leading-[1.5] text-text hover:text-accent-red"
            style={{ width: link.length > 40 ? 297 : 320 }}
          >
            {link}
          </a>
        ))}
      </nav>

      {/* Copyright body — 20,17445 → rel 365 */}
      <p className="absolute left-[20px] top-[365px] w-[320px] text-[13px] font-normal leading-[1.5] text-text">
        Все&nbsp;права защищены, контент сайта принадлежит BeTango Global LLC
        Address: Florida, U.S.A. limited liability company with a registered
        agent address at 7901 4th St. N., Ste. 300, St. Petersburg, FL 33702
      </p>

      {/* © 2026 — 20,17605 → rel 525 */}
      <p className="absolute left-[20px] top-[525px] w-[320px] text-[13px] font-normal leading-[1.5] text-text">
        © 2026
      </p>
    </footer>
  );
}

function FooterDesktop() {
  return (
    <footer
      id="contacts"
      className="absolute left-0 top-[14807px] h-[324px] w-[1920px] bg-light-gray"
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
            key={link}
            href="#"
            className="text-[16px] leading-[1.5] text-text hover:text-accent-red"
            style={{ width: link.length > 40 ? 297 : undefined }}
          >
            {link}
          </a>
        ))}
      </nav>

      <div className="absolute left-[1450px] top-[100px] flex gap-[10px]">
        {socialRow1.map((s) => (
          <a
            key={s.label}
            href={s.href}
            aria-label={s.label}
            className="grid size-[50px] place-items-center rounded-[30px] bg-[image:var(--brand-gradient)] transition hover:brightness-110"
          >
            <img src={s.icon} alt="" className="size-[30px]" />
          </a>
        ))}
      </div>
      <div className="absolute left-[1510px] top-[160px] flex gap-[10px]">
        {socialRow2.map((s) => (
          <a
            key={s.label}
            href={s.href}
            aria-label={s.label}
            className="grid size-[50px] place-items-center rounded-[30px] bg-[image:var(--brand-gradient)] transition hover:brightness-110"
          >
            <img src={s.icon} alt="" className="size-[30px]" />
          </a>
        ))}
      </div>
      <p className="absolute left-[1456px] top-[221px] text-[12px] leading-[1.5] text-text">
        *Meta запрещена на территории РФ
      </p>
    </footer>
  );
}

export function Footer() {
  const isMobile = useIsMobile();
  return isMobile ? <FooterMobile /> : <FooterDesktop />;
}
