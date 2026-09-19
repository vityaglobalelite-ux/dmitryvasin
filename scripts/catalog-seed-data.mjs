import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const landingBodies = JSON.parse(
  fs.readFileSync(path.join(__dirname, "catalog-landing-bodies.json"), "utf8"),
);
const peekEn = JSON.parse(
  fs.readFileSync(path.join(__dirname, "catalog-peek-en.json"), "utf8"),
);

export const DEPRECATED_PRODUCT_PREFIX = "c0a7a109-";

export const IDS = {
  postureFull: "d0230001-0001-4000-8000-000000000001",
  postureBlock1: "d0230001-0002-4000-8000-000000000002",
  postureBlock2: "d0230001-0003-4000-8000-000000000003",
  course2: "d0230001-0004-4000-8000-000000000004",
};

export function peekId(n) {
  const suffix = n.toString(16).padStart(12, "0");
  return `d0230001-1001-4000-8000-${suffix}`;
}

function mskDay(isoDate) {
  return `${isoDate}T00:00:00+03:00`;
}

function firstSentence(text) {
  const m = text.match(/^[^.!?]+[.!?]/);
  return m ? m[0].trim() : text.slice(0, 160);
}

/** Peeks 1–6: Mon/Thu TZ before Figma lock schedule (lesson 4 = 2026-08-31). Figma wins from 7. */
const PEEK_AVAILABLE = {
  1: "2026-08-20",
  2: "2026-08-24",
  3: "2026-08-27",
  4: "2026-08-31",
  5: "2026-09-03",
  6: "2026-09-07",
  7: "2026-09-14",
  8: "2026-09-17",
  9: "2026-09-21",
  10: "2026-09-24",
  11: "2026-09-28",
  12: "2026-10-01",
  13: "2026-10-05",
  14: "2026-10-08",
  15: "2026-10-12",
  16: "2026-10-15",
  17: "2026-10-19",
  18: "2026-10-22",
  19: "2026-10-26",
  20: "2026-10-29",
  21: "2026-11-02",
  22: "2026-11-05",
  23: "2026-11-09",
  /** Lesson 24: no Figma lock label; Mon/Thu cadence after 23 (9 Nov). */
  24: "2026-11-12",
};

const PEEK_META = [
  { title: "Танец начинается не в зале", skills: ["awareness"] },
  { title: "Между двумя ногами", skills: ["variability", "technique"] },
  { title: "Один шаг — три характера", skills: ["technique"] },
  { title: "Не создавать, а направлять", skills: ["interaction", "musicality"] },
  { title: "Кто отвечает за поворот?", skills: ["interaction"] },
  { title: "Когда связь становится видимой", skills: ["interaction"] },
  { title: "Открывая пространство", skills: ["interaction"] },
  { title: "Сила слабой доли", skills: ["awareness", "musicality"] },
  { title: "Осанка без усилия", skills: ["awareness", "technique"] },
  { title: "Живые объятия", skills: ["interaction"] },
  { title: "Больше чем шаг", skills: ["musicality"] },
  {
    title: "Не только напротив",
    skills: ["interaction", "technique", "variability"],
  },
  { title: "Пространство между ударами", skills: ["musicality"] },
  { title: "Кто вокруг кого?", skills: ["variability"] },
  { title: "Чувствуя свободную ногу", skills: ["interaction"] },
  { title: "Новая музыка знакомого движения", skills: ["musicality", "variability"] },
  { title: "Четыре скорости времени", skills: ["awareness", "technique"] },
  { title: "Собирая всё вместе", skills: ["interaction"] },
  { title: "Каждый шаг — это выбор", skills: ["interaction", "technique"] },
  { title: "Невидимая связь", skills: ["interaction", "variability"] },
  { title: "Сначала опора", skills: ["musicality"] },
  { title: "Момент четвёртой скорости", skills: ["technique", "interaction"] },
  { title: "Следуя за свободной стороной", skills: ["musicality", "interaction"] },
  { title: "Другая перспектива", skills: ["awareness", "technique"] },
];

function peekCovers(n) {
  if (n >= 1 && n <= 9) {
    return [1, 2, 3].map(
      (frame) =>
        `/assets/site/catalog/covers/peek-${String(n).padStart(2, "0")}-${frame}.webp`,
    );
  }
  return [];
}

export function buildPeekProducts() {
  return PEEK_META.map((meta, index) => {
    const n = index + 1;
    const ruBody = landingBodies[meta.title];
    if (!ruBody) {
      throw new Error(`Missing landing body for peek title: ${meta.title}`);
    }
    const en = peekEn[String(n)];
    if (!en?.title || !en?.description) {
      throw new Error(`Missing EN copy for peek ${n}`);
    }
    const coverUrls = peekCovers(n);
    return {
      id: peekId(n),
      type: "peek",
      price_minor: 400000,
      currency: "rub",
      access_days: 180,
      cover_url: coverUrls[0] ?? "",
      duration_sec: 45 * 60,
      level: "2",
      skills: meta.skills,
      lesson_count: null,
      sort_index: n,
      available_at: mskDay(PEEK_AVAILABLE[n]),
      cover_urls: coverUrls,
      i18n: {
        ru: {
          title: meta.title,
          short: firstSentence(ruBody),
          description: ruBody,
        },
        en: {
          title: en.title,
          short: firstSentence(en.description),
          description: en.description,
        },
      },
    };
  });
}

