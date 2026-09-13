import type { Locale } from "@/lib/catalog/types";

/** Static marketing copy from Figma home 572:1864 / 722:4311. */
export const homeCopy = {
  chooseVideos: "Выбрать обучающие видео",
  choose: "Выбрать",
  look: "Смотри.",
  repeat: "Повторяй.",
  dance: "Танцуй!",
  bubbleLook:
    "Включай обучающие видео из любой точки мира, с любого гаджета и разбирай движения вместе со мной.",
  bubbleLookLead: "Включай обучающие видео",
  bubbleLookRest:
    " из любой точки мира, с любого гаджета и разбирай движения вместе со мной.",
  bubbleDoLead: "Выполняй движения",
  bubbleDoRest: " шаг за шагом, последовательно и анализируя.",
  bubbleDanceLead: "Собирай движения в танец",
  bubbleDanceRest: " и двигайся уверенно и в удовольствие!",
  approach:
    "Мой подход появился благодаря тысячам часов в студиях, на уроках, репетициях, выступлениях и соревнованиях.",
  peopleLead: "Но больше всего на него повлияли ЛЮДИ",
  peopleRest: ": их вопросы, открытия, трудности и неожиданные инсайты.",
  directionsTitle:
    "Я собрал опыт, наблюдения и практику вокруг 5 направлений исследования танго,",
  directionsSub:
    "которые становятся ключевыми для танцоров — независимо от уровня.",
  teacherName: "Дмитрий Васин",
  teacherTitle: "Чемпион мира по аргентинскому танго",
  requestTitleLead: "У каждого танцора — ",
  requestTitleEm: "свой запрос",
  requestBodyLead: "И иногда достаточно простого ",
  lifehackWord: "лайфхака",
  requestBodyMid: " или тематического ",
  lessonWord: "урока",
  requestBodyMid2:
    ", чтобы иначе увидеть и попрактиковать движение. А иногда — погрузиться в тему целиком и исследовать её шаг за шагом через ",
  courseWord: "курс",
  requestBodyOr: " или ",
  researchWord: "исследование.",
  catalogTitle: "Каталог обучающих видео",
  showMore: "Показать ещё",
  emptyTitle: "В каталоге пока нет опубликованных видео",
  emptyBody:
    "Как только уроки, курсы и лайфхаки появятся в базе, карточки встанут на это место — без скачка сетки.",
  emptyCta: "Открыть каталог",
  errorTitle: "Не удалось загрузить каталог",
  errorBody: "Проверьте соединение и откройте каталог ещё раз.",
  extraLead:
    "Выбирайте то, что нужно вам сейчас. Комбинируйте видео и собирайте собственный путь обучения.",
  extraGain: "И чем больше вы выбираете, тем больше ваша выгода!",
  howTitle: "Как оплатить и смотреть обучающие видео?",
  how1: "Регистрируетесь на сайте и получаете подтверждение на email.",
  how2: "Добавляете продукты в корзину и оплачиваете из любой точки мира в любой валюте. Больше продуктов — автоматически выше скидка.",
  how3: "Заходите под логином и паролем в личный кабинет и смотрите обучающие видео.",
  howSupport: "Если есть вопросы — обращаетесь в поддержку.",
  howAccess: "У каждого продукта — свой срок доступа.",
  supportTitle:
    "Если у вас есть вопросы — напишите в поддержку, и вам помогут",
  supportCta: "Написать в поддержку",
  reviewsTitle: "Отзывы участников",
  reviewsResults:
    "А вот такие результаты получают ученики, работая со мной в онлайн и оффлайн.",
  reviewsHint: "Листайте и читайте →",
  reviewsSwipe: "Листайте вправо-влево, чтобы посмотреть отзывы",
  readMore: "Читать далее",
  readLess: "Свернуть",
  joinNow: "Присоединиться сейчас",
} as const;

export const homeDirections = [
  {
    title: "Осознавание",
    text: "Учимся замечать не только результат, но и то, как он возникает.",
    photo: "dirAwareness",
  },
  {
    title: "Техника",
    text: "Разбираемся, почему одни движения получаются легко, а другие требуют лишних усилий.",
    photo: "dirTechnique",
  },
  {
    title: "Музыкальность",
    text: "Уходим от привычных музыкальных решений и ищем новые способы взаимодействия с музыкой.",
    photo: "dirMusicality",
  },
  {
    title: "Взаимодействие",
    text: "Ищем более понятные, точные и комфортные способы взаимодействия в паре.",
    photo: "dirInteraction",
  },
  {
    title: "Вариативность",
    text: "Постепенно обнаруживаем, что вариантов продолжения движения гораздо больше, чем кажется на первый взгляд.",
    photo: "dirVariation",
  },
] as const;

