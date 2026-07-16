import { landingAssets } from "@/lib/landing-assets";
import { outcomesChecklist } from "@/lib/landing-data";

/* Figma: y 7750..9596 — «Как будут выглядеть уроки» + «Что изменится за 90 дней» */
export function LessonsSection() {
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

      <div className="absolute left-[240px] top-[8853px] z-[2] w-[442px]">
        <h2 className="h-section whitespace-pre">
          {`Что\u00a0изменится за\u00a0эти\u00a090\u00a0дней?`}
        </h2>
        <p className="mt-[20px] w-[410px] text-[24px] font-medium leading-[1.2] text-text-dark">
          Вы&nbsp;начнёте замечать в&nbsp;своём танце то, что&nbsp;раньше
          оставалось незаметным.
        </p>
      </div>
      <p className="absolute left-[240px] top-[9100px] z-[2] w-[442px] text-[16px] font-normal leading-[1.5] text-text">
        То, что&nbsp;казалось случайным, станет в&nbsp;разы понятнее. То,
        что&nbsp;раньше требовало постоянного контроля и&nbsp;усилий,
        постепенно начнёт происходить естественнее.
      </p>

      <div className="absolute left-[727px] top-[8853px] z-[2] h-[563px] w-[466px] rounded-[30px] bg-light-gray">
        <p className="absolute left-[30px] top-[30px] w-[406px] text-[20px] font-medium leading-[29px] text-text-dark">
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

      <div className="absolute left-[1214px] top-[8853px] z-[2] h-[563px] w-[468px] rounded-[30px] bg-light-gray">
        <p className="absolute left-[30px] top-[30px] w-[408px] text-[20px] font-medium leading-[1.2] text-text-dark">
          Но&nbsp;главное изменение может оказаться совсем не&nbsp;там,
          где&nbsp;вы&nbsp;его ожидаете.
        </p>
        <p className="absolute left-[30px] top-[137px] w-[408px] text-[16px] font-normal leading-[1.5] text-text">
          Потому что&nbsp;это&nbsp;исследование&nbsp;— не&nbsp;про&nbsp;изучение
          новых фигур. Оно&nbsp;про&nbsp;то, как&nbsp;научиться видеть
          в&nbsp;уже&nbsp;знакомом танце гораздо больше, чем&nbsp;раньше.
        </p>
        <a
          href="#tariffs"
          className="btn-primary absolute left-[30px] top-[253px]"
        >
          Присоединиться
        </a>
      </div>

      <img
        src={landingAssets.photos.whatChanges}
        alt=""
        className="pointer-events-none absolute left-[1395px] top-[9130px] z-[3] h-[365px] w-[285px] object-contain"
      />
    </>
  );
}
