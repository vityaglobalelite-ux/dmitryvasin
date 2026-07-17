import { landingAssets } from "@/lib/landing-assets";

type LogoProps = {
  /** Figma desktop Group 2310 415×40 / mobile 212×22 at 13px */
  size?: "desktop" | "mobile";
};

/**
 * Figma Group 2310 — uppercase brand lockup.
 * Desktop (753,33,415×40). Mobile (30,22,212×22) — 13px.
 */
export function Logo({ size = "desktop" }: LogoProps) {
  if (size === "mobile") {
    return (
      <a
        href="#"
        className="relative inline-flex h-[22px] w-[212px] items-center no-underline select-none"
        aria-label="Смотри. Повторяй. Танцуй!"
      >
        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-[13px] font-bold uppercase leading-none text-plum">
          Смотри.
        </span>
        <img
          src={landingAssets.icons.eye}
          alt=""
          className="absolute left-[25px] top-[8px] size-[5.5px]"
          width={6}
          height={6}
        />
        <span className="absolute left-[71px] top-1/2 h-[21px] w-[74px] -translate-y-1/2">
          <span className="absolute left-[1px] top-0 rotate-3 text-[13px] font-semibold uppercase leading-none text-plum/50">
            Повторяй.
          </span>
          <span className="absolute left-0 top-[2px] -rotate-3 text-[13px] font-bold uppercase leading-none text-plum">
            Повторяй.
          </span>
          <img
            src={landingAssets.icons.bracketBl}
            alt=""
            className="absolute -left-[2px] bottom-0 size-[5px] -rotate-3"
            width={5}
            height={5}
          />
          <img
            src={landingAssets.icons.bracketTr}
            alt=""
            className="absolute -right-[1px] -top-[2px] size-[5px] rotate-[177deg]"
            width={5}
            height={5}
          />
        </span>
        <span
          className="absolute left-[157px] top-1/2 -translate-y-1/2 bg-clip-text text-[13px] font-bold uppercase leading-none text-transparent"
          style={{
            backgroundImage:
              "linear-gradient(141.56deg, #db0c25 2.6%, #e04c29 36.63%, #efb991 105.73%)",
          }}
        >
          Танцуй!
        </span>
      </a>
    );
  }

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
