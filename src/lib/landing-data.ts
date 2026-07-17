import { landingAssets } from "./landing-assets";

export const navLinks = [
  { label: "О клубе", href: "#about" },
  { label: "Программа", href: "#program" },
  { label: "Тарифы", href: "#tariffs" },
  { label: "Контакты", href: "#contacts" },
] as const;

export const heroQuestions = [
  "Почему одно и то же движение сегодня получается легко, а завтра словно исчезает?",
  "Почему некоторые пары выглядят настолько естественно и свободно, хотя внешне делают совсем немного?",
  "Почему с одним партнёром взаимодействие возникает почти сразу, а с другим приходится постоянно искать общий язык?",
  "Почему в знакомой музыке иногда открывается целый мир новых возможностей, а иногда всё снова сводится к привычным решениям?",
  "И почему чем больше узнаёте о танце, тем больше появляется новых вопросов?",
] as const;

export const heroDirections = [
  { label: "Осознавание", icon: landingAssets.icons.directionAwareness },
  { label: "Техника", icon: landingAssets.icons.directionTechnique },
  { label: "Вариативность", icon: landingAssets.icons.directionVariability },
  { label: "Взаимодействие", icon: landingAssets.icons.directionInteraction },
  { label: "Музыкальность", icon: landingAssets.icons.directionMusicality },
] as const;

export const marqueeQuestions = [
  "Куда идти?",
  "Как сохранить баланс?",
  "Что происходит в музыке?",
  "Что делает партнёр?",
  "Как это выглядит со стороны?",
] as const;

export const directions = [
  {
    title: "Осознавание",
    description:
      "Учимся замечать не только результат, но и то, как он возникает.",
    icon: landingAssets.icons.directionAwareness,
    illustration: landingAssets.illustrations.awareness3d,
    position: "left-top" as const,
  },
  {
    title: "Техника",
    description:
      "Разбираемся, почему одни движения получаются легко, а другие требуют лишних усилий",
    icon: landingAssets.icons.directionTechnique,
    position: "left-bottom" as const,
  },
  {
    title: "Музыкальность",
    description:
      "Уходим от привычных музыкальных решений и ищем новые способы взаимодействия с музыкой.",
    icon: landingAssets.icons.directionMusicality,
    position: "right-top" as const,
  },
  {
    title: "Взаимодействие",
    description:
      "Ищем более понятные, точные и комфортные способы взаимодействия в паре.",
    icon: landingAssets.icons.directionInteraction,
    position: "right-mid" as const,
  },
  {
    title: "Вариативность",
    description:
      "Постепенно обнаруживаем, что вариантов продолжения движения гораздо больше, чем кажется на первый взгляд.",
    icon: landingAssets.icons.directionVariability,
    position: "right-bottom" as const,
  },
] as const;

export type SkillKey =
  | "awareness"
  | "technique"
  | "variability"
  | "interaction"
  | "musicality";

export const skills: {
  key: SkillKey;
  label: string;
  icon: string;
}[] = [
  { key: "awareness", label: "Осознавание", icon: landingAssets.icons.brainSparkleSm },
  { key: "technique", label: "Техника", icon: landingAssets.icons.footprint },
  { key: "variability", label: "Вариативность", icon: landingAssets.icons.shuffle },
  { key: "interaction", label: "Взаимодействие", icon: landingAssets.icons.couple },
  { key: "musicality", label: "Музыкальность", icon: landingAssets.icons.shoeProgress },
];

export type LessonNode = {
  id: number;
  title: string;
  skills: { label: string; delta: number }[];
  icon?: string;
};

export type LessonDetail = {
  id: number;
  number: string;
  title: string;
  direction: string;
  directionIcon: string;
  body: string;
  explore: string[];
};

