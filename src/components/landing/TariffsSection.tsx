import { landingAssets } from "@/lib/landing-assets";
import { tariffs } from "@/lib/landing-data";

/* Figma: y 10354..11120 — «Выбирайте тариф участия» */

const cardX = [240, 727, 1213];

export function TariffsSection() {
  return (
    <section id="tariffs" className="absolute left-0 top-0 h-0 w-full">
      <h2 className="h-section absolute left-[240px] top-[10358px] w-[626px]">
        Выбирайте тариф участия
      </h2>

      {/* start badge (1417,10354,263x62) */}
      <div className="absolute left-[1417px] top-[10354px] flex h-[62px] w-[263px] items-center rounded-full bg-light-gray">
        <span className="ml-[20px] grid size-[34px] place-items-center rounded-full bg-[image:var(--brand-gradient)]">
          <img src={landingAssets.icons.stopwatch} alt="" className="size-[24px]" />
        </span>
        <span className="ml-[10px] text-[20px] font-medium leading-[29px] text-text-dark">
          Старт: 25 июля
        </span>
      </div>

      {tariffs.map((t, i) => (
        <article
          key={t.id}
          className="absolute h-[636px] w-[467px] rounded-[30px] bg-light-gray"
          style={{ left: cardX[i], top: 10458 }}
        >
          <div className="absolute left-[30px] top-[30px]">
            <p className="text-[10px] font-semibold uppercase tracking-[1px] text-text/50">
              {t.badge}
            </p>
            <p className="mt-[6px] text-[28px] font-semibold leading-[36px] text-text-dark">
              {t.title}
            </p>
          </div>

          {/* duration row */}
          <div className="absolute left-[30px] top-[110px] flex h-[62px] w-[407px] items-center rounded-full bg-white">
            <span className="ml-[20px] grid size-[34px] shrink-0 place-items-center rounded-full bg-[image:var(--brand-gradient)]">
              <img
                src={landingAssets.icons.calendarTariff}
                alt=""
                className="size-[20px]"
              />
            </span>
            <span className="ml-[10px] w-[314px] text-[16px] font-medium leading-[21px] text-text-dark">
              {t.duration}
            </span>
          </div>

          <ul className="absolute left-[30px] top-[202px] w-[407px]">
            {t.features.map((f, fi) => (
              <li
                key={f}
                className={`py-[10px] text-[16px] leading-[24px] text-text ${
                  fi > 0 ? "border-t border-[#e3e3e6]" : "pt-0"
                }`}
              >
                {f}
              </li>
            ))}
          </ul>

          <div className="absolute bottom-[30px] left-[30px]">
            <p className="flex items-end gap-[30px]">
              <span className="text-[28px] font-bold leading-[36px] text-text-dark">
                {t.price}
              </span>
              <span className="text-[16px] leading-[24px] text-text/50 line-through">
                {t.oldPrice}
              </span>
            </p>
            <a href="#payment" className="btn-primary mt-[30px]">
              Оплатить
            </a>
          </div>
        </article>
      ))}
    </section>
  );
}
