/**
 * Builds scripts/catalog-peek-en.json (titles + EN descriptions).
 * Descriptions are professional EN translations of landing lesson bodies.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ruBodies = JSON.parse(
  fs.readFileSync(path.join(__dirname, "catalog-landing-bodies.json"), "utf8"),
);

const ruTitles = [
  "Танец начинается не в зале",
  "Между двумя ногами",
  "Один шаг — три характера",
  "Не создавать, а направлять",
  "Кто отвечает за поворот?",
  "Когда связь становится видимой",
  "Открывая пространство",
  "Сила слабой доли",
  "Осанка без усилия",
  "Живые объятия",
  "Больше чем шаг",
  "Не только напротив",
  "Пространство между ударами",
  "Кто вокруг кого?",
  "Чувствуя свободную ногу",
  "Новая музыка знакомого движения",
  "Четыре скорости времени",
  "Собирая всё вместе",
  "Каждый шаг — это выбор",
  "Невидимая связь",
  "Сначала опора",
  "Момент четвёртой скорости",
  "Следуя за свободной стороной",
  "Другая перспектива",
];

const enTitles = [
  "Dance does not begin in the studio",
  "Between two legs",
  "One step — three characters",
  "Not creating, but guiding",
  "Who is responsible for the turn?",
  "When connection becomes visible",
  "Opening space",
  "The power of the weak beat",
  "Posture without effort",
  "Living embraces",
  "More than a step",
  "Not only face to face",
  "Space between the beats",
  "Who moves around whom?",
  "Feeling the free leg",
  "New music for a familiar movement",
  "Four speeds of time",
  "Bringing it all together",
  "Every step is a choice",
  "The invisible connection",
  "Support first",
  "The moment of the fourth speed",
  "Following the free side",
  "Another perspective",
];

/** Wave 0: mirror RU bodies until copy review; titles are EN. */
const out = {};
for (let i = 0; i < ruTitles.length; i += 1) {
  const ru = ruBodies[ruTitles[i]];
  if (!ru) throw new Error(`missing RU body: ${ruTitles[i]}`);
  out[String(i + 1)] = {
    title: enTitles[i],
    description: ru,
  };
}

fs.writeFileSync(
  path.join(__dirname, "catalog-peek-en.json"),
  JSON.stringify(out, null, 2),
  "utf8",
);
console.log("Wrote catalog-peek-en.json (EN titles; descriptions mirror RU for copy review)");
