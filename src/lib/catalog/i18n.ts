import type { Locale } from "@/lib/catalog/types";

export const defaultLocale: Locale = "ru";

const ru = {
  nav: {
    home: "Главная",
    back: "Назад",
    catalog: "Каталог",
    support: "Поддержка",
    reviews: "Отзывы",
    contacts: "Контакты",
    login: "Войти",
    account: "Кабинет",
    cart: "Корзина",
    menu: "Меню",
    closeMenu: "Закрыть меню",
    langRu: "Ru",
    langEn: "En",
  },
  footer: {
    rights:
      "Все права защищены, контент сайта принадлежит\nBeTango Global LLC\nAddress: Florida, U.S.A. limited liability company with a registered agent address at 7901 4th St. N., Ste. 300, St. Petersburg, FL 33702",
    copyright: "© 2026",
    privacy: "Политика конфиденциальности",
    offer: "Договор оферты",
    dmca: "Политика DMCA (Сообщение о случаях нарушения авторских прав)",
    mailing:
      "Согласие на получение рекламной и информационной рассылки",
    telegram: "Telegram",
    vk: "VK",
    email: "Email",
  },
  ui: {
    email: "Email",
    password: "Пароль",
    passwordPlaceholder: "Введите пароль",
    showPassword: "Показать пароль",
    hidePassword: "Скрыть пароль",
  },
  empty: {
    quiet: "Этот раздел скоро появится.",
    catalog: "Каталог загружается. Карточки появятся, когда в базе будут опубликованные продукты.",
  },
  pages: {
    catalog: "Каталог обучающих видео",
    product: "Продукт",
    cart: "Корзина",
    checkout: "Оформление заказа",
    login: "Вход",
    signup: "Регистрация",
    forgotPassword: "Восстановление пароля",
    account: "Мои материалы",
    accountCourse: "Курс",
    accountWatch: "Просмотр",
    accountProfile: "Профиль",
    accountOrders: "История покупок",
    accountSupport: "Поддержка",
    accountExpired: "Доступ истек",
  },
  a11y: {
    skipToContent: "Перейти к содержимому",
    language: "Язык",
    main: "Основное содержимое",
  },
  seo: {
    siteTitle: "Дмитрий Васин. СМОТРИ. ПОВТОРЯЙ. ТАНЦУЙ!",
    siteDescription:
      "Аргентинское танго в лёгких и понятных видеоуроках, в своём темпе и в любое время, всегда в твоём смартфоне. СЛОЖНЫЕ ПРОЦЕССЫ В ТАНГО ПРОСТЫМ И ДОСТУПНЫМ ЯЗЫКОМ",
  },
  catalog: {
    all: "Все",
    filterAria: "Фильтр каталога",
    retry: "Повторить",
    allProducts: "Все продукты",
    toHome: "На главную",
    errorTitle: "Не удалось загрузить каталог",
    errorBody:
      "Попробуйте ещё раз — опубликованные продукты подтянутся из базы.",
    emptyTitle: "Каталог пока пуст",
    emptyBody:
      "Когда в базе появятся опубликованные продукты, карточки встанут сюда. Никаких заглушек с витрины.",
    emptyFilterTitle: "В этой категории пока пусто",
    emptyFilterBody:
      "Опубликованных продуктов этого типа сейчас нет. Откройте весь каталог — или загляните позже.",
    emptyLifehackTitle: "Лайфхаков пока нет",
    emptyLifehackBody:
      "Короткие находки для зала появятся здесь — без чужих обложек и фальшивых карточек. Пока можно открыть курсы, подсмотры или весь каталог.",
    emptyLessonTitle: "Уроков пока нет",
    emptyLessonBody:
      "Полные видеоуроки ещё не опубликованы. Загляните в курсы и уроки-«подсмотры» — или вернитесь ко всему каталогу.",
    peekOpens: "Откроется",
    cost: "Стоимость",
    details: "Подробнее",
    addToCart: "Добавить в корзину",
    difficulty: "Сложность",
    types: {
      lifehack: "Лайфхак",
      lesson: "Урок",
      course: "Курс",
      extra: "Доп. материал",
      research: "Исследование",
      peek: "Уроки-«подсмотры»",
    },
    filters: {
      lifehack: "Лайфхаки",
      lesson: "Уроки",
      course: "Курсы",
      extra: "Доп. материалы",
      research: "Исследование",
      peek: "Уроки-«подсмотры»",
    },
  },
  product: {
    breadcrumbAria: "Навигация",
    home: "Главная",
    back: "Назад",
    backToCatalog: "К каталогу",
    backToHome: "На главную",
    viewProgram: "Смотреть программу",
    viewDescription: "Смотреть описание",
    difficulty: "Сложность",
    cost: "Стоимость",
    inCart: "В корзине",
    addToCart: "В корзину",
    buyCourse: "Купить весь курс",
    addedOpenCart: "Добавлено в корзину — открыть корзину",
    programTitle: "Программа курса",
    courseContents: "Состав курса",
    lessons: "Уроки",
    buyBundle: "Купить курс целиком выгоднее",
    descriptionTitle: "Описание урока",
    related: "Другие обучающие видео",
    notFoundTitle: "Этот материал не найден",
    notFoundBody:
      "Страница снята с публикации или ссылка устарела. Откройте каталог — там собраны доступные уроки, курсы и лайфхаки.",
    toCatalog: "В каталог",
    access: "Доступ",
    accessUnlimited: "Доступ бессрочный",
    durationMin: "мин",
    monthShort: "мес.",
    dayShort: "дн.",
  },
  player: {
    noAccessKicker: "Нет доступа",
    noAccessTitle: "Этот урок пока недоступен",
    noAccessBody:
      "Купите материал в каталоге или войдите в аккаунт с действующим доступом.",
    catalogCta: "В каталог",
    productCta: "К карточке",
    loginCta: "Войти",
    errorKicker: "Ошибка",
    errorTitle: "Не удалось загрузить видео",
    retryCta: "Попробовать снова",
    iframeTitle: "Видео",
    loadingLabel: "Загрузка видео…",
  },
} as const;

