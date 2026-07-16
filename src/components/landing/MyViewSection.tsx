import { landingAssets } from "@/lib/landing-assets";
import { marqueeQuestions } from "@/lib/landing-data";

/* Figma: y 2902..4345 — «Мой взгляд на обучение» */
export function MyViewSection() {
  return (
    <>
      {/* gradient card (242,2953,1440×553) — без overflow-hidden, чтобы голова выходила сверху */}
      <div className="absolute left-[242px] top-[2953px] h-[553px] w-[1440px] rounded-[40px] bg-[image:var(--brand-gradient)]" />

      {/* 249:1431 — Involve Medium 50 / leading 1.1 / tracking -1.5 */}
      <h2 className="h-section absolute left-[284px] top-[3009px] z-[2] w-[1007px] !text-white">
        Мой взгляд на обучение
      </h2>
      {/* 249:1502 — Medium 24 / leading 1.2 / w644 → 3 строки */}
      <p className="absolute left-[284px] top-[3081px] z-[2] w-[644px] whitespace-pre text-[24px] font-medium leading-[1.2] text-white">
        {`Этот исследовательский метод появился благодаря
тысячам часов, проведённых в студиях, на уроках,
репетициях, выступлениях и соревнованиях.`}
      </p>
      {/* 249:1500 — Regular 16 / leading 1.5 / два абзаца */}
      <div className="absolute left-[284px] top-[3206px] z-[2] w-[521px] text-[16px] font-normal leading-[1.5] text-white">
        <p>Но больше всего на него повлияли люди.</p>
        <p>Их вопросы. Открытия. Трудности. Неожиданные инсайты.</p>
      </div>

      {/* Frame 2422 + 249:1955 — Regular 16 / #252525 / 3 строки в 368 */}
      <div className="absolute left-[284px] top-[3353px] z-[3] flex h-[112px] w-[488px] items-center overflow-hidden rounded-[20px] bg-white py-[20px] pl-[100px] pr-[20px] shadow-[0px_4px_21.5px_0px_rgba(0,0,0,0.09)]">
        <img
          src={landingAssets.misc.lightbulb}
          alt=""
          className="absolute left-0 top-0 h-[112px] w-[83px] object-contain object-left"
        />
        <p className="w-[368px] whitespace-pre text-[16px] font-normal leading-[1.5] text-text">
          {`За 25+ лет моей практики многие из этих
наблюдений постепенно сложились в идеи,
которыми мне захотелось поделиться.`}
        </p>
      </div>

      {/* Dmitry 4 (1023,2902,611×604): +51px выше карточки, низ совпадает с низом карточки */}
      <img
        src={landingAssets.photos.myView}
        alt="Дмитрий Васин"
        className="pointer-events-none absolute left-[1023px] top-[2902px] z-[2] h-[604px] w-[611px] object-contain object-bottom"
      />

      {/* Group 2324 — фокус-рамка с танцорами */}
      <img
        src={landingAssets.misc.stickerGroup}
        alt=""
        className="absolute left-[234px] top-[3596px] z-[2] h-[104px] w-[94px] object-contain"
      />
      {/* Involve Medium 50 / w 618 */}
      <h2 className="h-section absolute left-[355px] top-[3596px] z-[2] w-[618px] whitespace-pre-line">
        {`Одна из\u00a0таких вещей\u00a0—
перегрузка вниманием.`}
      </h2>
      <p className="absolute left-[240px] top-[3724px] z-[2] whitespace-pre text-[24px] font-medium leading-[1.2] text-text">
        {`Во\u00a0время танца мы\u00a0одновременно пытаемся следить за\u00a0множеством
вещей. Внимание «распыляется» и\u00a0важные детали ускользают.`}
      </p>

      <div className="absolute left-0 top-[3822px] z-[2] flex h-[75px] w-[1920px] items-center overflow-hidden bg-[image:var(--brand-gradient)]">
        <div className="marquee-track">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center">
              {marqueeQuestions.map((q) => (
                <span
                  key={`${copy}-${q}`}
                  className="mr-[60px] whitespace-nowrap text-[20px] font-medium leading-[29px] text-white"
                >
                  {q}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <img
        src={landingAssets.misc.arrowScribble}
        alt=""
        className="pointer-events-none absolute left-[427px] top-[4147px] z-[2] h-[287px] w-[421px]"
      />

      <div className="absolute left-[848px] top-[4077px] z-[2] h-[268px] w-[832px] rounded-[30px] bg-light-gray">
        <p className="absolute left-[30px] top-[30px] w-[772px] text-[16px] leading-[24px] text-text">
          Поэтому со временем я всё чаще стал уходить от попыток улучшать всё
          одновременно и начал исследовать отдельные аспекты танца. Этот подход
          лёг в основу исследования, ведь большинство вопросов, с которыми
          сталкиваются танцоры, снова и снова возвращаются к одним и тем же
          темам.
        </p>
        <div className="absolute left-[30px] top-[178px] flex w-[740px] items-center justify-between">
          <p className="w-[460px] text-[20px] font-medium leading-[29px] text-text-dark">
            Давайте посмотрим на танец через 5 направлений исследования.
          </p>
          {/* Group 2323 — целый ряд 252×60 как в Figma */}
          <img
            src={landingAssets.icons.directionsRow}
            alt=""
            className="h-[60px] w-[252px] shrink-0 object-contain"
            width={252}
            height={60}
          />
        </div>
      </div>
    </>
  );
}
