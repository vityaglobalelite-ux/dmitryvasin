import { landingAssets } from "@/lib/landing-assets";

/* Figma page y: 900..2020 */
const Y = 900;

const bubbles = [
  { x: 1084, y: 1097, w: 464, h: 112, textW: 364, text: "Почему одно и то же движение сегодня получается легко, а завтра словно исчезает?" },
  { x: 1218, y: 1249, w: 464, h: 112, textW: 364, text: "Почему некоторые пары выглядят настолько естественно и свободно, хотя внешне делают совсем немного?" },
  { x: 862, y: 1401, w: 464, h: 136, textW: 364, text: "Почему с одним партнёром взаимодействие возникает почти сразу, а с другим приходится постоянно искать общий язык?" },
  { x: 1204, y: 1577, w: 464, h: 136, textW: 334, text: "Почему в знакомой музыке иногда открывается целый мир новых возможностей, а иногда всё снова сводится к привычным решениям?" },
];

export function NoticedSection() {
  return (
    <section
      id="about"
      className="absolute left-0 top-[900px] h-[1120px] w-[1920px] bg-[#1a1a1a]"
    >
      <img
        src={landingAssets.backgrounds.noticed}
        alt=""
        className="absolute inset-0 size-full object-cover"
      />
      {/* dance couple photo, left */}
      <img
        src={landingAssets.photos.dance}
        alt=""
        className="absolute left-[-76px] top-[152px] h-[940px] w-[1402px] object-contain"
      />

      <div className="absolute left-[240px] top-[77px] w-[783px]">
        <h2 className="h-section !text-white">Возможно, вы это замечали.</h2>
        <p className="mt-[20px] text-[20px] leading-[29px] text-white/80">
          Берёте уроки, посещаете практики и милонги, но некоторые вопросы
          продолжают возвращаться снова и снова…
        </p>
      </div>

      {/* decorative swirl */}
      <img
        src={landingAssets.misc.questionsSwirl}
        alt=""
        className="pointer-events-none absolute left-[926px] top-[271px] h-[639px] w-[686px]"
      />

      {bubbles.map((b) => (
        <div
          key={b.text}
          className="absolute flex items-center rounded-[100px] bg-white"
          style={{ left: b.x, top: b.y - Y, width: b.w, height: b.h }}
        >
          <span className="ml-[20px] grid size-[50px] shrink-0 place-items-center rounded-full bg-[image:var(--brand-gradient)]">
            <img
              src={landingAssets.icons.questionMark}
              alt=""
              className="size-[21px]"
            />
          </span>
          <p
            className="ml-[10px] text-[16px] leading-[24px] text-text"
            style={{ width: b.textW }}
          >
            {b.text}
          </p>
        </div>
      ))}

      {/* final bubble, gradient */}
      <div className="absolute left-[1003px] top-[903px] flex h-[127px] w-[472px] items-center rounded-[100px] bg-[image:var(--brand-gradient)]">
        <p className="mx-[20px] text-[24px] font-semibold leading-[29px] text-white">
          И почему чем больше узнаёте о танце, тем больше появляется новых
          вопросов?
        </p>
      </div>
    </section>
  );
}
