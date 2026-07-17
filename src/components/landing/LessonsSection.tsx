"use client";

import { landingAssets } from "@/lib/landing-assets";
import { outcomesChecklist } from "@/lib/landing-data";
import { useIsMobile } from "@/lib/landing-mode";

/* Figma Главная_360: lessons band ~8652–11229 */
function LessonsMobile() {
  return (
    <>
      {/* image 33 — 0,8652,360×1028 */}
      <div className="absolute left-0 top-[8652px] z-0 h-[1028px] w-[360px] overflow-hidden bg-white">
        <img
          src={landingAssets.backgrounds.lessonsFull}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white from-0% to-transparent to-[17.6%]" />
      </div>

      {/* 284:87 */}
      <h2 className="h-section-mobile absolute left-[20px] top-[8712px] z-[2] w-[310px]">
        Как будут выглядеть уроки
      </h2>

      {/* Frame 2390 */}
      <div className="absolute left-[20px] top-[8768px] z-[2] flex h-[80px] w-[298px] items-start gap-[10px]">
        <img
          src={landingAssets.photos.avatarDmitryQuote}
          alt=""
          className="mt-[5px] size-[70px] shrink-0 rounded-full object-cover"
          width={70}
          height={70}
        />
        <p className="w-[218px] text-[13px] font-normal leading-[1.5] text-text">
          Я&nbsp;совсем не&nbsp;шутил, когда говорил, что&nbsp;вы&nbsp;будете
          подсматривать за&nbsp;реальными индивидуальными уроками.
        </p>
      </div>

      {/* 286:100 */}
      <div className="absolute left-[20px] top-[8878px] z-[2] w-[320px]">
        <p className="text-[16px] font-medium leading-[1.2] text-text">
          На протяжении исследования рядом со мной будет Лиза.
        </p>
        <div className="mt-[20px] space-y-0 text-[13px] font-normal leading-[1.5] text-text">
          <p>
            С&nbsp;ней&nbsp;мы будем исследовать темы, задавать вопросы,
            проверять идеи и&nbsp;искать ответы. Это&nbsp;живой процесс
            исследования. С&nbsp;вопросами, наблюдениями, экспериментами
            и&nbsp;неожиданными открытиями. Многие из&nbsp;вас, практикующих
            танго на&nbsp;разном уровне, узнают себя в&nbsp;вопросах, сомнениях
            и&nbsp;открытиях Лизы. А&nbsp;преподаватели смогут заглянуть внутрь
            процесса обучения и&nbsp;увидеть, как&nbsp;рождаются объяснения,
            выстраивается логика урока и&nbsp;развивается тема шаг&nbsp;за&nbsp;шагом.
          </p>
        </div>
      </div>

      {/* Untitled-1 photo */}
      <img
        src={landingAssets.photos.lessonsTall}
        alt=""
        className="absolute left-[20px] top-[9236px] z-[2] h-[444px] w-[320px] rounded-[10px] object-cover"
      />

      {/* Frame 2389 — invite card */}
      <div className="absolute left-[20px] top-[9700px] z-[2] flex h-[176px] w-[320px] flex-col items-start gap-[20px] rounded-[10px] bg-white p-[15px] shadow-[0px_4px_21.5px_0px_rgba(0,0,0,0.09)]">
        <p className="w-[304px] text-[16px] font-medium leading-[1.2] text-text">
          Обычно такие процессы остаются между преподавателем
          и&nbsp;учеником. Но&nbsp;в&nbsp;этот&nbsp;раз&nbsp;я решил открыть
          эту&nbsp;дверь и&nbsp;приглашаю вас&nbsp;внутрь
        </p>
        <a href="#tariffs" className="btn-primary-mobile">
          Присоединиться
        </a>
      </div>

      {/* 286:102 — Что изменится */}
      <div className="absolute left-[20px] top-[9963px] z-[2] flex w-[320px] flex-col gap-[20px]">
        <h2 className="h-section-mobile w-[320px]">
          Что&nbsp;изменится за&nbsp;эти&nbsp;90&nbsp;дней?
        </h2>
        <p className="w-[320px] text-[16px] font-medium leading-[1.2] text-text">
          Вы&nbsp;начнёте замечать в&nbsp;своём танце то, что&nbsp;раньше
          оставалось незаметным.
        </p>
      </div>

      {/* 286:101 */}
      <div className="absolute left-[20px] top-[10113px] z-[2] w-[320px] text-[13px] font-normal leading-[1.5] text-text">
        <p>
          То, что&nbsp;казалось случайным, станет в&nbsp;разы понятнее. То,
          что&nbsp;раньше требовало постоянного контроля и&nbsp;усилий,
          постепенно начнёт происходить естественнее.
        </p>
      </div>

      {/* Frame 2454 — checklist */}
      <div className="absolute left-[20px] top-[10253px] z-[2] flex h-[509px] w-[320px] flex-col gap-[10px] rounded-[10px] bg-white p-[15px] shadow-[0px_4px_21.5px_0px_rgba(0,0,0,0.09)]">
        <p className="text-[16px] font-medium leading-[1.2] text-text">
          Вы&nbsp;наверняка обнаружите, что:
        </p>
        <ul className="flex flex-col gap-[10px]">
          {outcomesChecklist.map((item, i) => (
            <li key={i} className="flex items-start gap-[10px]">
              <img
                src={landingAssets.icons.check}
                alt=""
                className="mt-[11px] size-[18px] shrink-0"
                width={18}
                height={18}
              />
              <p className="flex-1 text-[13px] font-normal leading-[1.5] text-text">
                {item.parts.map((p, j) =>
                  p.bold ? (
                    <span key={j} className="font-semibold">
                      {p.t}
                    </span>
                  ) : (
                    <span key={j}>{p.t}</span>
                  ),
                )}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* Frame 2455 — gradient CTA */}
      <div
        className="absolute left-[20px] top-[10782px] z-[2] flex h-[447px] w-[320px] flex-col items-start gap-[20px] overflow-hidden rounded-[10px] p-[15px]"
        style={{
          backgroundImage:
            "linear-gradient(105.58deg, #db0c25 2.6%, #e04c29 36.63%, #efb991 105.73%)",
        }}
      >
        <div className="flex w-[290px] flex-col gap-[10px] text-white">
          <p className="text-[16px] font-medium leading-[1.2]">
            Но&nbsp;главное изменение может оказаться совсем не&nbsp;там,
            где&nbsp;вы&nbsp;его ожидаете.
          </p>
          <div className="text-[13px] font-normal leading-[1.5]">
            <p>
              Потому что&nbsp;это&nbsp;исследование&nbsp;— не&nbsp;про&nbsp;изучение
              новых фигур.
            </p>
            <p>
              Оно&nbsp;про&nbsp;то, как&nbsp;научиться видеть
              в&nbsp;уже&nbsp;знакомом танце гораздо больше, чем&nbsp;раньше.
            </p>
          </div>
        </div>
        <a href="#tariffs" className="btn-primary-mobile relative z-[2]">
          Присоединиться
        </a>
        {/* 286:161 photo crop */}
        <img
          src={landingAssets.photos.whatChanges}
          alt=""
          className="pointer-events-none absolute left-[102px] top-[272px] h-[185px] w-[218px] max-w-none object-contain"
        />
      </div>
    </>
  );
}

/* Figma: y 7750..9596 — «Как будут выглядеть уроки» + «Что изменится за 90 дней» */
function LessonsDesktop() {
  return (
    <>
      {/* 249:1396 image 33 — светлый фон + fade сверху */}
      <div className="absolute left-0 top-[7803px] z-0 h-[925px] w-[1920px] overflow-hidden bg-white">
        <img
          src={landingAssets.backgrounds.lessonsFull}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white from-0% to-transparent to-[17.6%]" />
      </div>

      {/* 249:1398 Лиза — без fade */}
      <div className="pointer-events-none absolute left-[386px] top-[7750px] z-[1] h-[978px] w-[706px] overflow-hidden">
        <img
          src={landingAssets.photos.lessonsTall}
          alt=""
          className="absolute left-[-1.86%] top-[2.82%] h-[107.51%] w-[103.16%] max-w-none"
        />
      </div>

      {/* 249:1434 — Medium 50 / #252525 / 2 строки */}
      <h2 className="h-section absolute left-[240px] top-[7837px] z-[2] w-[444px] whitespace-pre">
        {`Как будут
выглядеть уроки`}
      </h2>

      {/* 249:1575 — аватар + Regular 16 / #252525 */}
      <div className="absolute left-[240px] top-[7997px] z-[2] flex h-[100px] w-[386px] items-end gap-[22px]">
        <img
          src={landingAssets.photos.avatarDmitryQuote}
          alt=""
          className="size-[100px] shrink-0 rounded-full object-cover"
          width={100}
          height={100}
        />
        <p className="w-[264px] whitespace-pre text-[16px] font-normal leading-[1.5] text-text">
          {`Я совсем не шутил, когда
говорил, что вы будете
подсматривать за реальными
индивидуальными уроками.`}
        </p>
      </div>

      {/* 249:1994 */}
      <img
        src={landingAssets.misc.videoLessonThumb}
        alt=""
        className="absolute left-[240px] top-[8154px] z-[2] h-[203px] w-[345px] rounded-[20px] object-cover"
      />

      {/* 249:1578 — Medium 24 */}
      <p className="absolute left-[1092px] top-[7955px] z-[2] w-[386px] whitespace-pre text-[24px] font-medium leading-[1.2] text-text">
        {`На протяжении исследования
рядом со мной будет Лиза.`}
      </p>
      {/* 249:1559 — Regular 16, абзацы с пустой строкой */}
      <div className="absolute left-[1092px] top-[8041px] z-[2] w-[588px] space-y-[24px] text-[16px] font-normal leading-[1.5] text-text">
        <p>
          С&nbsp;ней&nbsp;мы будем исследовать темы, задавать вопросы,
          проверять идеи и&nbsp;искать ответы.
        </p>
        <p>
          Это&nbsp;живой процесс исследования. С&nbsp;вопросами,
          наблюдениями, экспериментами и&nbsp;неожиданными открытиями.
        </p>
        <p>
          Многие из&nbsp;вас, практикующих танго на&nbsp;разном уровне,
          узнают себя в&nbsp;вопросах, сомнениях и&nbsp;открытиях Лизы.
        </p>
        <p>
          А&nbsp;преподаватели смогут заглянуть внутрь процесса обучения
          и&nbsp;увидеть, как&nbsp;рождаются объяснения, выстраивается логика
          урока и&nbsp;развивается тема шаг&nbsp;за&nbsp;шагом.
        </p>
      </div>

      {/* 249:1563 Frame 2389 */}
      <div className="absolute left-[1092px] top-[8369px] z-[2] flex h-[269px] w-[588px] flex-col items-start gap-[33px] overflow-visible rounded-[20px] bg-white p-[30px] shadow-[0px_4px_21.5px_0px_rgba(0,0,0,0.09)]">
        <p className="w-[456px] whitespace-pre text-[24px] font-medium leading-[1.2] text-text">
          {`Обычно такие процессы остаются
между преподавателем и\u00a0учеником.
Но\u00a0в\u00a0этот\u00a0раз\u00a0я решил открыть
эту дверь и\u00a0приглашаю вас\u00a0внутрь`}
        </p>
        <a href="#tariffs" className="btn-primary">
          Присоединиться
        </a>
      </div>

      {/* 249:1995 — целый замок 210×230, без повторного кропа */}
      <img
        src={landingAssets.misc.padlock}
        alt=""
        className="pointer-events-none absolute left-[1470px] top-[8408px] z-[3] h-[230px] w-[210px] max-w-none"
      />

      {/* 249:1567 */}
      <div className="absolute left-[240px] top-[8853px] z-[2] flex w-[442px] flex-col gap-[20px]">
        <h2 className="h-section whitespace-pre">
          {`Что\u00a0изменится
за\u00a0эти\u00a090\u00a0дней?`}
        </h2>
        <p className="w-[410px] whitespace-pre text-[24px] font-medium leading-[1.2] text-text">
          {`Вы\u00a0начнёте замечать в\u00a0своём
танце то, что\u00a0раньше оставалось
незаметным.`}
        </p>
      </div>
      {/* 249:1560 */}
      <div className="absolute left-[240px] top-[9100px] z-[2] w-[442px] text-[16px] font-normal leading-[1.5] text-text">
        <p>То, что&nbsp;казалось случайным, станет в&nbsp;разы понятнее.</p>
        <p>
          То, что&nbsp;раньше требовало постоянного контроля и&nbsp;усилий,
          постепенно начнёт происходить естественнее.
        </p>
      </div>

      {/* 249:2068 — белая карточка + SemiBold акценты */}
      <div className="absolute left-[727px] top-[8853px] z-[2] flex h-[563px] w-[466px] flex-col gap-[20px] rounded-[20px] bg-white p-[30px] shadow-[0px_4px_21.5px_0px_rgba(0,0,0,0.09)]">
        <p className="text-[24px] font-medium leading-[1.2] text-text">
          Вы&nbsp;наверняка обнаружите, что:
        </p>
        <ul className="flex flex-col gap-[10px]">
          {outcomesChecklist.map((item, i) => (
            <li key={i} className="flex min-h-[48px] items-center gap-[10px]">
              <img
                src={landingAssets.icons.check}
                alt=""
                className="size-[18px] shrink-0"
                width={18}
                height={18}
              />
              <p className="flex-1 text-[16px] font-normal leading-[1.5] text-text">
                {item.parts.map((p, j) =>
                  p.bold ? (
                    <span key={j} className="font-semibold">
                      {p.t}
                    </span>
                  ) : (
                    <span key={j}>{p.t}</span>
                  ),
                )}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* 249:1570 — градиент 107.9° + белый текст */}
      <div
        className="absolute left-[1214px] top-[8853px] z-[2] flex h-[563px] w-[468px] flex-col items-start gap-[20px] overflow-hidden rounded-[20px] p-[30px]"
        style={{
          backgroundImage:
            "linear-gradient(107.94deg, #db0c25 2.6%, #e04c29 36.63%, #efb991 105.73%)",
        }}
      >
        <p className="w-[408px] whitespace-pre text-[24px] font-semibold leading-[1.2] text-white">
          {`Но\u00a0главное изменение может
оказаться совсем не\u00a0там,
где\u00a0вы\u00a0его ожидаете.`}
        </p>
        <div className="w-[408px] text-[16px] font-normal leading-[1.5] text-white">
          <p>
            Потому что&nbsp;это&nbsp;исследование&nbsp;— не&nbsp;про&nbsp;изучение
            новых фигур.
          </p>
          <p>
            Оно&nbsp;про&nbsp;то, как&nbsp;научиться видеть в&nbsp;уже&nbsp;знакомом
            танце гораздо больше, чем&nbsp;раньше.
          </p>
        </div>
        <a href="#tariffs" className="btn-primary">
          Присоединиться
        </a>
        {/* 249:2119 */}
        <img
          src={landingAssets.photos.whatChanges}
          alt=""
          className="pointer-events-none absolute left-[181px] top-[277px] h-[365px] w-[285px] max-w-none object-contain"
        />
      </div>
    </>
  );
}

export function LessonsSection() {
  const isMobile = useIsMobile();
  return isMobile ? <LessonsMobile /> : <LessonsDesktop />;
}