export const programMonths = [
  {
    id: 1,
    label: "Месяц 1",
    programTitle: "Программа месяца 1",
    nodes: [
      { id: 1, title: "Танец начинается не в зале", skills: [{ label: "Осознавание", delta: 1 }] },
      { id: 2, title: "Между двумя ногами", skills: [{ label: "Техника", delta: 1 }, { label: "Вариативность", delta: 1 }] },
      { id: 3, title: "Один шаг — три характера", skills: [{ label: "Техника", delta: 1 }] },
      { id: 4, title: "Не создавать, а направлять", skills: [{ label: "Взаимодействие", delta: 1 }, { label: "Музыкальность", delta: 1 }] },
      { id: 5, title: "Кто отвечает за поворот?", skills: [{ label: "Взаимодействие", delta: 1 }] },
      { id: 6, title: "Когда связь становится видимой", skills: [{ label: "Взаимодействие", delta: 1 }] },
      { id: 7, title: "Открывая пространство", skills: [{ label: "Взаимодействие", delta: 1 }] },
      { id: 8, title: "Сила слабой доли", skills: [{ label: "Музыкальность", delta: 1 }] },
    ] satisfies LessonNode[],
    lessons: [
      {
        id: 1,
        number: "Урок 1",
        title: "Танец начинается не в зале",
        direction: "Осознавание",
        directionIcon: landingAssets.icons.brainSparkleSm,
        body: "Прежде чем мы начнём исследовать технику, музыкальность, взаимодействие и вариативность, я предлагаю посмотреть немного глубже. Большинство из нас приходит в танго уже с готовым телом. За плечами годы привычек, работы, стресса, спорта или малоподвижного образа жизни. Всё это влияет на то, как мы двигаемся и взаимодействуем с окружающим миром. В этом уроке мы поговорим о том, почему танец невозможно отделить от повседневной жизни и почему изменения часто начинаются не с попытки двигаться лучше, а с умения замечать то, что происходит прямо сейчас.",
        explore: [
          "связь повседневной жизни и танца",
          "влияние привычек на движение",
          "внимание как инструмент обучения",
          "осознавание вместо копирования",
        ],
      },
      { id: 2, number: "Урок 2", title: "Между двумя ногами", direction: "Техника", directionIcon: landingAssets.icons.footprint, body: "", explore: [] },
      { id: 3, number: "Урок 3", title: "Один шаг — три характера", direction: "Техника", directionIcon: landingAssets.icons.footprint, body: "", explore: [] },
      { id: 4, number: "Урок 4", title: "Не создавать, а направлять", direction: "Взаимодействие", directionIcon: landingAssets.icons.couple, body: "", explore: [] },
      { id: 5, number: "Урок 5", title: "Кто отвечает за поворот?", direction: "Взаимодействие", directionIcon: landingAssets.icons.couple, body: "", explore: [] },
      { id: 6, number: "Урок 6", title: "Когда связь становится видимой", direction: "Взаимодействие", directionIcon: landingAssets.icons.couple, body: "", explore: [] },
      { id: 7, number: "Урок 7", title: "Открывая пространство", direction: "Взаимодействие", directionIcon: landingAssets.icons.couple, body: "", explore: [] },
      { id: 8, number: "Урок 8", title: "Сила слабой доли", direction: "Музыкальность", directionIcon: landingAssets.icons.shoeProgress, body: "", explore: [] },
    ] satisfies LessonDetail[],
    progress: { awareness: 10, technique: 8, variability: 6, interaction: 12, musicality: 5 },
  },
  {
    id: 2,
    label: "Месяц 2",
    programTitle: "Программа месяца 2",
    nodes: [
      { id: 9, title: "Урок 9", skills: [{ label: "Техника", delta: 1 }] },
      { id: 10, title: "Урок 10", skills: [{ label: "Музыкальность", delta: 1 }] },
      { id: 11, title: "Урок 11", skills: [{ label: "Вариативность", delta: 1 }] },
      { id: 12, title: "Урок 12", skills: [{ label: "Осознавание", delta: 1 }] },
    ],
    lessons: [
      { id: 9, number: "Урок 9", title: "Урок 9", direction: "Техника", directionIcon: landingAssets.icons.footprint, body: "", explore: [] },
      { id: 10, number: "Урок 10", title: "Урок 10", direction: "Музыкальность", directionIcon: landingAssets.icons.shoeProgress, body: "", explore: [] },
      { id: 11, number: "Урок 11", title: "Урок 11", direction: "Вариативность", directionIcon: landingAssets.icons.shuffle, body: "", explore: [] },
      { id: 12, number: "Урок 12", title: "Урок 12", direction: "Осознавание", directionIcon: landingAssets.icons.brainSparkleSm, body: "", explore: [] },
    ],
    progress: { awareness: 12, technique: 14, variability: 10, interaction: 8, musicality: 11 },
  },
  {
    id: 3,
    label: "Месяц 3",
    programTitle: "Программа месяца 3",
    nodes: [
      { id: 13, title: "Урок 13", skills: [{ label: "Взаимодействие", delta: 1 }] },
      { id: 14, title: "Урок 14", skills: [{ label: "Осознавание", delta: 1 }] },
      { id: 15, title: "Урок 15", skills: [{ label: "Техника", delta: 1 }] },
      { id: 16, title: "Урок 16", skills: [{ label: "Музыкальность", delta: 1 }] },
    ],
    lessons: [
      { id: 13, number: "Урок 13", title: "Урок 13", direction: "Взаимодействие", directionIcon: landingAssets.icons.couple, body: "", explore: [] },
      { id: 14, number: "Урок 14", title: "Урок 14", direction: "Осознавание", directionIcon: landingAssets.icons.brainSparkleSm, body: "", explore: [] },
      { id: 15, number: "Урок 15", title: "Урок 15", direction: "Техника", directionIcon: landingAssets.icons.footprint, body: "", explore: [] },
      { id: 16, number: "Урок 16", title: "Урок 16", direction: "Музыкальность", directionIcon: landingAssets.icons.shoeProgress, body: "", explore: [] },
    ],
    progress: { awareness: 6, technique: 8, variability: 5, interaction: 7, musicality: 6 },
  },
] as const;

