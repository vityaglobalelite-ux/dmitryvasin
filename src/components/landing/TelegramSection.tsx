import { landingAssets } from "@/lib/landing-assets";

/* Figma: Rectangle 35 (242,9596,1440x584) + фото (1054,9498,626x682) */
export function TelegramSection() {
  return (
    <>
      <div className="absolute left-[242px] top-[9596px] h-[584px] w-[1440px] rounded-[40px] bg-light-gray" />

      <h2 className="h-section absolute left-[302px] top-[9656px] w-[593px]">
        Исследование проходит в закрытом Telegram-чате
      </h2>

      <p className="absolute left-[302px] top-[9851px] w-[524px] text-[20px] leading-[29px] text-text">
        Все уроки и материалы собраны в одном чате и сформированы по темам.
        Смотрите наши уроки по расписанию и «подсматривайте» в удобное для себя
        время, задавайте вопросы.
      </p>

      {/* info row (302,10030,559x90) */}
      <div className="absolute left-[302px] top-[10030px] flex h-[90px] w-[559px] items-center">
        <span className="grid size-[50px] shrink-0 place-items-center rounded-full bg-[image:var(--brand-gradient)]">
          <img src={landingAssets.icons.calendar} alt="" className="size-[24px]" />
        </span>
        <p className="ml-[10px] w-[446px] text-[16px] leading-[24px] text-text">
          Доступ к материалам после 90 дней исследования — 30 дней, чтобы
          пересмотреть важное.
        </p>
      </div>

      {/* phone photo (1054,9498,626x682) */}
      <img
        src={landingAssets.photos.telegramTall}
        alt="Telegram-чат исследования"
        className="absolute left-[1054px] top-[9498px] h-[682px] w-[626px] object-contain object-bottom"
      />
    </>
  );
}
