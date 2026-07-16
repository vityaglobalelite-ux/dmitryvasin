import { landingAssets } from "@/lib/landing-assets";

/* Figma: image 32 + Group 2339 — светлая секция y 900..2020 */

const Y = 900;

const bubbles = [
  {
    x: 1084,
    y: 1097,
    w: 464,
    h: 112,
    iconX: 20,
    text: "Почему одно и то же движение сегодня получается легко, а завтра словно исчезает?",
  },
  {
    x: 1218,
    y: 1249,
    w: 464,
    h: 112,
    iconX: 20,
    text: "Почему некоторые пары выглядят настолько естественно и свободно, хотя внешне делают совсем немного?",
  },
  {
    x: 862,
    y: 1401,
    w: 464,
    h: 136,
    iconX: 20,
    text: "Почему с одним партнёром взаимодействие возникает почти сразу, а с другим приходится постоянно искать общий язык?",
  },
  {
    x: 1204,
    y: 1577,
    w: 464,
    h: 136,
    iconX: 35,
    text: "Почему в знакомой музыке иногда открывается целый мир новых возможностей, а иногда всё снова сводится к привычным решениям?",
  },
];

function QuestionChip() {
  return (
    <span className="relative size-[50px] shrink-0 overflow-hidden">
      <img
        src={landingAssets.icons.questionCircleBg}
        alt=""
        className="absolute inset-0 size-full"
        width={50}
        height={50}
      />
      <img
        src={landingAssets.icons.questionMark}
        alt=""
        className="absolute left-[15px] top-[15px] size-[21px]"
        width={21}
        height={21}
      />
    </span>
  );
}

export function NoticedSection() {
  return (
    <section
      id="about"
      className="absolute left-0 top-[900px] h-[1120px] w-[1920px] overflow-hidden bg-[#f6f6f6]"
    >
      {/* Group 2339: фон+fade (303:54), поверх cutout женщины без забеливания (303:55) */}
      <div className="pointer-events-none absolute left-[-76px] top-[152px] z-0 h-[940px] w-[1402px] -scale-x-100">
        <img
          src={landingAssets.photos.dance}
          alt=""
          className="absolute inset-0 size-full object-cover object-center"
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(90deg, #f6f6f6 6.5457%, rgba(246,246,246,0) 40.931%), linear-gradient(180deg, #f6f6f6 0%, rgba(246,246,246,0) 51.415%)",
          }}
        />
        <img
          src={landingAssets.photos.danceCutout}
          alt=""
          className="absolute inset-0 size-full object-cover object-center"
        />
      </div>

      <div className="absolute left-[240px] top-[77px] z-20 w-[783px]">
        <h2 className="h-section">Возможно, вы это замечали.</h2>
        <p className="mt-[20px] text-[20px] leading-[29px] text-text">
          Берёте уроки, посещаете практики и милонги, но некоторые вопросы
          продолжают возвращаться снова и снова…
        </p>
      </div>

      {/* dashed path Vector 508 (926,1171 → rel 271) */}
      <img
        src={landingAssets.misc.questionsSwirl}
        alt=""
        className="pointer-events-none absolute left-[926px] top-[271px] z-[5] h-[639px] w-[686px]"
      />

      {bubbles.map((b) => (
        <div
          key={b.text}
          className="absolute z-10 flex items-center gap-[10px] rounded-[20px] bg-white shadow-[0px_4px_21.5px_0px_rgba(0,0,0,0.09)]"
          style={{
            left: b.x,
            top: b.y - Y,
            width: b.w,
            height: b.h,
            paddingLeft: b.iconX,
            paddingRight: 20,
          }}
        >
          <QuestionChip />
          <p className="min-w-0 flex-1 text-[16px] leading-[1.5] text-text">
            {b.text}
          </p>
        </div>
      ))}

      <div className="absolute left-[1003px] top-[903px] z-10 flex h-[127px] w-[472px] items-center justify-center rounded-[20px] bg-[image:var(--brand-gradient)] p-[20px]">
        <p className="text-center text-[24px] font-medium leading-[1.2] text-white">
          И почему чем больше узнаёте о танце, тем больше появляется новых
          вопросов?
        </p>
      </div>
    </section>
  );
}