const GIF = "/assets/site/catalog/gifs/posture";

const POSTURE_BALL_COVERS = [
  `${GIF}/block1/01.webp`,
  `${GIF}/block1/02.webp`,
  `${GIF}/block1/03.webp`,
  `${GIF}/block1/03-1.webp`,
  `${GIF}/block1/03-11.webp`,
  `${GIF}/block1/04.webp`,
  `${GIF}/block1/05.webp`,
];
const POSTURE_BAND_COVERS = [
  `${GIF}/block2/01.webp`,
  `${GIF}/block2/02.webp`,
  `${GIF}/block2/03.webp`,
  `${GIF}/block2/04.webp`,
];
/** Full posture course: balls first, then resistance bands. */
const POSTURE_COVERS = [...POSTURE_BALL_COVERS, ...POSTURE_BAND_COVERS];
const COURSE_2_COVERS = [1, 2, 3].map(
  (n) => `/assets/site/catalog/covers/course-2-${n}.webp`,
);

export function postureProgramRows(productId, blocks) {
  const rows = [];
  for (const block of blocks) {
    for (const [sort, text] of block.outcomes) {
      rows.push({
        product_id: productId,
        block_key: block.key,
        sort,
        kind: "outcome",
        gif_urls: [],
        i18n: { ru: text.ru, en: text.en },
      });
    }
    for (const lesson of block.lessons) {
      rows.push({
        product_id: productId,
        block_key: block.key,
        sort: lesson.sort,
        kind: "lesson",
        gif_urls: lesson.gifUrls,
        i18n: { ru: lesson.ru, en: lesson.en },
      });
    }
  }
  return rows;
}

const BLOCK1 = {
  key: "block1",
  outcomes: [
    [
      0,
      {
        ru: "Будете выравнивать свое тело без напряжения.",
        en: "You will align your body without tension.",
      },
    ],
    [
      1,
      {
        ru: "Почувствуете лучше границы своего тела.",
        en: "You will feel the boundaries of your body more clearly.",
      },
    ],
    [
      2,
      {
        ru: "Перестанете проваливаться в бедра.",
        en: "You will stop collapsing into your hips.",
      },
    ],
    [
      3,
      {
        ru: "Почувствуете, как все тело слаженно работает.",
        en: "You will feel how the whole body works in harmony.",
      },
    ],
  ],
  lessons: [
    {
      sort: 0,
      gifUrls: [`${GIF}/block1/01.webp`],
      ru: "Выравниваем осанку в момент движения вперёд, назад и в сторону.",
      en: "Aligning posture while moving forward, backward, and sideways.",
    },
    {
      sort: 1,
      gifUrls: [`${GIF}/block1/02.webp`],
      ru: "Детальный разбор скручивания в движении вперёд и назад.",
      en: "A detailed look at spiraling in forward and backward movement.",
    },
    {
      sort: 2,
      gifUrls: [
        `${GIF}/block1/03.webp`,
        `${GIF}/block1/03-1.webp`,
        `${GIF}/block1/03-11.webp`,
      ],
      ru: "Как перестать падать в момент вращения тела в пространстве.",
      en: "How to stop collapsing while rotating the body in space.",
    },
    {
      sort: 3,
      gifUrls: [`${GIF}/block1/04.webp`],
      ru: "Пивот, очо, хиро, и всё это с контролем и без потери баланса.",
      en: "Pivot, ocho, hero — with control and without losing balance.",
    },
    {
      sort: 4,
      gifUrls: [`${GIF}/block1/05.webp`],
      ru: "Работаем в позициях рук для партнерши и партнера.",
      en: "Working in arm positions for leaders and followers.",
    },
  ],
};

const BLOCK2 = {
  key: "block2",
  outcomes: [
    [
      0,
      {
        ru:
          "Почувствуете, как перекат стопы влияет на мягкий и стабильный переход веса и на качество шага в паре.",
        en:
          "You will feel how rolling through the foot affects a soft, stable weight transfer and the quality of your step in the couple.",
      },
    ],
    [
      1,
      {
        ru: "Поговорим о важности координации работы рук и ног.",
        en: "We will talk about coordinating the work of arms and legs.",
      },
    ],
    [
      2,
      {
        ru: "Начнете эффективнее использовать своё тело.",
        en: "You will start using your body more efficiently.",
      },
    ],
  ],
  lessons: [
    {
      sort: 0,
      gifUrls: [`${GIF}/block2/01.webp`],
      ru:
        "Как добиться легкого и естественного шага? Разбираем перекат стопы и перенос веса.",
      en:
        "How do you find a light, natural step? We break down foot roll and weight transfer.",
    },
    {
      sort: 1,
      gifUrls: [`${GIF}/block2/02.webp`],
      ru: "Скручивания и координация работы ног.",
      en: "Spirals and coordinating the legs.",
    },
    {
      sort: 2,
      gifUrls: [`${GIF}/block2/03.webp`],
      ru: "Пивот, очо и хиро.",
      en: "Pivot, ocho, and hero.",
    },
    {
      sort: 3,
      gifUrls: [`${GIF}/block2/04.webp`],
      ru: "Как убрать давление руками в паре? Ищем опору и ясность без зажима.",
      en: "How to remove arm pressure in the couple? Finding support and clarity without gripping.",
    },
  ],
};

