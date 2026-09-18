import type { Locale } from "@/lib/catalog/types";

/** Static marketing copy from Figma home 572:1864 / 722:4311. */
export const homeCopy = {
  chooseVideos: "Выбрать обучающие видео",
  choose: "Выбрать",
  look: "Смотри.",
  repeat: "Повторяй.",
  dance: "Танцуй!",
  bubbleLook:
    "Включайте обучающие видео из любой точки мира, с любого устройства в удобное время и разбирайте движения вместе со мной.",
  bubbleLookLead: "Включайте обучающие видео",
  bubbleLookRest:
    " из любой точки мира, с любого устройства в удобное время и разбирайте движения вместе со мной.",
  bubbleDoLead: "Следуйте моим пошаговым инструкциям",
  bubbleDoRest:
    " в обучающих видео, анализируйте свои движения и улучшайте навыки.",
  bubbleDanceLead: "Собирайте движения",
  bubbleDanceRest: " в красивый танец, двигайтесь уверенно и легко!",
  approach:
    "Мой подход появился благодаря тысячам часов в студиях, на уроках, репетициях, выступлениях и соревнованиях.",
  approachMethod:
    "Этот исследовательский метод появился благодаря тысячам часов, проведённых в студиях, на уроках, репетициях, выступлениях и соревнованиях.",
  peopleLead: "Но больше всего на него повлияли ЛЮДИ",
  peopleRest: ": их вопросы, открытия, трудности и неожиданные инсайты.",
  directionsTitle:
    "Я собрал опыт, наблюдения и практику вокруг 5 направлений исследования танго,",
  directionsSub: "которые важны для танцоров любого уровня.",
  teacherName: "Дмитрий Васин",
  teacherTitle: "Чемпион мира по аргентинскому танго",
  requestTitleLead: "У каждого танцора — свой ",
  requestTitleEm: "запрос",
  requestTitleMid: " и свои ",
  requestTitleGoal: "цели",
  requestBodyLead: "Одни ищут простые ",
  requestBodyMid: " или тематические ",
  requestBodyMid2:
    ", чтобы по-новому увидеть и попрактиковать движение. А другие хотят погрузиться в тему целиком и исследовать её шаг за шагом через ",
  requestOneLead: "Одни ищут простые ",
  lifehackWord: "лайфхаки",
  requestOneMid: " или тематические ",
  lessonWord: "уроки",
  requestOneTail: ", чтобы по-новому увидеть и попрактиковать движение.",
  requestTwoLead:
    "А другие хотят погрузиться в тему целиком и исследовать её шаг за шагом через ",
  courseWord: "курсы",
  requestBodyOr: " или ",
  peekWord: "уроки-«подсмотры»",
  developed:
    "Поэтому я разработал разные обучающие видео, которые помогут каждому танцору найти именно то, что ему нужно.",
  variantsLead: "Давайте рассмотрим, какие ",
  variantsEm: "варианты обучающих видео",
  variantsTail: " у меня есть:",
  catalogTitle: "Каталог обучающих видео",
  showMore: "Показать ещё",
  emptyTitle: "В каталоге пока нет опубликованных видео",
  emptyBody:
    "Как только уроки, курсы и лайфхаки появятся в базе, карточки встанут на это место — без скачка сетки.",
  emptyCta: "Открыть каталог",
  emptyFilterCta: "Смотреть каталог",
  errorTitle: "Не удалось загрузить каталог",
  errorBody: "Проверьте соединение и откройте каталог ещё раз.",
  extraLead:
    "Выбирайте то, что нужно вам сейчас. Комбинируйте видео и собирайте собственный путь обучения.",
  extraGain: "И чем больше вы выбираете, тем больше ваша выгода!",
  howTitle: "Как оплатить и смотреть обучающие видео?",
  how1Title: "Регистрация",
  how1: "Зарегистрируйтесь на сайте и получите подтверждение на email.",
  how2Title: "Оплата",
  how2: "Добавьте продукты в корзину и оплачивайте из любой точки мира в любой валюте. Чем больше продуктов, тем выше ваша скидка.",
  how3Title: "Доступ",
  how3: "Войдите в личный кабинет под логином и паролем, чтобы смотреть обучающие видео. У каждого продукта есть свой срок доступа.",
  how4Title: "Поддержка",
  howSupport:
    "Если у вас есть вопросы, обращайтесь в поддержку. Я и моя команда постараемся быстро вам помочь!",
  howAccess: "У каждого продукта — свой срок доступа.",
  supportTitle:
    "Если у вас есть вопросы — напишите в поддержку, и вам помогут",
  supportCta: "Написать в поддержку",
  reviewsTitle: "Отзывы тех, кто прошёл мои курсы",
  reviewsResults:
    "А вот такие результаты получают ученики, работая со мной в онлайн и оффлайн.",
  reviewsHint: "Листайте и читайте →",
  reviewsSwipe: "Листайте вправо-влево, чтобы посмотреть отзывы",
  readMore: "Читать далее",
  readLess: "Свернуть",
  reviewsPrev: "Предыдущие отзывы",
  reviewsNext: "Следующие отзывы",
  joinNow: "Присоединиться сейчас",
} as const;

