"use client";

import { landingAssets } from "@/lib/landing-assets";
import { useIsMobile } from "@/lib/landing-mode";

/* Figma Главная_360: Rect35 11349 + text 11364 + photo 11752 */
function TelegramMobile() {
  return (
    <>
      {/* Rectangle 35 — 20,11349,320×796 */}
      <div className="absolute left-[20px] top-[11349px] h-[796px] w-[320px] overflow-hidden rounded-[10px] bg-[image:var(--brand-gradient)]" />

      {/* 287:735 — Frame 2131331415 */}
      <div className="absolute left-[35px] top-[11364px] z-[2] flex w-[290px] flex-col gap-[40px]">
        <div className="flex w-full flex-col gap-[20px] text-white">
          <h2 className="h-section-mobile w-[290px] !text-white">
            Исследование проходит в&nbsp;закрытом Telegram-чате
          </h2>
          <div className="w-[269px] text-[13px] font-normal leading-[1.5]">
            <p>
              Все&nbsp;уроки и&nbsp;материалы собраны в&nbsp;одном чате
              и&nbsp;сформированы по&nbsp;темам.
            </p>
            <p className="mt-0">&nbsp;</p>
            <p>
              Смотрите наши уроки по&nbsp;расписанию и&nbsp;«подсматривайте»
              в&nbsp;удобное для&nbsp;себя время, задавайте вопросы.
            </p>
          </div>
        </div>

        {/* Frame 2418 — access chip, relative y=278 inside text frame */}
        <div className="flex h-[110px] w-[290px] items-center gap-[10px] rounded-[10px] bg-white p-[15px] shadow-[0px_4px_21.5px_0px_rgba(0,0,0,0.09)]">
          <img
            src={landingAssets.icons.calendarTelegramMobile}
            alt=""
            className="size-[35px] shrink-0"
            width={35}
            height={35}
          />
          <p className="flex-1 text-[13px] font-normal leading-[1.5] text-text">
            Доступ к&nbsp;материалам после&nbsp;90&nbsp;дней
            исследования&nbsp;— 30&nbsp;дней, чтобы&nbsp;пересмотреть важное.
          </p>
        </div>
      </div>

      {/* Untitled-1 5 — -20,11752,360×392 */}
      <div className="pointer-events-none absolute left-[-20px] top-[11752px] z-[2] h-[392px] w-[360px] overflow-hidden">
        <img
          src={landingAssets.photos.telegramTall}
          alt="Telegram-чат исследования"
          className="absolute left-[-78.81%] top-[-55.72%] h-[207.33%] w-[258.15%] max-w-none"
        />
      </div>
    </>
  );
}

/* Figma: Rectangle 35 (242,9596,1440×584) + фото (1054,9498,626×682) */
function TelegramDesktop() {
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

export function TelegramSection() {
  const isMobile = useIsMobile();
  return isMobile ? <TelegramMobile /> : <TelegramDesktop />;
}