export const homeCategories = [
  {
    type: "lifehack" as const,
    title: "Лайфхаки",
    text: "Короткое видео с конкретным решением/наблюдением, чтобы по-новому увидеть и понять движение.",
    photo: "catLifehack",
  },
  {
    type: "lesson" as const,
    title: "Уроки",
    text: "Подробный разбор одной темы: объяснение, демонстрация и практика.",
    photo: "catLesson",
  },
  {
    type: "course" as const,
    title: "Курсы",
    text: "Последовательное обучение, в котором уроки складываются в систему и позволяют глубже погрузиться в тему.",
    photo: "catCourse",
  },
  {
    type: "research" as const,
    title: "Исследования",
    text: "Уникальные часовые «подсмотры» за моими индивидуальными уроками и глубокое погружение в тему (в паре с Елизаветой Сурменелян).",
    photo: "catResearch",
  },
] as const;

export const homeCatalogFilters = [
  { type: "lifehack" as const, label: "Лайфхаки" },
  { type: "lesson" as const, label: "Уроки" },
  { type: "course" as const, label: "Курсы" },
  { type: "peek" as const, label: "Уроки-«подсмотры»" },
] as const;

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
  look: "Watch.",
  repeat: "Repeat.",
  dance: "Dance!",
  bubbleLook:
    "Play training videos from anywhere in the world, on any device, and break down the movement with me.",
  bubbleLookLead: "Play training videos",
  bubbleLookRest:
    " from anywhere in the world, on any device, and break down the movement with me.",
  bubbleDoLead: "Do the movements",
  bubbleDoRest: " step by step, in sequence, and with analysis.",
  bubbleDanceLead: "Gather the movements into a dance",
  bubbleDanceRest: " and move with confidence and pleasure!",
  approach:
    "My approach grew out of thousands of hours in studios, lessons, rehearsals, performances, and competitions.",
  peopleLead: "But PEOPLE shaped it most of all",
  peopleRest:
    ": their questions, discoveries, difficulties, and unexpected insights.",
  directionsTitle:
    "I gathered experience, observation, and practice around 5 directions of tango research,",
  directionsSub:
    "that become essential for dancers — regardless of level.",
  teacherName: "Dmitry Vasin",
  teacherTitle: "World champion in Argentine tango",
  requestTitleLead: "Every dancer has ",
  requestTitleEm: "their own request",
  requestBodyLead: "And sometimes a simple ",
  lifehackWord: "lifehack",
  requestBodyMid: " or a focused ",
  lessonWord: "lesson",
  requestBodyMid2:
    " is enough to see and practice a movement differently. And sometimes — to go all the way into a topic, step by step, through a ",
  courseWord: "course",
  requestBodyOr: " or ",
  researchWord: "research.",
  catalogTitle: "Training video catalog",
  showMore: "Show more",
  emptyTitle: "No published videos in the catalog yet",
  emptyBody:
    "As soon as lessons, courses, and lifehacks appear in the database, cards will sit here — without a layout jump.",
  emptyCta: "Open catalog",
  errorTitle: "Couldn’t load the catalog",
  errorBody: "Check your connection and open the catalog again.",
  extraLead:
    "Choose what you need right now. Combine videos and build your own learning path.",
  extraGain: "And the more you choose, the greater your benefit!",
  howTitle: "How do I pay and watch training videos?",
  how1: "You register on the site and receive a confirmation email.",
  how2: "You add products to the cart and pay from anywhere in the world, in any currency. More products — a higher discount, automatically.",
  how3: "You sign in with your login and password and watch training videos in your account.",
  howSupport: "If you have questions — you write to support.",
  howAccess: "Each product has its own access period.",
  supportTitle:
    "If you have questions — write to support, and we’ll help",
  supportCta: "Write to support",
  reviewsTitle: "Participant reviews",
  reviewsResults:
    "And these are the results students get working with me online and offline.",
  reviewsHint: "Scroll and read →",
  reviewsSwipe: "Swipe left and right to see reviews",
  readMore: "Read more",
  readLess: "Show less",
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
    type: "research" as const,
    title: "Research",
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
      reviews: enReviews,
    };
  }
  return {
    copy: homeCopy,
    directions: homeDirections,
    categories: homeCategories,
    filters: homeCatalogFilters,
    reviews: homeReviews,
  };
}