export const homeDirections = [
  {
    title: "Осознавание",
    text: "Учимся замечать не только результат, но и то, как он возникает.",
    textLines: [
      "Учимся замечать",
      "не\u00a0только результат,",
      "но\u00a0и\u00a0то, как\u00a0он возникает.",
    ],
    photo: "dirAwareness",
  },
  {
    title: "Техника",
    text: "Разбираемся, почему одни движения получаются легко, а другие требуют лишних усилий.",
    textLines: [
      "Разбираемся, почему одни",
      "движения получаются легко,",
      "а\u00a0другие требуют лишних",
      "усилий.",
    ],
    photo: "dirTechnique",
  },
  {
    title: "Музыкальность",
    text: "Уходим от привычных музыкальных решений и ищем новые способы взаимодействия с музыкой.",
    textLines: [
      "Уходим от\u00a0привычных",
      "музыкальных решений",
      "и\u00a0ищем новые способы",
      "взаимодействия с\u00a0музыкой.",
    ],
    photo: "dirMusicality",
  },
  {
    title: "Взаимодействие",
    text: "Ищем более понятные, точные и комфортные способы взаимодействия в паре.",
    textLines: [
      "Ищем более понятные,",
      "точные и\u00a0комфортные",
      "способы взаимодействия",
      "в\u00a0паре.",
    ],
    photo: "dirInteraction",
  },
  {
    title: "Вариативность",
    text: "Постепенно обнаруживаем, что вариантов продолжения движения гораздо больше, чем кажется на первый взгляд.",
    textLines: [
      "Постепенно обнаруживаем,",
      "что\u00a0вариантов продолжения",
      "движения гораздо больше,",
      "чем\u00a0кажется на\u00a0первый взгляд.",
    ],
    photo: "dirVariation",
  },
] as const;

export const homeDirectionsTitleLines = [
  "Я собрал опыт,",
  "наблюдения и практику",
  "вокруг 5 направлений",
  "исследования танго,",
] as const;

export const homeDirectionsSubLines = [
  "которые важны для танцоров",
  "любого уровня.",
] as const;

