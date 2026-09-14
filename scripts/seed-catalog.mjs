/**
 * Seed catalog settings + development products via service role.
 *
 *   node --env-file=.env scripts/seed-catalog.mjs
 *
 * Requires a real SUPABASE_SERVICE_ROLE_KEY (JWT). Does not touch bot_* tables.
 * Re-runs upsert by stable ids — will not duplicate rows.
 * Does not insert kinescope ids (player needs real Kinescope videos).
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

const PRODUCTS = [
  {
    id: "c0a7a109-0001-4000-8000-000000000001",
    type: "lifehack",
    price_minor: 49000,
    currency: "rub",
    access_days: 30,
    cover_url: "/assets/site/home/review-shot-37.png",
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
    cover_url: "/assets/site/home/review-shot-38.png",
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
    cover_url: "/assets/site/home/review-shot-39.png",
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
    cover_url: "/assets/site/home/review-shot-41.png",
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
    cover_url: "/assets/site/home/review-shot-42.png",
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
    cover_url: "/assets/site/home/review-shot-40.png",
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
    cover_url: "/assets/site/home/review-shot-44.png",
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
    cover_url: "/assets/site/home/review-shot-45.png",
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
      }) => ({
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
        published: true,
      }),
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
