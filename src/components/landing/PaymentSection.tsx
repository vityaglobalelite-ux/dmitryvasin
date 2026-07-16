import { landingAssets } from "@/lib/landing-assets";
import { paymentSteps } from "@/lib/landing-data";

/* Figma: y 11624..12694 — «Стоимость и оплата» */

const stepX = [240, 605, 970, 1335];

export function PaymentSection() {
  return (
    <section id="payment" className="absolute left-0 top-0 h-0 w-full">
      <h2 className="h-section absolute left-[241px] top-[11624px] w-[1400px]">
        Стоимость и оплата
      </h2>
      <p className="absolute left-[241px] top-[11696px] w-[588px] text-[20px] leading-[29px] text-text">
        Присоединиться к закрытому исследованию можно из любой точки мира.
      </p>

      {paymentSteps.map((s, i) => (
        <div
          key={s.step}
          className="absolute h-[320px] w-[345px] rounded-[30px] bg-light-gray"
          style={{ left: stepX[i], top: 11794 }}
        >
          <span className="absolute left-[30px] top-[30px] grid size-[50px] place-items-center rounded-full bg-[image:var(--brand-gradient)] text-[20px] font-semibold text-white">
            {s.step}
          </span>
          <div className="absolute left-[30px] top-[110px] h-[72px] w-[286px] rounded-[15px] bg-white" />
          <p className="absolute left-[30px] top-[212px] w-[286px] text-[16px] leading-[24px] text-text">
            {s.title}
          </p>
        </div>
      ))}

      {/* support hint row (240,12154,990x30) */}
      <div className="absolute left-[240px] top-[12154px] flex w-[990px] items-center gap-[10px]">
        <img
          src={landingAssets.icons.stopwatch}
          alt=""
          className="hidden"
        />
        <span className="grid size-[30px] place-items-center rounded-full bg-[image:var(--brand-gradient)] text-[14px] text-white">
          ?
        </span>
        <p className="text-[20px] leading-[29px] text-text">
          Если возникнут вопросы, служба поддержки в боте поможет на любом
          этапе.
        </p>
      </div>

      {/* support card (240,12364,1440x330) */}
      <div className="absolute left-[240px] top-[12364px] h-[330px] w-[1440px] overflow-hidden rounded-[40px] bg-light-gray">
        <p className="absolute left-[60px] top-[60px] w-[934px] text-[50px] font-medium leading-[55px] tracking-[-1.5px] text-text-dark">
          Если у вас есть вопросы — напишите в поддержку, и вам помогут
        </p>
        <a href="#contacts" className="btn-primary absolute left-[60px] top-[210px]">
          Написать в поддержку
        </a>
        <img
          src={landingAssets.misc.mockupPayment}
          alt=""
          className="pointer-events-none absolute right-0 top-0 h-[330px] w-[318px] object-contain object-bottom"
        />
      </div>
    </section>
  );
}