/** Desktop 572:1864 wraps only. */
export const homeDesktopBreaks = {
  approach: [
    "Мой\u00a0подход появился благодаря",
    "тысячам часов в\u00a0студиях,",
    "на\u00a0уроках, репетициях,",
    "выступлениях и\u00a0соревнованиях.",
  ],
  people: [
    "Но\u00a0больше всего на\u00a0него повлияли ЛЮДИ:",
    "их\u00a0вопросы, открытия, трудности",
    "и\u00a0неожиданные инсайты.",
  ],
  howTitle: ["Как оплатить и смотреть", "обучающие видео?"],
  how1: [
    "Зарегистрируйтесь на\u00a0сайте и\u00a0получите",
    "подтверждение на\u00a0email.",
  ],
  how2: [
    "Добавьте продукты в\u00a0корзину и\u00a0оплачивайте из\u00a0любой",
    "точки мира в\u00a0любой валюте. Чем больше продуктов,",
    "тем выше ваша скидка.",
  ],
  how3: [
    "Войдите в\u00a0личный кабинет под\u00a0логином и\u00a0паролем,",
    "чтобы смотреть обучающие видео.",
  ],
  howAccess: ["У\u00a0каждого продукта\u00a0—", "свой срок доступа."],
  supportTitle: [
    "Если\u00a0у\u00a0вас есть\u00a0вопросы\u00a0— напишите",
    "в\u00a0поддержку, и\u00a0вам\u00a0помогут",
  ],
  extraLead: [
    "Выбирайте то, что нужно вам сейчас. Комбинируйте",
    "видео и собирайте собственный путь обучения.",
  ],
  extraGain: [
    "И чем больше вы выбираете, тем",
    "больше ваша выгода!",
  ],
  reviewsResults: [
    "А\u00a0вот такие результаты получают ученики,",
    "работая со\u00a0мной в\u00a0онлайн и\u00a0оффлайн.",
  ],
} as const;

