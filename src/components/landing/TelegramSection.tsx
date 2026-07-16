import { landingAssets } from "@/lib/landing-assets";

/* Figma: Rectangle 35 (242,9596,1440x584) + фото (1054,9498,626x682) */
export function TelegramSection() {
  return (
    <>
      <div className="absolute left-[242px] top-[9596px] h-[584px] w-[1440px] rounded-[40px] bg-[image:var(--brand-gradient)]" />

      <h2 className="h-section absolute left-[302px] top-[9656px] w-[593px] !text-white">
        Исследование проходит в закрытом Telegram-чате
      </h2>

      <p className="absolute left-[302px] top-[9851px] w-[524px] whitespace-pre-wrap text-[16px] leading-[24px] text-white">
        {`Все уроки и материалы собраны в одном чате и сформированы по темам.

Смотрите наши уроки по расписанию и «подсматривайте» в удобное для себя время, задавайте вопросы.`}
      </p>

      <div className="absolute left-[302px] top-[10030px] flex h-[90px] w-[559px] items-center rounded-[20px] bg-white p-[20px] shadow-[0px_4px_21.5px_0px_rgba(0,0,0,0.09)]">
        <img
          src={landingAssets.icons.calendarGradientChip}
          alt=""
          className="size-[50px] shrink-0"
          width={50}
          height={50}
        />
        <p className="ml-[10px] w-[446px] text-[16px] leading-[24px] text-text">
          Доступ к материалам после 90 дней исследования — 30 дней, чтобы
          пересмотреть важное.
        </p>
      </div>

      <img
        src={landingAssets.photos.telegramTall}
        alt="Telegram-чат исследования"
        className="absolute left-[1054px] top-[9498px] h-[682px] w-[626px] object-contain object-bottom"
      />
    </>
  );
}
