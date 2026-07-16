import { landingAssets } from "@/lib/landing-assets";

/* Figma: Frame 2421 (240,2110,1442x663) */
export function QuoteVideoSection() {
  return (
    <section className="absolute left-[240px] top-[2110px] flex h-[663px] w-[1442px] gap-[20px] rounded-[40px] bg-light-gray p-[60px]">
      {/* left quote card */}
      <div className="relative h-[534px] w-[560px] shrink-0 rounded-[20px] bg-white p-[30px]">
        <img
          src={landingAssets.photos.quoteAvatar}
          alt="Дмитрий Васин"
          className="size-[126px] rounded-full object-cover"
        />
        <div className="mt-[44px] w-full">
          <p className="text-[24px] font-medium leading-[1.2] text-text">
            Иногда одно новое наблюдение меняет танец сильнее, чем десятки
            новых движений.
          </p>
          <p className="mt-[20px] text-[16px] font-normal leading-[1.5] text-text">
            Потому что многие ответы появляются не тогда, когда мы узнаём
            больше. А тогда, когда начинаем смотреть на танец внимательнее.
          </p>
        </div>
        <img
          src={landingAssets.quote.marks}
          alt=""
          className="absolute bottom-[30px] left-[30px] size-[35px]"
        />
      </div>

      {/* right video column */}
      <div className="flex min-w-0 flex-1 flex-col gap-[20px]">
        <div className="relative h-[435px] w-full overflow-hidden rounded-[30px] bg-[#d9d9d9]">
          <img
            src={landingAssets.photos.videoPreview}
            alt=""
            className="absolute inset-0 size-full object-cover"
          />
          <button
            type="button"
            aria-label="Смотреть видео"
            className="absolute left-1/2 top-1/2 size-[71px] -translate-x-1/2 -translate-y-1/2 transition hover:brightness-110"
          >
            <img
              src={landingAssets.video.playButton}
              alt=""
              className="size-full"
            />
          </button>
        </div>
        <p className="text-center text-[40px] font-medium leading-[1.1] tracking-[-1.2px] text-text">
          В этом коротком видео рассказываю, как именно будем исследовать танго
        </p>
      </div>
    </section>
  );
}