/** Mobile 722:4311 wraps. */
export const homeMobileBreaks = {
  dirTitle: [
    "Я\u00a0собрал опыт,",
    "наблюдения и\u00a0практику",
    "вокруг 5\u00a0направлений",
    "исследования танго,",
  ],
  dirSub: ["которые важны для танцоров", "любого уровня."],
  dirTexts: [
    [
      "Учимся замечать не\u00a0только",
      "результат, но\u00a0и\u00a0то,",
      "как\u00a0он\u00a0возникает.",
    ],
    [
      "Разбираемся, почему одни",
      "движения получаются легко,",
      "а\u00a0другие требуют лишних усилий.",
    ],
    [
      "Уходим от\u00a0привычных музыкальных",
      "решений и\u00a0ищем новые способы",
      "взаимодействия с\u00a0музыкой.",
    ],
    [
      "Ищем более понятные, точные",
      "и\u00a0комфортные способы",
      "взаимодействия в\u00a0паре.",
    ],
    [
      "Постепенно обнаруживаем,",
      "что\u00a0вариантов продолжения",
      "движения гораздо больше,",
      "чем\u00a0кажется на\u00a0первый взгляд.",
    ],
  ],
  bubbleLook: [
    "Включайте обучающие видео из любой",
    "точки мира, с любого устройства,",
    "в удобное время и разбирайте со мной.",
  ],
  bubbleDo: [
    "Следуйте моим пошаговым",
    "инструкциям в обучающих видео,",
    "анализируйте движения и навыки.",
  ],
  bubbleDance: [
    "Собирайте движения в\u00a0красивый",
    "танец, двигайтесь уверенно и\u00a0легко!",
  ],
  approach: [
    "Мой\u00a0подход появился",
    "благодаря тысячам",
    "часов в\u00a0студиях, на",
    "уроках, репетициях,",
    "выступлениях и",
    "соревнованиях.",
  ],
  approachMethod: [
    "Этот\u00a0исследовательский метод",
    "появился благодаря тысячам часов,",
    "проведённых в\u00a0студиях, на\u00a0уроках,",
    "репетициях, выступлениях и",
    "соревнованиях.",
  ],
  people: [
    "Но\u00a0больше всего на\u00a0него повлияли",
    "ЛЮДИ: их\u00a0вопросы, открытия,",
    "трудности и\u00a0неожиданные инсайты.",
  ],
  requestTitle: ["У\u00a0каждого танцора\u00a0—", "свой запрос и\u00a0свои цели"],
  requestBody: [
    "И\u00a0иногда достаточно простого лайфхака",
    "или\u00a0тематического урока, чтобы\u00a0иначе увидеть",
    "и\u00a0попрактиковать движение. А\u00a0иногда\u00a0—",
    "погрузиться в\u00a0тему целиком и\u00a0исследовать",
    "её\u00a0шаг за\u00a0шагом через\u00a0курс или\u00a0уроки-«подсмотры».",
  ],
  extraLead: [
    "Выбирайте то, что нужно вам сейчас.",
    "Комбинируйте видео и\u00a0собирайте",
    "собственный путь обучения.",
  ],
  extraGain: [
    "И\u00a0чем больше вы\u00a0выбираете,",
    "тем больше ваша выгода!",
  ],
  reviewsResults: [
    "А\u00a0вот такие результаты",
    "получают ученики, работая",
    "со\u00a0мной в\u00a0онлайн и",
    "оффлайн.",
  ],
  reviewsSwipe: [
    "Листайте вправо-влево, чтобы",
    "посмотреть отзывы",
  ],
  howTitle: ["Как оплатить и смотреть", "обучающие видео?"],
  howSupport: [
    "Если есть вопросы, обращайтесь",
    "в\u00a0поддержку. Мы\u00a0быстро поможем!",
  ],
  how1: [
    "Зарегистрируйтесь на\u00a0сайте",
    "и\u00a0получите подтверждение",
    "на\u00a0email.",
  ],
  how2: [
    "Добавьте продукты в\u00a0корзину",
    "и\u00a0оплачивайте из\u00a0любой точки",
    "мира в\u00a0любой валюте. Чем больше",
    "продуктов, тем выше скидка.",
  ],
  how3: [
    "Войдите под\u00a0логином и\u00a0паролем",
    "в\u00a0личный кабинет и\u00a0смотрите",
    "обучающие видео.",
  ],
  howAccess: ["У\u00a0каждого продукта\u00a0—", "свой срок доступа."],
  supportTitle: [
    "Если\u00a0у\u00a0вас есть вопросы\u00a0—",
    "напишите в\u00a0поддержку,",
    "и\u00a0вам помогут",
  ],
  catTexts: [
    [
      "Короткое видео с\u00a0конкретным решением/",
      "наблюдением, чтобы\u00a0по‑новому увидеть",
      "и\u00a0понять движение.",
    ],
    [
      "Подробный разбор одной темы:",
      "объяснение, демонстрация и\u00a0практика.",
    ],
    [
      "Последовательное обучение, в\u00a0котором",
      "уроки складываются в\u00a0систему и\u00a0позволяют",
      "глубже погрузиться в\u00a0тему.",
    ],
    [
      "Уникальные часовые «подсмотры»",
      "за\u00a0моими индивидуальными уроками",
      "и\u00a0глубокое погружение в\u00a0тему (в\u00a0паре",
      "с\u00a0Елизаветой Сурменелян).",
    ],
  ],
} as const;

export const homeCategories = [
  {
    type: "lifehack" as const,
    title: "Лайфхаки",
    text: "Короткое видео с конкретным решением/наблюдением, чтобы по-новому увидеть и понять движение.",
    textLines: [
      "Короткое видео с\u00a0конкретным",
      "решением/наблюдением,",
      "чтобы\u00a0по‑новому увидеть и\u00a0понять",
      "движение.",
    ],
    photo: "catLifehack",
  },
  {
    type: "lesson" as const,
    title: "Уроки",
    text: "Подробный разбор одной темы: объяснение, демонстрация и практика.",
    textLines: [
      "Подробный разбор одной темы:",
      "объяснение, демонстрация",
      "и\u00a0практика.",
    ],
    photo: "catLesson",
  },
  {
    type: "course" as const,
    title: "Курсы",
    text: "Последовательное обучение, в котором уроки складываются в систему и позволяют глубже погрузиться в тему.",
    textLines: [
      "Последовательное обучение,",
      "в\u00a0котором уроки складываются",
      "в\u00a0систему и\u00a0позволяют глубже",
      "погрузиться в\u00a0тему.",
    ],
    photo: "catCourse",
  },
  {
    type: "peek" as const,
    title: "Уроки-«подсмотры»",
    text: "Уникальные часовые «подсмотры» за моими индивидуальными уроками и глубокое погружение в тему (в паре с Елизаветой Сурменелян).",
    textLines: [
      "Уникальные часовые «подсмотры»",
      "за\u00a0моими индивидуальными уроками",
      "и\u00a0глубокое погружение в\u00a0тему",
      "(в\u00a0паре с\u00a0Елизаветой Сурменелян).",
    ],
    photo: "catResearch",
  },
] as const;

