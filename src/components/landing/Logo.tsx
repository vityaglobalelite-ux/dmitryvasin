import { landingAssets } from "@/lib/landing-assets";

/**
 * Figma Group 2310 (753,33,415×40) — uppercase brand lockup.
 */
export function Logo() {
  return (
    <a
      href="#"
      className="relative inline-flex h-[40px] w-[415px] items-center no-underline select-none"
      aria-label="Смотри. Повторяй. Танцуй!"
    >
      {/* Смотри. */}
      <span className="absolute left-0 top-1/2 -translate-y-1/2 text-[24px] font-semibold uppercase leading-none text-plum">
        Смотри.
      </span>
      <img
        src={landingAssets.icons.eye}
        alt=""
        className="absolute left-[46px] top-[14px] size-[11px]"
        width={11}
        height={11}
      />

      {/* Повторяй. — ghost + main */}
      <span className="absolute left-[143px] top-1/2 h-[39px] w-[136px] -translate-y-1/2">
        <span className="absolute left-[2px] top-0 rotate-3 text-[24px] font-semibold uppercase leading-none text-plum/30">
          Повторяй.
        </span>
        <span className="absolute left-0 top-[2px] -rotate-3 text-[24px] font-semibold uppercase leading-none text-plum">
          Повторяй.
        </span>
        <img
          src={landingAssets.icons.bracketBl}
          alt=""
          className="absolute -left-[3px] bottom-[2px] size-[9px] -rotate-3"
          width={9}
          height={9}
        />
        <img
          src={landingAssets.icons.bracketTr}
          alt=""
          className="absolute -right-[2px] -top-[4px] size-[9px] rotate-[177deg]"
          width={9}
          height={9}
        />
      </span>

      {/* Танцуй! — gradient fill */}
      <span
        className="absolute left-[313px] top-1/2 -translate-y-1/2 bg-clip-text text-[24px] font-bold uppercase leading-none text-transparent"
        style={{
          backgroundImage:
            "linear-gradient(129.34deg, #db0c25 2.6%, #e04c29 36.63%, #efb991 105.73%)",
        }}
      >
        Танцуй!
      </span>
    </a>
  );
}