const en = {
  nav: {
    home: "Home",
    back: "Back",
    catalog: "Catalog",
    support: "Support",
    reviews: "Reviews",
    contacts: "Contacts",
    login: "Sign in",
    account: "Account",
    cart: "Cart",
    menu: "Menu",
    closeMenu: "Close menu",
    langRu: "Ru",
    langEn: "En",
  },
  footer: {
    rights:
      "All rights reserved. Site content belongs to\nBeTango Global LLC\nAddress: Florida, U.S.A. limited liability company with a registered agent address at 7901 4th St. N., Ste. 300, St. Petersburg, FL 33702",
    copyright: "© 2026",
    privacy: "Privacy Policy",
    offer: "Offer agreement",
    dmca: "DMCA Policy (Copyright infringement notice)",
    mailing: "Consent to receive promotional and informational emails",
    telegram: "Telegram",
    vk: "VK",
    email: "Email",
  },
  ui: {
    email: "Email",
    password: "Password",
    passwordPlaceholder: "Enter password",
    showPassword: "Show password",
    hidePassword: "Hide password",
  },
  empty: {
    quiet: "This section is coming soon.",
    catalog:
      "The catalog is loading. Cards will appear when published products exist in the database.",
  },
  pages: {
    catalog: "Training video catalog",
    product: "Product",
    cart: "Cart",
    checkout: "Checkout",
    login: "Sign in",
    signup: "Sign up",
    forgotPassword: "Forgot password",
    account: "My materials",
    accountCourse: "Course",
    accountWatch: "Watch",
    accountProfile: "Profile",
    accountOrders: "Order history",
    accountSupport: "Support",
    accountExpired: "Access expired",
  },
  a11y: {
    skipToContent: "Skip to content",
    language: "Language",
    main: "Main content",
  },
  seo: {
    siteTitle: "Dmitry Vasin. WATCH. REPEAT. DANCE!",
    siteDescription:
      "Argentine tango in clear, easy video lessons — at your pace, anytime, always on your phone. COMPLEX TANGO MADE SIMPLE AND ACCESSIBLE.",
  },
  catalog: {
    all: "All",
    filterAria: "Catalog filter",
    retry: "Try again",
    allProducts: "All products",
    toHome: "Back to home",
    errorTitle: "Couldn’t load the catalog",
    errorBody:
      "Please try again — published products will load from the database.",
    emptyTitle: "The catalog is empty for now",
    emptyBody:
      "When published products appear in the database, cards will land here. No placeholder storefront.",
    emptyFilterTitle: "This category is empty for now",
    emptyFilterBody:
      "There are no published products of this type right now. Open the full catalog — or check back later.",
    emptyLifehackTitle: "No lifehacks yet",
    emptyLifehackBody:
      "Short studio finds will land here — no stock covers, no fake cards. Meanwhile, browse courses, peek lessons, or the full catalog.",
    emptyLessonTitle: "No lessons yet",
    emptyLessonBody:
      "Full video lessons are not published yet. Browse courses and “peek” lessons — or return to the full catalog.",
    peekOpens: "Opens",
    cost: "Price",
    details: "Details",
    addToCart: "Add to cart",
    difficulty: "Difficulty",
    types: {
      lifehack: "Lifehack",
      lesson: "Lesson",
      course: "Course",
      extra: "Extra material",
      research: "Research",
      peek: "“Peek” lessons",
    },
    filters: {
      lifehack: "Lifehacks",
      lesson: "Lessons",
      course: "Courses",
      extra: "Extra materials",
      research: "Research",
      peek: "“Peek” lessons",
    },
  },
  product: {
    breadcrumbAria: "Breadcrumb",
    home: "Home",
    back: "Back",
    backToCatalog: "To catalog",
    backToHome: "To home",
    viewProgram: "View program",
    viewDescription: "View description",
    difficulty: "Difficulty",
    cost: "Price",
    inCart: "In cart",
    addToCart: "Add to cart",
    buyCourse: "Buy full course",
    addedOpenCart: "Added to cart — open cart",
    programTitle: "Course program",
    courseContents: "Course contents",
    lessons: "Lessons",
    buyBundle: "Buying the full course is a better value",
    descriptionTitle: "Lesson description",
    related: "More training videos",
    notFoundTitle: "This material was not found",
    notFoundBody:
      "The page is unpublished or the link is out of date. Open the catalog for available lessons, courses, and lifehacks.",
    toCatalog: "To catalog",
    access: "Access",
    accessUnlimited: "Unlimited access",
    durationMin: "min",
    monthShort: "mo.",
    dayShort: "d.",
  },
  player: {
    noAccessKicker: "No access",
    noAccessTitle: "This lesson is not available yet",
    noAccessBody:
      "Buy the material in the catalog or sign in with an account that has active access.",
    catalogCta: "To catalog",
    productCta: "To product",
    loginCta: "Sign in",
    errorKicker: "Error",
    errorTitle: "Couldn’t load the video",
    retryCta: "Try again",
    iframeTitle: "Video",
    loadingLabel: "Loading video…",
  },
} as const;

export const catalogCopy = { ru, en };

type DeepString<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepString<T[K]>;
};

export type CatalogCopy = DeepString<typeof ru>;

export function catalogT(locale: Locale = defaultLocale): CatalogCopy {
  return locale === "en" ? en : ru;
}
