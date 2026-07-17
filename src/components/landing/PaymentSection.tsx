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
          className="absolute flex h-[320px] w-[345px] flex-col gap-[30px] rounded-[30px] bg-light-gray p-[30px]"
          style={{ left: stepX[i], top: 11794, width: i === 0 ? 346 : 345 }}
        >
          <img
            src={landingAssets.icons.stepChips[i]}
            alt={`${s.step}`}
            className="size-[50px] shrink-0"
            width={50}
            height={50}
          />
          <div className="h-[72px] w-full shrink-0 rounded-[10px] bg-[#d9d9d9]" />
          <p className="text-[16px] leading-[1.5] text-text">{s.title}</p>
        </div>
      ))}

      {/* Figma 249:2023 */}
      <div className="absolute left-[240px] top-[12154px] flex h-[30px] w-[990px] items-center gap-[10px]">
        <img
          src={landingAssets.icons.personSupport}
          alt=""
          className="size-[30px] shrink-0"
          width={30}
          height={30}
        />
        <p className="whitespace-nowrap text-[24px] font-medium leading-[1.2] text-text">
          Если возникнут вопросы, служба поддержки в боте поможет на любом
          этапе.
        </p>
      </div>

      {/* Figma 249:1900 — градиентный баннер поддержки */}
      <div
        className="absolute left-[240px] top-[12364px] h-[330px] w-[1440px] overflow-hidden rounded-[40px]"
        style={{
          backgroundImage:
            "linear-gradient(149.52deg, #db0c25 2.6%, #e04c29 36.63%, #efb991 105.73%)",
        }}
      >
        <div className="absolute left-[60px] top-[60px] flex w-[934px] flex-col gap-[40px]">
          <p className="text-[50px] font-medium leading-[1.1] tracking-[-1.5px] text-light-gray">
            Если у вас есть вопросы — напишите в поддержку, и вам помогут
          </p>
          <a href="#contacts" className="btn-primary">
            Написать в поддержку
          </a>
        </div>

        {/* Figma 249:2022 — crop inside 318×330 at (1362,12364) → rel (1122,0) */}
        <div className="pointer-events-none absolute left-[1122px] top-0 h-[330px] w-[318px] overflow-hidden">
          <img
            src={landingAssets.misc.mockupPayment}
            alt=""
            className="absolute left-0 top-[-6.97%] h-[125.15%] w-[129.87%] max-w-none"
          />
        </div>
      </div>
    </section>
  );
}