const POSTURE_SHORT_RU =
  "Курс учит танцевать аргентинское танго без боли и зажимов через упражнения с мячами для пилатеса и эластичной лентой…";
const POSTURE_SHORT_EN =
  "This course teaches you to dance Argentine tango without pain or tension through exercises with pilates balls and a resistance band…";

export function buildCourseProducts() {
  const full = {
    id: IDS.postureFull,
    type: "course",
    price_minor: 4000000,
    currency: "rub",
    access_days: 180,
    cover_url: POSTURE_COVERS[0],
    cover_urls: POSTURE_COVERS,
    duration_sec: 9 * 45 * 60,
    level: "2",
    skills: ["awareness", "technique"],
    lesson_count: 9,
    sort_index: 1,
    bundle_children: [IDS.postureBlock1, IDS.postureBlock2],
    program_blocks: [BLOCK1, BLOCK2],
    i18n: {
      ru: {
        title: "Как танцевать аргентинское танго без боли и зажимов?",
        short: POSTURE_SHORT_RU,
        description: POSTURE_SHORT_RU,
      },
      en: {
        title: "How to dance Argentine tango without pain or tension?",
        short: POSTURE_SHORT_EN,
        description: POSTURE_SHORT_EN,
      },
    },
  };

  const block1 = {
    id: IDS.postureBlock1,
    type: "course",
    price_minor: 2500000,
    currency: "rub",
    access_days: 180,
    cover_url: POSTURE_BALL_COVERS[0],
    cover_urls: POSTURE_BALL_COVERS,
    duration_sec: 5 * 45 * 60,
    level: "2",
    skills: ["awareness", "technique"],
    lesson_count: 5,
    sort_index: 101,
    bundle_parent: IDS.postureFull,
    program_blocks: [BLOCK1],
    i18n: {
      ru: {
        title:
          "Блок 1: «Мячи для пилатеса как поддержка нашего тела в пространстве»",
        short: POSTURE_SHORT_RU,
        description: POSTURE_SHORT_RU,
      },
      en: {
        title:
          "Block 1: Pilates balls as support for our body in space",
        short: POSTURE_SHORT_EN,
        description: POSTURE_SHORT_EN,
      },
    },
  };

  const block2 = {
    id: IDS.postureBlock2,
    type: "course",
    price_minor: 2500000,
    currency: "rub",
    access_days: 180,
    cover_url: POSTURE_BAND_COVERS[0],
    cover_urls: POSTURE_BAND_COVERS,
    duration_sec: 4 * 45 * 60,
    level: "2",
    skills: ["technique", "interaction"],
    lesson_count: 4,
    sort_index: 102,
    bundle_parent: IDS.postureFull,
    program_blocks: [BLOCK2],
    i18n: {
      ru: {
        title:
          "Блок 2: «Координация работы тела с помощью эластичной ленты»",
        short: POSTURE_SHORT_RU,
        description: POSTURE_SHORT_RU,
      },
      en: {
        title: "Block 2: Coordinating the body with a resistance band",
        short: POSTURE_SHORT_EN,
        description: POSTURE_SHORT_EN,
      },
    },
  };

  /** TEMP: no Figma/TZ shop price for course 2 — UI treats 0 as price-not-set. */
  const course2 = {
    id: IDS.course2,
    type: "course",
    price_minor: 0,
    currency: "rub",
    access_days: 180,
    cover_url: COURSE_2_COVERS[0],
    duration_sec: 7 * 45 * 60,
    level: "2",
    skills: ["technique"],
    lesson_count: 7,
    sort_index: 2,
    cover_urls: COURSE_2_COVERS,
    program_blocks: [],
    i18n: {
      ru: {
        title: "Курс из 7 уроков",
        short: "Семь уроков курса. Цена будет объявлена позже.",
        description: "Семь уроков курса. Цена будет объявлена позже.",
      },
      en: {
        title: "7-lesson course",
        short: "Seven lessons. Price to be announced.",
        description: "Seven lessons. Price to be announced.",
      },
    },
  };

  return [full, block1, block2, course2];
}

export function allSeedProducts() {
  return [...buildPeekProducts(), ...buildCourseProducts()];
}
