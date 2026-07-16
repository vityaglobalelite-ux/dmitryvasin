import { landingAssets } from "@/lib/landing-assets";

/* Figma: Frame 2421 (240,2110,1442x663) */
export function QuoteVideoSection() {
  return (
    <section className="absolute left-[240px] top-[2110px] h-[663px] w-[1442px] rounded-[40px] bg-light-gray">
      {/* left column (60,60,560x534) */}
      <div className="absolute left-[60px] top-[60px] h-[534px] w-[560px] rounded-[30px] bg-white">
        <img
          src={landingAssets.photos.quoteAvatar}
          alt="Дмитрий Васин"
          className="absolute left-[30px] top-[30px] size-[126px] rounded-full object-cover"
        />
        <div className="absolute left-[30px] top-[200px] w-[500px]">
          <p className="text-[24px] font-semibold leading-[29px] text-text-dark">
            Иногда одно новое наблюдение меняет танец сильнее, чем десятки
            новых движений.
          </p>
          <p className="mt-[20px] text-[16px] leading-[24px] text-text opacity-80">
            Потому что многие ответы появляются не тогда, когда мы узнаём
            больше. А тогда, когда начинаем смотреть на танец внимательнее.
          </p>
        </div>
        <img
          src={landingAssets.quote.marks}
          alt=""
          className="absolute left-[30px] top-[423px] h-[35px] w-[35px]"
        />
      </div>

      {/* right column (640,60,742x543) */}
      <div className="absolute left-[640px] top-[60px] w-[742px]">
        <div className="relative h-[435px] w-[742px] overflow-hidden rounded-[30px] bg-[#1a1a1a]">
          <img
            src={landingAssets.photos.videoPreview}
            alt=""
            className="absolute inset-0 size-full object-cover"
          />
          <button
            type="button"
            aria-label="Смотреть видео"
            className="absolute left-1/2 top-1/2 grid size-[71px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 transition hover:bg-white"
          >
            <img
              src={landingAssets.video.playButton}
              alt=""
              className="ml-[3px] size-[18px]"
            />
          </button>
        </div>
        <p className="mt-[20px] text-[30px] font-medium leading-[44px] tracking-[-0.5px] text-text-dark">
          В этом коротком видео рассказываю, как именно будем исследовать танго
        </p>
      </div>
    </section>
  );
}