/* Figma 249:2070 — Regular + SemiBold акценты */
export const outcomesChecklist: { parts: { t: string; bold?: boolean }[] }[] =
  [
    {
      parts: [
        { t: "лучше понимаете,", bold: true },
        { t: " почему движение получается или\u00a0не\u00a0получается;" },
      ],
    },
    {
      parts: [
        { t: "легче замечаете свои привычки и\u00a0" },
        { t: "находите новые варианты движения; ", bold: true },
      ],
    },
    {
      parts: [
        { t: "начинаете слышать в\u00a0знакомой музыке " },
        {
          t: "больше возможностей для\u00a0импровизации;",
          bold: true,
        },
      ],
    },
    {
      parts: [
        { t: "яснее чувствуете взаимодействие ", bold: true },
        { t: "с\u00a0разными партнёрами;" },
      ],
    },
    {
      parts: [
        { t: "меньше зависите от\u00a0заученных схем и\u00a0чаще " },
        { t: "принимаете решения прямо в\u00a0танце;", bold: true },
      ],
    },
    {
      parts: [
        { t: "начинаете видеть связи", bold: true },
        {
          t: " между\u00a0техникой, музыкальностью и\u00a0взаимодействием;",
        },
      ],
    },
    {
      parts: [
        { t: "получаете " },
        { t: "больше свободы", bold: true },
        { t: " в\u00a0знакомых движениях;" },
      ],
    },
    {
      parts: [
        { t: "по‑другому смотрите", bold: true },
        { t: " на\u00a0процесс обучения и\u00a0развития в\u00a0танго." },
      ],
    },
  ];

export const tariffs = [
  {
    id: 1,
    badge: "Тариф 1",
    title: "Тест-драйв",
    duration: "1 месяц участия",
    features: [
      "Доступ к материалам текущего месяца",
      "Закрытый Telegram-чат",
      "Возможность задавать вопросы",
      "Возможность продлить участие",
    ],
    price: "1 000 ₽",
    oldPrice: "1 000 ₽",
  },
  {
    id: 2,
    badge: "Тариф 2",
    title: "Полное исследование",
    duration: "90 дней участия",
    features: [
      "Все материалы программы",
      "Закрытый Telegram-чат",
      "Возможность задавать вопросы",
      "Доступ к материалам ещё 30 дней после завершения",
    ],
    price: "1 000 ₽",
    oldPrice: "1 000 ₽",
  },
  {
    id: 3,
    badge: "Тариф 3",
    title: "VIP-исследование",
    duration: "90 дней участия + 2 индивидуальных онлайн-занятия со мной",
    features: [
      "Все материалы программы",
      "Закрытый Telegram-чат",
      "Возможность задавать вопросы",
      "Доступ к материалам ещё 30 дней после завершения",
      "2 персональных онлайн-занятия со мной в согласованное время",
    ],
    price: "1 000 ₽",
    oldPrice: "1 000 ₽",
  },
] as const;

export const paymentSteps = [
  {
    step: 1,
    title: "Нажмите «ОПЛАТИТЬ» или «ПРИСОЕДИНИТЬСЯ»",
  },
  {
    step: 2,
    title: "Перейдите в Telegram-бот,",
  },
  {
    step: 3,
    title: "Выберите тариф и удобную валюту оплаты.",
  },
  {
    step: 4,
    title:
      "Сразу после оплаты вы получите ссылку на вход в закрытый Telegram-чат исследования.",
  },
] as const;

