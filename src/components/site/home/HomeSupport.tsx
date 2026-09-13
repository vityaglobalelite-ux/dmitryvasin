"use client";

import { homeAssets } from "@/lib/catalog/home-assets";
import { homeT } from "@/lib/catalog/home-copy";
import { useLocale, useLocalizedRoutes } from "@/lib/catalog/locale-context";
import { HomePad } from "@/components/site/home/HomeFrame";
import { Button } from "@/components/site/ui/Button";

export function HomeSupport() {
  const { copy } = homeT(useLocale());
  const routes = useLocalizedRoutes();
  return (
    <section id="contacts" className="scroll-mt-[70px] py-10 max-[600px]:py-6">
      <HomePad>
        <div className="relative overflow-hidden rounded-[40px] bg-[image:var(--brand-gradient)] px-[60px] py-[60px] max-[600px]:rounded-[10px] max-[600px]:px-[15px] max-[600px]:py-5">
          <div className="relative z-[1] max-w-[934px]">
            <h2 className="text-[50px] font-medium leading-[1.1] tracking-[-1.5px] text-light-gray max-[600px]:max-w-[280px] max-[600px]:text-[24px] max-[600px]:tracking-normal">
              {copy.supportTitle}
            </h2>
            <Button
              href={routes.accountSupport}
              className="mt-10 w-[259px] px-0 max-[600px]:mt-6"
            >
              {copy.supportCta}
            </Button>
          </div>
          <img
            src={homeAssets.question}
            alt=""
            width={318}
            height={330}
            className="pointer-events-none absolute bottom-0 right-[6%] h-[330px] w-[318px] object-contain max-[600px]:right-0 max-[600px]:h-[146px] max-[600px]:w-[209px]"
          />
        </div>
      </HomePad>
    </section>
  );
}
