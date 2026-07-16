import { landingAssets } from "@/lib/landing-assets";
import { marqueeQuestions, skills } from "@/lib/landing-data";

/* Figma: y 2902..4345 — «Мой взгляд на обучение», перегрузка вниманием, бегущая строка */
export function MyViewSection() {
  return (
    <>
      {/* gradient card (242,2953,1440x553) */}
      <div className="absolute left-[242px] top-[2953px] h-[553px] w-[1440px] rounded-[40px] bg-[image:var(--brand-gradient)]" />

      <h2 className="h-section absolute left-[284px] top-[3009px] w-[1007px] !text-white">
        Мой взгляд на обучение
      </h2>
      <p className="absolute left-[284px] top-[3081px] w-[644px] text-[24px] font-medium leading-[1.2] text-white">
        Этот исследовательский метод появился благодаря тысячам часов,
        проведённых в студиях, на уроках, репетициях, выступлениях и
        соревнованиях.
      </p>
      <p className="absolute left-[284px] top-[3206px] w-[521px] text-[16px] leading-[24px] text-white">
        Но больше всего на него повлияли люди. Их вопросы. Открытия. Трудности.
        Неожиданные инсайты.
      </p>

      {/* idea note white bubble (284,3353) */}
      <div className="absolute left-[284px] top-[3353px] flex h-[112px] w-[488px] items-center rounded-[20px] bg-white py-[20px] pl-[100px] pr-[20px] shadow-[0px_4px_21.5px_0px_rgba(0,0,0,0.09)]">
        <img
          src={landingAssets.misc.lightbulb}
          alt=""
          className="absolute left-[17px] top-0 h-[112px] w-[83px] object-contain"
        />
        <p className="w-[368px] text-[16px] leading-[24px] text-text">
          За 25+ лет моей практики многие из этих наблюдений постепенно
          сложились в идеи, которыми мне захотелось поделиться.
        </p>
      </div>

      <img
        src={landingAssets.photos.myView}
        alt="Дмитрий Васин"
        className="absolute left-[1023px] top-[2902px] h-[604px] w-[611px] object-contain"
      />

      <img
        src={landingAssets.misc.stickerGroup}
        alt=""
        className="absolute left-[234px] top-[3596px] h-[104px] w-[94px] object-contain"
      />
      <h2 className="h-section absolute left-[355px] top-[3596px] w-[618px]">
        Одна из таких вещей — перегрузка вниманием.
      </h2>
      <p className="absolute left-[240px] top-[3724px] w-[882px] text-[20px] leading-[29px] text-text">
        Во время танца мы одновременно пытаемся следить за множеством вещей.
        Внимание «распыляется» и важные детали ускользают.
      </p>

      <div className="absolute left-0 top-[3822px] flex h-[75px] w-[1920px] items-center overflow-hidden bg-[image:var(--brand-gradient)]">
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
        className="pointer-events-none absolute left-[427px] top-[4147px] h-[287px] w-[421px]"
      />

      <div className="absolute left-[848px] top-[4077px] h-[268px] w-[832px] rounded-[30px] bg-light-gray">
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
          <div className="flex">
            {skills.map((s, i) => (
              <span
                key={s.key}
                className="grid size-[60px] place-items-center rounded-full bg-[image:var(--brand-gradient)] ring-2 ring-white"
                style={{ marginLeft: i === 0 ? 0 : -12 }}
              >
                <img src={s.icon} alt={s.label} className="size-[28px]" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
