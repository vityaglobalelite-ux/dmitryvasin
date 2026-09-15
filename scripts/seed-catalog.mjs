/**
 * Seed catalog settings + development products via service role.
 *
 *   node --env-file=.env scripts/seed-catalog.mjs
 *
 * Requires a real SUPABASE_SERVICE_ROLE_KEY (JWT). Does not touch bot_* tables.
 * Re-runs upsert by stable ids — will not duplicate rows.
 * Does not insert kinescope ids (player needs real Kinescope videos).
 * VPS apply path: scripts/seed-catalog.sql (keep product ids/covers in sync).
 */
const supabaseUrl = (
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  ""
).replace(/\/$/, "");
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !serviceKey) {
  console.error(
    "Missing SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY.",
  );
  process.exit(1);
}

if (serviceKey.length < 80 || !serviceKey.startsWith("eyJ")) {
  console.error(
    "SUPABASE_SERVICE_ROLE_KEY does not look like a service-role JWT. Put the real key in .env — do not paste it in chat.",
  );
  process.exit(1);
}

const DEV_WHOLESALE_TIERS = [
  { minQty: 2, percent: 5 },
  { minQty: 4, percent: 10 },
  { minQty: 6, percent: 15 },
];

/** Club trial list 16900₽ / $195 / €170. Courses get shoppable roundings. */
const COURSE_FOREIGN_MINOR = {
  990000: { usd: 11500, eur: 9900 },
  1190000: { usd: 13900, eur: 11900 },
  1290000: { usd: 14900, eur: 12900 },
  1490000: { usd: 17500, eur: 14900 },
};

function foreignMinors(rubMinor) {
  const pretty = COURSE_FOREIGN_MINOR[rubMinor];
  if (pretty) return pretty;
  const rub = rubMinor / 100;
  return {
    usd: Math.max(1, Math.round((rub * 195) / 16900)) * 100,
    eur: Math.max(1, Math.round((rub * 170) / 16900)) * 100,
  };
}

