"use client";

import { homeAssets } from "@/lib/catalog/home-assets";
import { homeT } from "@/lib/catalog/home-copy";
import { useLocale } from "@/lib/catalog/locale-context";
import { HomePad } from "@/components/site/home/HomeFrame";

export function HomeTeacher() {
  const { copy } = homeT(useLocale());
  return (
    <section className="relative z-[1] -mt-8 max-[600px]:-mt-4">
      <HomePad>
        <div className="relative overflow-hidden rounded-[40px] bg-[image:var(--brand-gradient)] max-[600px]:rounded-[10px]">
          <div className="relative z-[1] max-w-[834px] px-10 pb-[52px] pt-[41px] max-[600px]:max-w-none max-[600px]:px-[15px] max-[600px]:pb-[280px] max-[600px]:pt-[15px]">
            <h2 className="text-[50px] font-medium leading-[1.1] tracking-[-1.5px] text-white max-[600px]:text-[24px] max-[600px]:tracking-[-0.72px]">
              {copy.approach}
            </h2>
            <div className="relative mt-10 max-w-[488px] rounded-[20px] bg-white py-5 pl-[100px] pr-5 shadow-[0_4px_21.5px_rgba(0,0,0,0.09)] max-[600px]:mt-6 max-[600px]:max-w-none max-[600px]:py-[15px] max-[600px]:pl-[14px] max-[600px]:pr-[82px]">
              <img
                src={homeAssets.idea}
                alt=""
                width={83}
                height={112}
                className="absolute left-0 top-0 h-[112px] w-[83px] max-[600px]:left-auto max-[600px]:right-0 max-[600px]:h-[90px] max-[600px]:w-[67px]"
              />
              <p className="text-[16px] leading-[1.5] text-text max-[600px]:text-[13px]">
                {copy.peopleLead}
                <span className="font-semibold">{copy.peopleRest}</span>
              </p>
            </div>
          </div>
          <img
            src={homeAssets.teacher}
            alt=""
            width={611}
            height={604}
            className="pointer-events-none absolute bottom-0 right-0 hidden h-[604px] w-[611px] object-contain object-bottom min-[601px]:block"
          />
          <img
            src={homeAssets.teacherMobile}
            alt=""
            width={320}
            height={316}
            className="pointer-events-none absolute bottom-0 left-0 hidden h-[316px] w-full object-cover object-top max-[600px]:block"
          />
        </div>
      </HomePad>
    </section>
  );
}
