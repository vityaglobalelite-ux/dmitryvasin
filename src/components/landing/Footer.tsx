import { footerLinks, socialLinks } from "@/lib/landing-data";

/* Figma: Group 2332 / Rectangle 41 (0,14807,1920x324) — light footer */

const socialRow1 = socialLinks.slice(0, 4);
const socialRow2 = socialLinks.slice(4, 7);

export function Footer() {
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