const PRODUCTS = [
  {
    id: "c0a7a109-0001-4000-8000-000000000001",
    type: "lifehack",
    price_minor: 49000,
    currency: "rub",
    access_days: 30,
    cover_url: "/assets/site/catalog/covers/yt-technique.webp",
    duration_sec: 8 * 60 + 20,
    level: "1",
    skills: ["Осознавание", "Ось"],
    lesson_count: null,
    i18n: {
      ru: {
        title: "Ось за 8 минут",
        short: "Короткий приём, чтобы поймать вертикаль и перестать «садиться» в шаг.",
        description:
          "Лайфхак про ось: где она теряется в простом шаге и как вернуть её без лишнего напряжения. Смотрите, пробуйте сразу у зеркала, повторяйте в милонге.",
      },
      en: {
        title: "Axis in 8 minutes",
        short: "A short cue to find your vertical and stop collapsing into the step.",
        description:
          "A lifehack about axis: where it disappears in a simple walk, and how to bring it back without extra tension. Watch, try it at the mirror, then take it to the milonga.",
      },
    },
  },
  {
    id: "c0a7a109-0001-4000-8000-000000000002",
    type: "lifehack",
    price_minor: 59000,
    currency: "rub",
    access_days: 30,
    cover_url: "/assets/site/catalog/covers/studio-dmitry.webp",
    duration_sec: 12 * 60 + 5,
    level: "2",
    skills: ["Техника", "Стопы"],
    lesson_count: null,
    i18n: {
      ru: {
        title: "Стопы без шума",
        short: "Как убрать стук каблука и сделать шаг тихим, не теряя ясности.",
        description:
          "Разбор контакта стопы с полом: перенос веса, шум каблука и лишняя работа пальцев. После ролика шаг становится тише и понятнее партнёру.",
      },
      en: {
        title: "Quiet feet",
        short: "How to lose the heel noise without losing clarity in the step.",
        description:
          "A breakdown of the foot’s contact with the floor: weight transfer, heel noise, and extra toe work. After the video the step is quieter and easier for the partner to read.",
      },
    },
  },
  {
    id: "c0a7a109-0001-4000-8000-000000000003",
    type: "lesson",
    price_minor: 149000,
    currency: "rub",
    access_days: 90,
    cover_url: "/assets/site/catalog/covers/couple-gold.webp",
    duration_sec: 42 * 60,
    level: "2",
    skills: ["Техника", "Очо"],
    lesson_count: null,
    i18n: {
      ru: {
        title: "Очо без закручивания корпуса",
        short: "Урок: разобрать оче так, чтобы спина оставалась спокойной.",
        description:
          "Полный урок по оче: направление коленей, объём бёдер и что делать с корпусом, чтобы не закручивать пару. Есть медленный разбор, зеркало и практика под музыку.",
      },
      en: {
        title: "Ocho without twisting the torso",
        short: "A lesson on ochos that keeps the back quiet.",
        description:
          "A full ocho lesson: knee direction, hip volume, and what the torso should do so you don’t twist the couple. Slow breakdown, mirror work, and practice with music.",
      },
    },
  },
  {
    id: "c0a7a109-0001-4000-8000-000000000004",
    type: "lesson",
    price_minor: 169000,
    currency: "rub",
    access_days: 90,
    cover_url: "/assets/site/catalog/covers/silhouette.webp",
    duration_sec: 38 * 60 + 12,
    level: "3",
    skills: ["Музыкальность", "Осознавание"],
    lesson_count: null,
    i18n: {
      ru: {
        title: "Пауза, которую слышно",
        short: "Урок про то, как остановиться в музыке, а не просто замёрзнуть.",
        description:
          "Музыкальная пауза в танго: куда девается вес, как не обрывать объятие и как продолжить фразу. Урок для тех, кто уже ходит, но «стоит» слишком рано или слишком поздно.",
      },
      en: {
        title: "A pause you can hear",
        short: "A lesson on stopping inside the music instead of freezing.",
        description:
          "Musical pause in tango: where the weight goes, how not to break the embrace, and how to continue the phrase. For dancers who already walk, but pause too early or too late.",
      },
    },
  },
  {
    id: "c0a7a109-0001-4000-8000-000000000005",
    type: "course",
    price_minor: 990000,
    currency: "rub",
    access_days: 180,
    cover_url: "/assets/site/catalog/covers/studio-lesson.webp",
    duration_sec: 6 * 3600,
    level: "2",
    skills: ["Техника", "Взаимодействие", "Осознавание"],
    lesson_count: 6,
    i18n: {
      ru: {
        title: "База, на которой держится пара",
        short: "Курс из 6 уроков: ось, шаг, объятие и простой поворот.",
        description:
          "Система, а не набор роликов. Каждый урок опирается на предыдущий: сначала ось и шаг, затем объятие, затем простой поворот. Можно проходить в своём темпе и возвращаться к эпизодам.",
        program:
          "Урок 1. Ось и перенос веса\nУрок 2. Шаг без спешки\nУрок 3. Объятие: тонус, а не зажим\nУрок 4. Ведение в простом шаге\nУрок 5. Выход в поворот\nУрок 6. Сборка под музыку",
      },
      en: {
        title: "The base that holds the couple",
        short: "A 6-lesson course: axis, walk, embrace, and a simple turn.",
        description:
          "A system, not a pile of clips. Each lesson builds on the last: axis and walk, then embrace, then a simple turn. Go at your own pace and revisit any episode.",
        program:
          "Lesson 1. Axis and weight transfer\nLesson 2. Walking without hurry\nLesson 3. Embrace: tone, not a clamp\nLesson 4. Leading in a simple walk\nLesson 5. Entering a turn\nLesson 6. Putting it together with music",
      },
    },
  },
  {
    id: "c0a7a109-0001-4000-8000-000000000006",
    type: "extra",
    price_minor: 79000,
    currency: "rub",
    access_days: 60,
    cover_url: "/assets/site/catalog/covers/photo-dance.webp",
    duration_sec: 22 * 60,
    level: "1",
    skills: ["Осознавание"],
    lesson_count: null,
    i18n: {
      ru: {
        title: "Разминка до милонги",
        short: "Доп. материал: 20 минут, чтобы тело включилось до танца.",
        description:
          "Короткая последовательность до выхода на танцпол: стопы, бёдра, грудная клетка. Не тренировка «на усталость», а способ прийти в зал уже готовым.",
      },
      en: {
        title: "Warm-up before the milonga",
        short: "Extra: 20 minutes to switch the body on before dancing.",
        description:
          "A short sequence before you step onto the floor: feet, hips, ribcage. Not a workout to exhaustion — a way to arrive already ready.",
      },
    },
  },
  {
    id: "c0a7a109-0001-4000-8000-000000000007",
    type: "research",
    price_minor: 249000,
    currency: "rub",
    access_days: 120,
    cover_url: "/assets/site/catalog/covers/silhouette.webp",
    duration_sec: 58 * 60,
    level: "4",
    skills: ["Осознавание", "Вариативность"],
    lesson_count: null,
    i18n: {
      ru: {
        title: "Исследование: куда уходит шаг",
        short: "Часовой разбор, почему шаг «уезжает» в сторону и как его вернуть.",
        description:
          "Исследовательский формат: не рецепт на три счёта, а наблюдение за тем, куда уходит траектория шага. Много пауз, сравнений и возвратов к одному и тому же месту.",
      },
      en: {
        title: "Research: where the step goes",
        short: "An hour-long look at why the step drifts sideways — and how to bring it back.",
        description:
          "A research format: not a three-count recipe, but observation of where the walk’s path goes. Lots of pauses, comparisons, and returns to the same place.",
      },
    },
  },
  {
    id: "c0a7a109-0001-4000-8000-000000000008",
    type: "peek",
    price_minor: 199000,
    currency: "rub",
    access_days: 90,
    cover_url: "/assets/site/catalog/covers/studio-lesson.webp",
    duration_sec: 54 * 60 + 30,
    level: "3",
    skills: ["Взаимодействие", "Техника"],
    lesson_count: null,
    i18n: {
      ru: {
        title: "Подсмотр: индивидуальный урок",
        short: "Запись реальной работы с парой — без постановки «для камеры».",
        description:
          "Урок-подсмотр: как я веду человека через затык в объятии. Видно ошибки, паузы и точные формулировки. Смотреть полезно и ведущим, и ведомым.",
      },
      en: {
        title: "Peek: a private lesson",
        short: "A recording of real work with a couple — not staged for the camera.",
        description:
          "A peek lesson: how I take a dancer through a block in the embrace. You see the mistakes, the pauses, and the exact wording. Useful for both leaders and followers.",
      },
    },
  },
  {
    id: "c0a7a109-0001-4000-8000-000000000009",
    type: "lifehack",
    price_minor: 45000,
    currency: "rub",
    access_days: 30,
    cover_url: "/assets/site/catalog/covers/yt-interaction.webp",
    duration_sec: 380,
    level: "1",
    skills: ["Осознавание", "Объятие"],
    lesson_count: null,
    i18n: {
      ru: {
        title: "Тонус в объятии",
        short: "Как держать объятие живым, не превращая его в зажим.",
        description:
          "Короткий лайфхак: где в объятии появляется лишний тонус и как его отпустить, не теряя ясности ведения.",
      },
      en: {
        title: "Tone in the embrace",
        short: "How to keep the embrace alive without turning it into a clamp.",
        description:
          "A short lifehack: where extra tone shows up in the embrace and how to release it without losing the lead.",
      },
    },
  },
  {
    id: "c0a7a109-0001-4000-8000-000000000010",
    type: "lifehack",
    price_minor: 55000,
    currency: "rub",
    access_days: 30,
    cover_url: "/assets/site/catalog/covers/yt-variability.webp",
    duration_sec: 640,
    level: "2",
    skills: ["Техника", "Ось"],
    lesson_count: null,
    i18n: {
      ru: {
        title: "Колени смотрят в шаг",
        short: "Один ориентир, который сразу собирает траекторию.",
        description:
          "Лайфхак про направление коленей: куда они смотрят в шаге и почему от этого «ломается» ось.",
      },
      en: {
        title: "Knees face the step",
        short: "One cue that immediately organizes the path.",
        description:
          "A lifehack about knee direction: where they point in the walk and why the axis breaks when they don’t.",
      },
    },
  },
  {
    id: "c0a7a109-0001-4000-8000-000000000011",
    type: "lifehack",
    price_minor: 52000,
    currency: "rub",
    access_days: 30,
    cover_url: "/assets/site/catalog/covers/dancer-dress.webp",
    duration_sec: 510,
    level: "1",
    skills: ["Музыкальность"],
    lesson_count: null,
    i18n: {
      ru: {
        title: "Акцент, который слышно телом",
        short: "Как ответить на удар оркестра шагом, а не плечами.",
        description:
          "Музыкальный лайфхак: куда уходит вес на акценте и как не дёргать корпус.",
      },
      en: {
        title: "An accent the body can hear",
        short: "How to answer the orchestra with the step, not the shoulders.",
        description:
          "A musical lifehack: where the weight goes on the accent and how not to jerk the torso.",
      },
    },
  },
  {
    id: "c0a7a109-0001-4000-8000-000000000012",
    type: "lesson",
    price_minor: 139000,
    currency: "rub",
    access_days: 90,
    cover_url: "/assets/site/catalog/covers/stage-feet.webp",
    duration_sec: 2100,
    level: "1",
    skills: ["Техника", "Шаг"],
    lesson_count: null,
    i18n: {
      ru: {
        title: "Простой шаг без спешки",
        short: "Базовый урок ходьбы: перенос веса и длина шага.",
        description:
          "Разбираем обычный шаг так, чтобы он стал понятным партнёру. Медленно, с зеркалом и под музыку.",
      },
      en: {
        title: "A simple walk without hurry",
        short: "A fundamental walking lesson: weight transfer and step length.",
        description:
          "We break down the basic walk so the partner can read it. Slow, with a mirror, and with music.",
      },
    },
  },
  {
    id: "c0a7a109-0001-4000-8000-000000000013",
    type: "lesson",
    price_minor: 159000,
    currency: "rub",
    access_days: 90,
    cover_url: "/assets/site/catalog/covers/photo-dance.webp",
    duration_sec: 2460,
    level: "2",
    skills: ["Техника", "Поворот"],
    lesson_count: null,
    i18n: {
      ru: {
        title: "Выход в поворот",
        short: "Как начать поворот из шага, не теряя оси.",
        description:
          "Урок про вход в поворот: куда смотрит корпус, что делает свободная нога и как не завалиться внутрь.",
      },
      en: {
        title: "Entering a turn",
        short: "How to start a turn from the walk without losing the axis.",
        description:
          "A lesson on entering the turn: where the torso faces, what the free leg does, and how not to fall inward.",
      },
    },
  },
  {
    id: "c0a7a109-0001-4000-8000-000000000014",
    type: "lesson",
    price_minor: 179000,
    currency: "rub",
    access_days: 90,
    cover_url: "/assets/site/catalog/covers/studio-lesson.webp",
    duration_sec: 2640,
    level: "3",
    skills: ["Техника", "Сакада"],
    lesson_count: null,
    i18n: {
      ru: {
        title: "Сакада без толчка",
        short: "Точное место и момент, чтобы сакада не стала ударом.",
        description:
          "Разбор сакады: геометрия ног, момент в музыке и как не толкать партнёра корпусом.",
      },
      en: {
        title: "Sacada without a shove",
        short: "The exact place and timing so a sacada is not a hit.",
        description:
          "A sacada breakdown: leg geometry, the moment in the music, and how not to push the partner with the torso.",
      },
    },
  },
  {
    id: "c0a7a109-0001-4000-8000-000000000015",
    type: "lesson",
    price_minor: 155000,
    currency: "rub",
    access_days: 90,
    cover_url: "/assets/site/catalog/covers/photo-liza.webp",
    duration_sec: 2340,
    level: "2",
    skills: ["Взаимодействие", "Объятие"],
    lesson_count: null,
    i18n: {
      ru: {
        title: "Объятие, в котором удобно обоим",
        short: "Урок про тонус, дистанцию и ясность в паре.",
        description:
          "Как собрать объятие так, чтобы ведущему было ясно, а ведомому — безопасно. Много сравнений «до / после».",
      },
      en: {
        title: "An embrace comfortable for both",
        short: "A lesson on tone, distance, and clarity in the couple.",
        description:
          "How to build an embrace the leader can read and the follower can trust. Lots of before / after comparisons.",
      },
    },
  },
  {
    id: "c0a7a109-0001-4000-8000-000000000016",
    type: "lesson",
    price_minor: 165000,
    currency: "rub",
    access_days: 90,
    cover_url: "/assets/site/catalog/covers/teacher-hero.webp",
    duration_sec: 2580,
    level: "3",
    skills: ["Техника", "Ведение"],
    lesson_count: null,
    i18n: {
      ru: {
        title: "Ведение в простом шаге",
        short: "Как пригласить шаг, а не тащить человека за собой.",
        description:
          "Урок ведения: импульс, пауза и то, что происходит в груди. Для тех, кто уже ходит, но пара «не едет».",
      },
      en: {
        title: "Leading in a simple walk",
        short: "How to invite the step instead of dragging the person along.",
        description:
          "A leading lesson: impulse, pause, and what happens in the chest. For dancers who already walk, but the couple doesn’t travel.",
      },
    },
  },
  {
    id: "c0a7a109-0001-4000-8000-000000000017",
    type: "course",
    price_minor: 1290000,
    currency: "rub",
    access_days: 180,
    cover_url: "/assets/site/catalog/covers/og-dmitry.webp",
    duration_sec: 28800,
    level: "3",
    skills: ["Музыкальность", "Осознавание"],
    lesson_count: 8,
    i18n: {
      ru: {
        title: "Музыкальность на 8 уроков",
        short: "Курс: фраза, пауза, акцент и как не танцевать «мимо оркестра».",
        description:
          "Последовательная система музыкальности. От простого шага в ритме до паузы и акцента, которые пара слышит вместе.",
        program:
          "Урок 1. Где в теле живёт пульс\nУрок 2. Шаг в четвертях\nУрок 3. Фраза, а не счёт\nУрок 4. Пауза внутри музыки\nУрок 5. Акцент без дёрганья\nУрок 6. Замедление\nУрок 7. Пара слышит одно и то же\nУрок 8. Сборка на милонге",
      },
      en: {
        title: "Musicality in 8 lessons",
        short: "A course: phrase, pause, accent — and how not to dance past the orchestra.",
        description:
          "A sequential musicality system. From a simple walk in time to pauses and accents the couple hears together.",
        program:
          "Lesson 1. Where the pulse lives in the body\nLesson 2. Walking in quarters\nLesson 3. Phrase, not counting\nLesson 4. Pause inside the music\nLesson 5. Accent without jerking\nLesson 6. Slowing down\nLesson 7. The couple hears the same thing\nLesson 8. Putting it together at the milonga",
      },
    },
  },
  {
    id: "c0a7a109-0001-4000-8000-000000000018",
    type: "course",
    price_minor: 1190000,
    currency: "rub",
    access_days: 180,
    cover_url: "/assets/site/catalog/covers/couple-gold.webp",
    duration_sec: 25200,
    level: "2",
    skills: ["Техника", "Ось", "Шаг"],
    lesson_count: 7,
    i18n: {
      ru: {
        title: "Техника шага: 7 уроков",
        short: "Курс про стопы, колени и то, почему шаг «уезжает».",
        description:
          "Разбираем технику ходьбы слой за слоем. После курса шаг становится тише, короче или длиннее — по выбору, а не случайно.",
        program:
          "Урок 1. Стопа и пол\nУрок 2. Перенос веса\nУрок 3. Колени\nУрок 4. Длина шага\nУрок 5. Смена направления\nУрок 6. Ошибки «уезжающего» шага\nУрок 7. Сборка под разную музыку",
      },
      en: {
        title: "Walk technique: 7 lessons",
        short: "A course on feet, knees, and why the step drifts.",
        description:
          "We build walking technique layer by layer. After the course the step gets quieter, shorter or longer — by choice, not by accident.",
        program:
          "Lesson 1. Foot and floor\nLesson 2. Weight transfer\nLesson 3. Knees\nLesson 4. Step length\nLesson 5. Changing direction\nLesson 6. The drifting-step mistakes\nLesson 7. Putting it together with different music",
      },
    },
  },
  {
    cover_url: "/assets/site/catalog/covers/dancer-dress.webp",
    duration_sec: 32400,
    level: "3",
    skills: ["Взаимодействие", "Техника"],
    lesson_count: 10,
    i18n: {
      ru: {
        title: "Пара: 10 уроков взаимодействия",
        short: "Курс про ведение, следование и то, что происходит между двумя людьми.",
        description:
          "Не набор фигур, а система общения в паре. Полезно и ведущим, и ведомым — можно проходить вместе.",
        program:
          "Урок 1. Кто начинает шаг\nУрок 2. Приглашение, а не толчок\nУрок 3. Как отвечать телом\nУрок 4. Дистанция\nУрок 5. Поворот вдвоём\nУрок 6. Ошибки «я веду сильнее»\nУрок 7. Ошибки «я угадываю»\nУрок 8. Пауза в паре\nУрок 9. Смена ролей в упражнении\nУрок 10. Сборка на музыке",
      },
      en: {
        title: "The couple: 10 lessons on connection",
        short: "A course on leading, following, and what happens between two people.",
        description:
          "Not a pile of figures — a system of conversation in the couple. Useful for both leaders and followers; you can take it together.",
        program:
          "Lesson 1. Who starts the step\nLesson 2. Invitation, not a shove\nLesson 3. How to answer with the body\nLesson 4. Distance\nLesson 5. Turning together\nLesson 6. The “I lead harder” mistakes\nLesson 7. The “I guess” mistakes\nLesson 8. Pause in the couple\nLesson 9. Switching roles in an exercise\nLesson 10. Putting it together with music",
      },
    },
  },
  {
    id: "c0a7a109-0001-4000-8000-000000000020",
    type: "extra",
    price_minor: 69000,
    currency: "rub",
    access_days: 60,
    cover_url: "/assets/site/catalog/covers/couple-stage.webp",
    duration_sec: 900,
    level: "1",
    skills: ["Взаимодействие"],
    lesson_count: null,
    i18n: {
      ru: {
        title: "Этикет милонги за 15 минут",
        short: "Как приглашать, как отказывать и куда смотреть в зале.",
        description:
          "Короткий доп. материал, чтобы зал не был стрессом. Без морали — конкретные привычки.",
      },
      en: {
        title: "Milonga etiquette in 15 minutes",
        short: "How to invite, how to decline, and where to look in the room.",
        description:
          "A short extra so the floor is not stressful. No lectures — concrete habits.",
      },
    },
  },
  {
    id: "c0a7a109-0001-4000-8000-000000000021",
    type: "extra",
    price_minor: 89000,
    currency: "rub",
    access_days: 90,
    cover_url: "/assets/site/catalog/covers/photo-dmitry.webp",
    duration_sec: 1500,
    level: "2",
    skills: ["Техника"],
    lesson_count: null,
    i18n: {
      ru: {
        title: "Домашние связки на 25 минут",
        short: "Набор коротких повторений, если нет партнёра рядом.",
        description:
          "Доп. материал для тех, кто учится один: ось, шаг, оче у стены и зеркала.",
      },
      en: {
        title: "25 minutes of homework drills",
        short: "A set of short repeats when you don’t have a partner nearby.",
        description:
          "Extra for people who study alone: axis, walk, ochos at the wall and the mirror.",
      },
    },
  },
  {
    id: "c0a7a109-0001-4000-8000-000000000022",
    type: "research",
    price_minor: 229000,
    currency: "rub",
    access_days: 120,
    cover_url: "/assets/site/catalog/covers/dancer-dress.webp",
    duration_sec: 3300,
    level: "4",
    skills: ["Осознавание", "Объятие"],
    lesson_count: null,
    i18n: {
      ru: {
        title: "Исследование: объём объятия",
        short: "Почему пара «сплющивается» и где на самом деле живёт пространство.",
        description:
          "Час наблюдений за объёмом: грудная клетка, локти, то, что происходит между двумя спинами.",
      },
      en: {
        title: "Research: volume of the embrace",
        short: "Why the couple flattens — and where the space actually lives.",
        description:
          "An hour of observing volume: ribcage, elbows, and what happens between two backs.",
      },
    },
  },
  {
    id: "c0a7a109-0001-4000-8000-000000000023",
    type: "research",
    price_minor: 259000,
    currency: "rub",
    access_days: 120,
    cover_url: "/assets/site/catalog/covers/studio-dmitry.webp",
    duration_sec: 3600,
    level: "3",
    skills: ["Вариативность", "Техника"],
    lesson_count: null,
    i18n: {
      ru: {
        title: "Исследование: вариации одного шага",
        short: "Один шаг — много продолжений. Смотрим, где выбор появляется.",
        description:
          "Не набор фигур, а исследование: в какой момент шаг ещё можно повернуть, ускорить или остановить.",
      },
      en: {
        title: "Research: variations of one step",
        short: "One step, many continuations. We watch where the choice appears.",
        description:
          "Not a pile of figures — research: at which moment the step can still turn, speed up, or stop.",
      },
    },
  },
  {
    id: "c0a7a109-0001-4000-8000-000000000024",
    type: "peek",
    price_minor: 189000,
    currency: "rub",
    access_days: 90,
    cover_url: "/assets/site/catalog/covers/photo-liza.webp",
    duration_sec: 3120,
    level: "2",
    skills: ["Взаимодействие", "Осознавание"],
    lesson_count: null,
    i18n: {
      ru: {
        title: "Подсмотр: работа с начинающими",
        short: "Реальный урок, где пара ещё ищет шаг. Без монтажа «красиво».",
        description:
          "Подсмотр за тем, как я ставлю простую ходьбу двум людям, которые только входят в танго.",
      },
      en: {
        title: "Peek: working with beginners",
        short: "A real lesson where the couple is still looking for the walk. No “pretty” edit.",
        description:
          "A peek at how I set up a simple walk for two people just entering tango.",
      },
    },
  },
  {
    id: "c0a7a109-0001-4000-8000-000000000025",
    type: "peek",
    price_minor: 219000,
    currency: "rub",
    access_days: 90,
    cover_url: "/assets/site/catalog/covers/teacher-hero.webp",
    duration_sec: 3540,
    level: "3",
    skills: ["Техника", "Объятие"],
    lesson_count: null,
    i18n: {
      ru: {
        title: "Подсмотр: разбор затыка в оче",
        short: "Индивидуалка, где оче не получается. Смотрим, что я меняю в формулировках.",
        description:
          "Подсмотр полезен преподавателям и тем, кто застрял в оче: видно не приём, а ход мысли.",
      },
      en: {
        title: "Peek: an ocho that’s stuck",
        short: "A private lesson where the ocho isn’t working. Watch what I change in the wording.",
        description:
          "Useful for teachers and anyone stuck on ochos: you see the thinking, not just a trick.",
      },
    },
  },
];

