"use client";

import { homeAssets } from "@/lib/catalog/home-assets";
import { homeT } from "@/lib/catalog/home-copy";
import { useLocale, useLocalizedRoutes } from "@/lib/catalog/locale-context";
import { HomePad } from "@/components/site/home/HomeFrame";

export function HomeHowTo() {
  const { copy } = homeT(useLocale());
  const routes = useLocalizedRoutes();
  const steps = [copy.how1, copy.how2, copy.how3] as const;

  return (
    <section className="py-8 max-[600px]:py-4">
      <HomePad>
        <div className="relative overflow-hidden rounded-[40px] bg-[image:var(--brand-gradient)] max-[600px]:rounded-[10px]">
          <div className="grid items-center min-[901px]:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
            <div className="relative min-h-[420px] max-[900px]:min-h-[240px] max-[600px]:order-2 max-[600px]:min-h-0">
              <img
                src={homeAssets.macbook}
                alt=""
                width={841}
                height={830}
                className="relative left-[-4%] top-[-24px] h-auto w-[118%] max-w-none rotate-[0.9deg] max-[600px]:left-0 max-[600px]:top-0 max-[600px]:w-full max-[600px]:rotate-0"
              />
              <div className="absolute bottom-[72px] left-[12%] flex max-w-[400px] items-center gap-[15px] rounded-[20px] border border-white bg-white/20 px-2.5 py-5 backdrop-blur-[12px] max-[600px]:relative max-[600px]:bottom-auto max-[600px]:left-0 max-[600px]:mx-[15px] max-[600px]:mb-4 max-[600px]:mt-[-48px] max-[600px]:max-w-none">
                <img
                  src={homeAssets.iconAccess}
                  alt=""
                  width={58}
                  height={58}
                  className="size-[58px] max-[600px]:size-[35px]"
                />
                <p className="text-[24px] font-medium leading-[1.2] text-white max-[600px]:text-[13px]">
                  {copy.howAccess}
                </p>
              </div>
            </div>

            <div className="px-10 py-12 max-[600px]:order-1 max-[600px]:px-[15px] max-[600px]:py-[15px]">
              <h2 className="text-[50px] font-medium leading-[1.1] tracking-[-1.5px] text-white max-[600px]:text-[24px] max-[600px]:tracking-[-0.72px]">
                {copy.howTitle}
              </h2>
              <ol className="mt-6 flex flex-col gap-2.5">
                {steps.map((text, index) => (
                  <li
                    key={text}
                    className="flex gap-[30px] rounded-[30px] bg-light-gray p-[30px] max-[600px]:gap-[10px] max-[600px]:rounded-[10px] max-[600px]:p-[15px]"
                  >
                    <span className="flex size-[50px] shrink-0 items-center justify-center rounded-full bg-[image:var(--brand-gradient)] text-[24px] font-medium text-white max-[600px]:size-[35px] max-[600px]:text-[16px]">
                      {index + 1}
                    </span>
                    <p className="text-[16px] leading-[1.5] text-text max-[600px]:text-[13px]">
                      {text}
                    </p>
                  </li>
                ))}
              </ol>
              <p className="mt-6 flex items-center gap-2.5 text-[24px] font-medium leading-[1.2] text-white max-[600px]:text-[13px]">
                <img
                  src={homeAssets.iconSupport}
                  alt=""
                  width={30}
                  height={30}
                  className="size-[30px]"
                />
                <a
                  href={routes.accountSupport}
                  className="transition-opacity hover:opacity-80"
                >
                  {copy.howSupport}
                </a>
              </p>
            </div>
          </div>
        </div>
      </HomePad>
    </section>
  );
}