export const homeCatalogFilters = [
  { type: "lifehack" as const, label: "Лайфхаки" },
  { type: "lesson" as const, label: "Уроки" },
  { type: "course" as const, label: "Курсы" },
  { type: "peek" as const, label: "Уроки-«подсмотры»" },
] as const;

export const homeEmptyFilter = {
  lifehack: {
    title: "Лайфхаки появятся здесь",
    body: "Короткие наблюдения ещё собираются. Когда они выйдут, карточки встанут на это место — в том же ритме.",
  },
  lesson: {
    title: "Уроки появятся здесь",
    body: "Тематические разборы ещё готовятся. Пока можно выбрать курс или урок-«подсмотр».",
  },
  course: {
    title: "Курсы появятся здесь",
    body: "Последовательные программы ещё собираются. Загляните в другие форматы — или чуть позже.",
  },
  peek: {
    title: "Уроки-«подсмотры» появятся здесь",
    body: "Часовые «подсмотры» ещё готовятся. Когда они выйдут, карточки встанут сюда.",
  },
} as const;

export const homeReviews = [
  {
    name: "Кирилл Паршаков & Анна Гудыно",
    role: "Чемпионы Европы и Лучшая иностранная пара чемпионата мира 2015 года. Финалисты проекта «Dance Rеволюция» на Первом канале.",
    quote:
      "Дима внес огромный вклад в создание нашей пары, был не просто профессиональной поддержкой, но и поддерживал эмоционально. Готовил нашу пару к телевизионным проектам, концертной деятельности и конечно же сделал из нас чемпионов Европы.",
    avatar: "avatarKirill",
  },
  {
    name: "Юлия Ниазалиева",
    role: "Филолог",
    quote:
      "Занимаюсь с Дмитрием с 2017 года. Для меня он — супермегаталантливый преподаватель, маэстро, гений в танго. Его подход к каждому студенту уникален, всегда про глубину и полную самоотдачу. Горжусь быть его студентом. Восхищаюсь его креативностью, крутыми идеями, рефлексией в танце, что очень для меня важно. Дмитрий на занятии меняет твой чип, код или ген.",
    avatar: "avatarYulia",
  },
  {
    name: "Екатерина Цыброва",
    role: "Абсолютная чемпионка России 2023",
    quote:
      "Я всегда всем говорю, что именно ты меня научил танцевать танго. И я считаю, что очень даже на хорошем уровне. То, как я сейчас преподаю танго — это также твоя заслуга, то есть, моя логика построена на знаниях, которые я получила на твоих уроках. И конечно, я всегда благодарна тебе за те возможности, которые ты мне давал. А это участие и в телепроектах, и в",
    avatar: "avatarEkaterina",
  },
] as const;