async function rest(path, { method = "GET", body, prefer } = {}) {
  const headers = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (prefer) headers.Prefer = prefer;
  const res = await fetch(`${supabaseUrl}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 500)}`);
  }
  return text ? JSON.parse(text) : null;
}

try {
  await rest("/rest/v1/catalog_settings?on_conflict=key", {
    method: "POST",
    prefer: "return=minimal,resolution=merge-duplicates",
    body: {
      key: "wholesale_tiers",
      value: DEV_WHOLESALE_TIERS,
    },
  });

  await rest("/rest/v1/catalog_products?on_conflict=id", {
    method: "POST",
    prefer: "return=minimal,resolution=merge-duplicates",
    body: PRODUCTS.map(
      ({
        id,
        type,
        price_minor,
        currency,
        access_days,
        cover_url,
        duration_sec,
        level,
        skills,
        lesson_count,
      }) => {
        const foreign = foreignMinors(price_minor);
        return {
          id,
          type,
          price_minor,
          price_usd_minor: foreign.usd,
          price_eur_minor: foreign.eur,
          currency,
          access_days,
          cover_url,
          duration_sec,
          level,
          skills,
          lesson_count,
          published: true,
        };
      },
    ),
  });

  const i18nRows = PRODUCTS.flatMap((product) =>
    Object.entries(product.i18n).map(([locale, copy]) => ({
      product_id: product.id,
      locale,
      title: copy.title,
      short: copy.short,
      description: copy.description,
      program: copy.program ?? null,
    })),
  );

  await rest("/rest/v1/catalog_product_i18n?on_conflict=product_id,locale", {
    method: "POST",
    prefer: "return=minimal,resolution=merge-duplicates",
    body: i18nRows,
  });
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("PGRST205") || message.includes("catalog_products")) {
    console.error(
      "Tables catalog_* are not on this instance yet. Apply database-schema/migrations/016_catalog.sql first (only if you explicitly want it on this host).",
    );
  }
  console.error(message);
  process.exit(1);
}

console.log("Seed catalog (service role):");
console.log(
  "  upserted catalog_settings key=wholesale_tiers →",
  JSON.stringify(DEV_WHOLESALE_TIERS),
);
console.log(`  upserted ${PRODUCTS.length} published products (ru+en)`);
console.log("  kinescope videos: none (player needs real Kinescope ids)");
console.log("  users / orders / access: none (register in the UI, then buy)");
