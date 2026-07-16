import { landingAssets } from "@/lib/landing-assets";

export function Logo() {
  return (
    <a href="#" className="relative inline-flex items-center gap-0 text-[22px] font-semibold leading-none text-text-dark no-underline">
      <span className="relative">
        Смотри
        <img
          src={landingAssets.icons.eye}
          alt=""
          className="absolute -bottom-1 left-[52px] size-[11px]"
          width={11}
          height={11}
        />
        .
      </span>
      <span className="relative mx-1 inline-block -rotate-3">
        <img
          src={landingAssets.icons.bracketBl}
          alt=""
          className="absolute -bottom-1 -left-1 size-[10px]"
          width={10}
          height={10}
        />
        Повторяй.
        <img
          src={landingAssets.icons.bracketTr}
          alt=""
          className="absolute -right-1 -top-1 size-[10px]"
          width={10}
          height={10}
        />
      </span>
      <span>Танцуй!</span>
    </a>
  );
}
