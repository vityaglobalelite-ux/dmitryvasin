import type { Locale } from "@/lib/catalog/types";

const ru = {
  programLead:
    "Вы можете купить любой блок отдельно либо весь курс",
  programLeadBlock:
    "Этот блок — цельная программа. Весь курс выгоднее, если нужны оба блока.",
  blockOnly: "Только этот блок",
  blockLabel: "Блок {n}",
  outcomes: "Что вы получите",
  lessons: "Уроки",
  separateBlocks: "Если покупать блоки по отдельности",
  programSoonTitle: "Программа появится",
  programSoonBody:
    "Состав уроков этого курса ещё собираем. Страница уже живая — программа появится здесь, в том же ритме, что и у остальных курсов.",
  viewFullCourse: "Смотреть весь курс",
  peekOpens: "Откроется",
  peekOpensNote: "Просмотр откроется {date}. Купить можно сейчас.",
  priceLater: "Цена появится позже",
  coverDot: "Кадр {n}",
  coverPrev: "Предыдущий кадр",
  coverNext: "Следующий кадр",
  lessonClips: "Кадры урока",
} as const;

const en = {
  programLead: "You can buy any block separately or the full course",
  programLeadBlock:
    "This block is a complete program. The full course is a better value if you want both blocks.",
  blockOnly: "This block only",
  blockLabel: "Block {n}",
  outcomes: "What you get",
  lessons: "Lessons",
  separateBlocks: "If you buy the blocks separately",
  programSoonTitle: "The program will appear here",
  programSoonBody:
    "We’re still assembling the lessons for this course. This page is live — the syllabus will land here, in the same rhythm as our other courses.",
  viewFullCourse: "View the full course",
  peekOpens: "Opens",
  peekOpensNote: "Watching opens {date}. You can buy it now.",
  priceLater: "Price coming soon",
  coverDot: "Frame {n}",
  coverPrev: "Previous frame",
  coverNext: "Next frame",
  lessonClips: "Lesson clips",
} as const;

export type ProductUiCopy = { [K in keyof typeof ru]: string };

export function productUi(locale: Locale): ProductUiCopy {
  return locale === "en" ? en : ru;
}

export function formatPeekUnlockDate(iso: string, locale: Locale): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "ru-RU", {
    day: "numeric",
    month: "long",
    timeZone: "Europe/Moscow",
  }).format(date);
}
