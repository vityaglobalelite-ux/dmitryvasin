import { landingAssets } from "@/lib/landing-assets";

/* Figma: Rectangle 35 (242,9596,1440×584) + фото (1054,9498,626×682) */
export function TelegramSection() {
  return (
    <>
      <div
        className="absolute left-[242px] top-[9596px] h-[584px] w-[1440px] overflow-hidden rounded-[40px]"
        style={{
          backgroundImage:
            "linear-gradient(133.83deg, #db0c25 2.6%, #e04c29 36.63%, #efb991 105.73%)",
        }}
      />

      {/* 249:1434 — Medium 50 / 3 строки в 593 */}
      <h2 className="h-section absolute left-[302px] top-[9656px] z-[2] w-[593px] whitespace-pre !text-white">
        {`Исследование
проходит в\u00a0закрытом
Telegram-чате`}
      </h2>

      {/* 249:1561 */}
      <div className="absolute left-[302px] top-[9851px] z-[2] w-[524px] space-y-[24px] text-[16px] font-normal leading-[1.5] text-white">
        <p>
          Все&nbsp;уроки и&nbsp;материалы собраны в&nbsp;одном чате
          и&nbsp;сформированы по&nbsp;темам.
        </p>
        <p>
          Смотрите наши уроки по&nbsp;расписанию и&nbsp;«подсматривайте»
          в&nbsp;удобное для&nbsp;себя время, задавайте вопросы.
        </p>
      </div>

      {/* 249:1986 */}
      <div className="absolute left-[302px] top-[10030px] z-[2] flex h-[90px] w-[559px] items-center gap-[10px] rounded-[20px] bg-white p-[20px] shadow-[0px_4px_21.5px_0px_rgba(0,0,0,0.09)]">
        <img
          src={landingAssets.icons.calendarGradientChip}
          alt=""
          className="size-[50px] shrink-0"
          width={50}
          height={50}
        />
        <p className="w-[446px] text-[16px] font-normal leading-[1.5] text-text">
          Доступ к&nbsp;материалам после&nbsp;90&nbsp;дней
          исследования&nbsp;— 30&nbsp;дней, чтобы&nbsp;пересмотреть важное.
        </p>
      </div>

      {/* 299:37 — кадр 626×682; фото увеличено как в Figma (zoom + crop) */}
      <div className="pointer-events-none absolute left-[1054px] top-[9498px] z-[2] h-[682px] w-[626px] overflow-hidden">
        <img
          src={landingAssets.photos.telegramTall}
          alt="Telegram-чат исследования"
          className="absolute left-[-78.81%] top-[-55.72%] h-[207.33%] w-[258.15%] max-w-none"
        />
      </div>
    </>
  );
}
