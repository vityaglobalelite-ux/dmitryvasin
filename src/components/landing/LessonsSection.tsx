import { landingAssets } from "@/lib/landing-assets";
import { outcomesChecklist } from "@/lib/landing-data";

/* Figma: y 7750..9596 — «Как будут выглядеть уроки» + «Что изменится за 90 дней» */
export function LessonsSection() {
  return (
    <>
      {/* dark background (0,7803,1920x925) */}
      <div className="absolute left-0 top-[7803px] h-[925px] w-[1920px] overflow-hidden bg-[#1a1a1a]">
        <img
          src={landingAssets.backgrounds.lessonsFull}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
      </div>

      <h2 className="h-section absolute left-[240px] top-[7837px] w-[444px] !text-white">
        Как будут выглядеть уроки
      </h2>

      {/* tall photo (386,7750,706x978) */}
      <img
        src={landingAssets.photos.lessonsTall}
        alt=""
        className="absolute left-[386px] top-[7750px] h-[978px] w-[706px] object-contain object-bottom"
      />

      {/* note with avatar (240,7997,386x100) */}
      <div className="absolute left-[240px] top-[7997px] flex w-[386px] items-start">
        <img
          src={landingAssets.photos.avatarDmitryQuote}
          alt=""
          className="size-[100px] rounded-full object-cover"
        />
        <p className="ml-[22px] mt-[4px] w-[264px] text-[14px] leading-[21px] text-white/90">
          Я совсем не шутил, когда говорил, что вы будете подсматривать
          за реальными индивидуальными уроками.
        </p>
      </div>

      {/* video thumb (240,8154,345x203) */}
      <img
        src={landingAssets.misc.videoLessonThumb}
        alt=""
        className="absolute left-[240px] top-[8154px] h-[203px] w-[345px] rounded-[20px] object-cover"
      />

      {/* right column */}
      <p className="absolute left-[1092px] top-[7955px] w-[386px] text-[20px] font-medium leading-[29px] text-white">
        На протяжении исследования рядом со мной будет Лиза.
      </p>
      <p className="absolute left-[1092px] top-[8041px] w-[588px] text-[16px] leading-[24px] text-white/80">
        С ней мы будем исследовать темы, задавать вопросы, проверять идеи
        и искать ответы. Это живой процесс исследования. С вопросами,
        наблюдениями, экспериментами и неожиданными открытиями. Многие из вас,
        практикующих танго на разном уровне, узнают себя в вопросах, сомнениях
        и открытиях Лизы. А преподаватели смогут заглянуть внутрь процесса
        обучения и увидеть, как рождаются объяснения, выстраивается логика
        урока и развивается тема шаг за шагом.
      </p>

      {/* invite card (1092,8369,588x269) */}
      <div className="absolute left-[1092px] top-[8369px] h-[269px] w-[588px] rounded-[30px] bg-white/10 backdrop-blur-sm">
        <p className="absolute left-[30px] top-[30px] w-[456px] text-[20px] font-medium leading-[29px] text-white">
          Обычно такие процессы остаются между преподавателем и учеником.
          Но в этот раз я решил открыть эту дверь и приглашаю вас внутрь
        </p>
        <a
          href="#tariffs"
          className="btn-primary absolute left-[30px] top-[179px]"
        >
          Присоединиться
        </a>
      </div>

      {/* Liza illustration (1470,8408,210x230) */}
      <img
        src={landingAssets.misc.lizaSide}
        alt=""
        className="pointer-events-none absolute left-[1470px] top-[8408px] h-[230px] w-[210px] object-contain"
      />

      {/* ===== Что изменится за эти 90 дней (белый блок) ===== */}
      <div className="absolute left-[240px] top-[8853px] w-[442px]">
        <h2 className="h-section">Что изменится за эти 90 дней?</h2>
        <p className="mt-[20px] w-[410px] text-[24px] font-medium leading-[29px] text-text-dark">
          Вы начнёте замечать в своём танце то, что раньше оставалось
          незаметным.
        </p>
      </div>
      <p className="absolute left-[240px] top-[9100px] w-[442px] text-[16px] leading-[24px] text-text opacity-80">
        То, что казалось случайным, станет в разы понятнее. То, что раньше
        требовало постоянного контроля и усилий, постепенно начнёт происходить
        естественнее.
      </p>

      {/* checklist card (727,8853,466x563) */}
      <div className="absolute left-[727px] top-[8853px] h-[563px] w-[466px] rounded-[30px] bg-light-gray">
        <p className="absolute left-[30px] top-[30px] w-[406px] text-[20px] font-semibold leading-[29px] text-text-dark">
          Вы наверняка обнаружите, что:
        </p>
        <ul className="absolute left-[30px] top-[79px] flex w-[406px] flex-col gap-[10px]">
          {outcomesChecklist.map((item) => (
            <li key={item} className="flex h-[48px] items-center gap-[10px]">
              <img
                src={landingAssets.icons.check}
                alt=""
                className="size-[18px] shrink-0"
              />
              <span className="w-[378px] text-[16px] leading-[24px] text-text">
                {item}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* right card (1214,8853,468x563) */}
      <div className="absolute left-[1214px] top-[8853px] h-[563px] w-[468px] rounded-[30px] bg-light-gray">
        <p className="absolute left-[30px] top-[30px] w-[408px] text-[20px] font-semibold leading-[29px] text-text-dark">
          Но главное изменение может оказаться совсем не там, где вы его
          ожидаете.
        </p>
        <p className="absolute left-[30px] top-[137px] w-[408px] text-[16px] leading-[24px] text-text">
          Потому что это исследование — не про изучение новых фигур. Оно про
          то, как научиться видеть в уже знакомом танце гораздо больше, чем
          раньше.
        </p>
        <a href="#tariffs" className="btn-primary absolute left-[30px] top-[253px]">
          Присоединиться
        </a>
      </div>

      {/* photo overlapping right card (1395,9130,285x365) */}
      <img
        src={landingAssets.photos.whatChanges}
        alt=""
        className="pointer-events-none absolute left-[1395px] top-[9130px] h-[365px] w-[285px] object-contain"
      />
    </>
  );
}