const enCopy = {
  chooseVideos: "Choose training videos",
  choose: "Choose",
  look: "Watch",
  repeat: "Practice",
  dance: "Dance!",
  bubbleLook:
    "Play training videos from anywhere in the world, on any device, at a time that suits you, and break the movements down with me.",
  bubbleLookLead: "Play training videos",
  bubbleLookRest:
    " from anywhere in the world, on any device, at a time that suits you, and break the movements down with me.",
  bubbleDoLead: "Follow my step-by-step instructions",
  bubbleDoRest:
    " in the training videos, analyse your own movement, and improve your skills.",
  bubbleDanceLead: "Gather the movements",
  bubbleDanceRest: " into a beautiful dance, and move with confidence and ease!",
  approach:
    "My approach grew out of thousands of hours in studios, lessons, rehearsals, performances, and competitions.",
  approachMethod:
    "This research method grew out of thousands of hours spent in studios, lessons, rehearsals, performances, and competitions.",
  peopleLead: "But PEOPLE shaped it most of all",
  peopleRest:
    ": their questions, discoveries, difficulties, and unexpected insights.",
  directionsTitle:
    "I gathered experience, observation, and practice around 5 directions of tango research,",
  directionsSub: "that matter for dancers at any level.",
  teacherName: "Dmitry Vasin",
  teacherTitle: "World champion in Argentine tango",
  requestTitleLead: "Every dancer has their own ",
  requestTitleEm: "request",
  requestTitleMid: " and their own ",
  requestTitleGoal: "goals",
  requestBodyLead: "Some look for simple ",
  requestBodyMid: " or focused ",
  requestBodyMid2:
    ", so they can see a movement in a new way and practice it. Others want to go all the way into a topic and explore it step by step through ",
  requestOneLead: "Some look for simple ",
  lifehackWord: "lifehacks",
  requestOneMid: " or focused ",
  lessonWord: "lessons",
  requestOneTail: ", so they can see a movement in a new way and practice it.",
  requestTwoLead:
    "Others want to go all the way into a topic and explore it step by step through ",
  courseWord: "courses",
  requestBodyOr: " or ",
  peekWord: "“peek” lessons",
  developed:
    "That is why I made different training videos, so every dancer can find exactly what they need.",
  variantsLead: "Let’s look at the ",
  variantsEm: "kinds of training videos",
  variantsTail: " I have:",
  catalogTitle: "Training video catalog",
  showMore: "Show more",
  emptyTitle: "No published videos in the catalog yet",
  emptyBody:
    "As soon as lessons, courses, and lifehacks appear in the database, cards will sit here — without a layout jump.",
  emptyCta: "Open catalog",
  emptyFilterCta: "Browse the catalog",
  errorTitle: "Couldn’t load the catalog",
  errorBody: "Check your connection and open the catalog again.",
  extraLead:
    "Choose what you need right now. Combine videos and build your own learning path.",
  extraGain: "And the more you choose, the greater your benefit!",
  howTitle: "How do I pay and watch training videos?",
  how1Title: "Registration",
  how1: "Register on the site and get a confirmation email.",
  how2Title: "Payment",
  how2: "Add products to the cart and pay from anywhere in the world, in any currency. The more products you add, the higher your discount.",
  how3Title: "Access",
  how3: "Sign in to your account to watch the training videos. Each product has its own access period.",
  how4Title: "Support",
  howSupport:
    "If you have questions, contact support. My team and I will do our best to help you quickly.",
  howAccess: "Each product has its own access period.",
  supportTitle:
    "If you have questions — write to support, and we’ll help",
  supportCta: "Write to support",
  reviewsTitle: "Reviews from people who have taken my courses",
  reviewsResults:
    "And these are the results students get working with me online and offline.",
  reviewsHint: "Scroll and read →",
  reviewsSwipe: "Swipe left and right to see reviews",
  readMore: "Read more",
  readLess: "Show less",
  reviewsPrev: "Previous reviews",
  reviewsNext: "Next reviews",
  joinNow: "Join now",
} as const;

const enDirections = [
  {
    title: "Awareness",
    text: "We learn to notice not only the result, but how it comes into being.",
    photo: "dirAwareness",
  },
  {
    title: "Technique",
    text: "We figure out why some movements come easily, and others take extra effort.",
    photo: "dirTechnique",
  },
  {
    title: "Musicality",
    text: "We leave familiar musical choices behind and look for new ways to meet the music.",
    photo: "dirMusicality",
  },
  {
    title: "Connection",
    text: "We look for clearer, more precise, and more comfortable ways of moving as a couple.",
    photo: "dirInteraction",
  },
  {
    title: "Variation",
    text: "We gradually discover that there are far more ways to continue a movement than it first appears.",
    photo: "dirVariation",
  },
] as const;

