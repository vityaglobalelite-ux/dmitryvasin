import type { Locale } from "@/lib/catalog/types";

const ru = {
  label: "Уведомления",
  empty: "Пока нет уведомлений",
  error: "Не получилось загрузить уведомления",
  supportUnread: "есть ответ поддержки",
  toastTitle: "Поддержка ответила",
  toastBody: "Откройте чат, чтобы прочитать",
} as const;

const en = {
  label: "Notifications",
  empty: "No notifications yet",
  error: "Couldn’t load notifications",
  supportUnread: "support replied",
  toastTitle: "Support replied",
  toastBody: "Open the chat to read it",
} as const;

export type NotificationCopy = { [K in keyof typeof ru]: string };

export function notificationT(locale: Locale): NotificationCopy {
  return locale === "en" ? en : ru;
}