export const reviews = [
  {
    name: "Кирилл Паршаков & Анна Гудыно",
    role: "Чемпионы Европы и Лучшая иностранная пара чемпионата мира 2015 года. Финалисты проекта «Dance Rеволюция» на Первом канале.",
    photo: landingAssets.reviews.kirillAnna,
    quote:
      "Дима внес огромный вклад в создание нашей пары, был не просто профессиональной поддержкой, но и поддерживал эмоционально. Готовил нашу пару к телевизионным проектам, концертной деятельности и конечно же сделал из нас чемпионов Европы. ",
    fullQuote:
      "Дима внес огромный вклад в создание нашей пары, был не просто профессиональной поддержкой, но и поддерживал эмоционально. Готовил нашу пару к телевизионным проектам, концертной деятельности и конечно же сделал из нас чемпионов Европы. Это профессионал с большой буквы, доверие и его мнение всегда, всегда было важно для нашей пары. Очень редкое сплетение качеств, тренер, организатор, четкость, ответственность, творческий на 999%, и конечно прекрасный человек и друг. Огромное удовольствие и благодарность, что жизнь дала возможность поработать с таким человеком, спасибо большое!!!!",
  },
  {
    name: "Юлия Ниазалиева",
    role: "Филолог",
    photo: landingAssets.reviews.yulia,
    quote:
      "Занимаюсь с Дмитрием с 2017 года. Для меня он - супермегаталантливый преподаватель, маэстро, гений в танго. Его подход к каждому студенту уникален, всегда про глубину и полную самоотдачу. Горжусь быть его студентом. Восхищаюсь его креативностью, крутыми идеями, рефлексией в танце, что очень для меня важно. Дмитрий на занятии меняет твой чип, код или ген, ",
    fullQuote:
      "Занимаюсь с Дмитрием с 2017 года. Для меня он - супермегаталантливый преподаватель, маэстро, гений в танго. Его подход к каждому студенту уникален, всегда про глубину и полную самоотдачу. Горжусь быть его студентом. Восхищаюсь его креативностью, крутыми идеями, рефлексией в танце, что очень для меня важно. Дмитрий на занятии меняет твой чип, код или ген, если хотите, настраивает на нужную танго-волну, после чего ты чувствуешь себя богиней танца и выдаешь 100% результат!",
  },
  {
    name: "Екатерина Цыброва",
    role: "Абсолютная чемпионка России 2023",
    photo: landingAssets.reviews.ekaterina,
    quote:
      "Я всегда всем говорю, что именно ты меня научил танцевать танго. И я считаю, что очень даже на хорошем уровне. То, как я сейчас преподаю танго - это также твоя заслуга, то есть, моя логика построена на знаниях, которые я получила на твоих уроках. И конечно, я всегда благодарна тебе за те возможности, которые ты мне давал. А это участие и в телепроектах, и в ",
    fullQuote:
      "Я всегда всем говорю, что именно ты меня научил танцевать танго. И я считаю, что очень даже на хорошем уровне. То, как я сейчас преподаю танго - это также твоя заслуга, то есть, моя логика построена на знаниях, которые я получила на твоих уроках. И конечно, я всегда благодарна тебе за те возможности, которые ты мне давал. А это участие и в телепроектах, и в спектаклях, и в концертах. Спасибо за то, что так научил танцевать, что чемпионы мира на милонгах меня кабесеют и танцуют ни один раз на разных милонгах!",
  },
] as const;

export const footerLinks = [
  "Политика конфиденциальности",
  "Договор оферты",
  "Согласие на получение рекламной и информационной рассылки",
] as const;

export const socialLinks = [
  { icon: landingAssets.social.instagram, href: "#", label: "Instagram" },
  { icon: landingAssets.social.telegram, href: "#", label: "Telegram" },
  { icon: landingAssets.social.vk, href: "#", label: "VK" },
  { icon: landingAssets.social.facebook, href: "#", label: "Facebook" },
  { icon: landingAssets.social.email, href: "#", label: "Email" },
  { icon: landingAssets.social.youtube, href: "#", label: "YouTube" },
  { icon: landingAssets.social.whatsapp, href: "#", label: "WhatsApp" },
] as const;

/** Price increase countdown target */
export const countdownTarget = new Date("2026-07-25T00:00:00+03:00");