const enCategories = [
  {
    type: "lifehack" as const,
    title: "Lifehacks",
    text: "A short video with a concrete solution or observation, so you can see and understand a movement in a new way.",
    photo: "catLifehack",
  },
  {
    type: "lesson" as const,
    title: "Lessons",
    text: "A detailed take on one topic: explanation, demonstration, and practice.",
    photo: "catLesson",
  },
  {
    type: "course" as const,
    title: "Courses",
    text: "Sequential learning where lessons build into a system and let you go deeper into a topic.",
    photo: "catCourse",
  },
  {
    type: "peek" as const,
    title: "“Peek” lessons",
    text: "Unique hour-long “peeks” at my private lessons and a deep dive into the topic (in partnership with Elizaveta Surmenelyan).",
    photo: "catResearch",
  },
] as const;

const enCatalogFilters = [
  { type: "lifehack" as const, label: "Lifehacks" },
  { type: "lesson" as const, label: "Lessons" },
  { type: "course" as const, label: "Courses" },
  { type: "peek" as const, label: "“Peek” lessons" },
] as const;

const enEmptyFilter = {
  lifehack: {
    title: "Lifehacks will live here",
    body: "Short observations are still being gathered. When they are ready, the cards will sit here — in the same rhythm.",
  },
  lesson: {
    title: "Lessons will live here",
    body: "Focused lessons are still being prepared. For now you can choose a course or a “peek” lesson.",
  },
  course: {
    title: "Courses will live here",
    body: "Full programmes are still being gathered. Look at the other formats — or come back a little later.",
  },
  peek: {
    title: "“Peek” lessons will live here",
    body: "Hour-long peeks are still being prepared. When they are ready, the cards will sit here.",
  },
} as const;

const enReviews = [
  {
    name: "Kirill Parshakov & Anna Gudyno",
    role: "European champions and Best Foreign Couple at the 2015 World Championship. Finalists of the “Dance Revolution” project on Channel One.",
    quote:
      "Dima made an enormous contribution to creating our partnership. He was not only professional support, but emotional support as well. He prepared us for television projects, concert work, and of course made us European champions.",
    avatar: "avatarKirill",
  },
  {
    name: "Yulia Niazalieva",
    role: "Philologist",
    quote:
      "I have been studying with Dmitry since 2017. For me he is a super-mega-talented teacher, a maestro, a genius in tango. His approach to every student is unique — always about depth and complete dedication. I am proud to be his student. I admire his creativity, brilliant ideas, and reflection in dance, which matters a great deal to me. In a lesson Dmitry changes your chip, your code, or your gene.",
    avatar: "avatarYulia",
  },
  {
    name: "Ekaterina Tsybrova",
    role: "Absolute champion of Russia 2023",
    quote:
      "I always tell everyone that you were the one who taught me to dance tango. And I believe I dance at a very good level. The way I teach tango now is also your doing — my logic is built on the knowledge I received in your lessons. And of course I am always grateful for the opportunities you gave me, including television projects and",
    avatar: "avatarEkaterina",
  },
] as const;

export type HomeCopy = {
  [K in keyof typeof homeCopy]: string;
};

export function homeT(locale: Locale = "ru") {
  if (locale === "en") {
    return {
      copy: enCopy as HomeCopy,
      directions: enDirections,
      categories: enCategories,
      filters: enCatalogFilters,
      emptyFilter: enEmptyFilter,
      reviews: enReviews,
    };
  }
  return {
    copy: homeCopy,
    directions: homeDirections,
    categories: homeCategories,
    filters: homeCatalogFilters,
    emptyFilter: homeEmptyFilter,
    reviews: homeReviews,
  };
}
