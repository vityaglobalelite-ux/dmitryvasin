import type { Locale } from "@/lib/catalog/types";

const ru = {
  title: "Поддержка",
  lede: "Можно писать без регистрации — даже до покупки. Ответ появится в этом чате.",
  emptyTitle: "Напишите нам — ответим здесь",
  emptyBody:
    "Вопрос об уроке, доступе или оплате. Можно прикрепить скриншот или файл.",
  errorTitle: "Не получилось загрузить переписку",
  errorBody: "Проверьте соединение и попробуйте ещё раз.",
  retry: "Повторить",
  placeholder: "Сообщение",
  attach: "Файл",
  preparing: "Готовим изображение…",
  send: "Отправить",
  sending: "Отправка…",
  you: "Вы",
  agent: "Поддержка",
  fileTooLarge: "Файл больше 12 МБ — выберите файл поменьше.",
  sendError: "Не получилось отправить. Проверьте интернет и попробуйте ещё раз.",
  sendErrorAuth: "Сессия истекла. Обновите страницу и отправьте сообщение снова.",
  sendErrorEmpty: "Файл пустой. Выберите другой.",
  openPhoto: "Открыть фото",
  closePhoto: "Закрыть",
  removeFile: "Убрать файл",
  download: "Скачать",
  composerNeedContent: "Напишите сообщение или прикрепите файл.",
  deliveryPending: "Отправляем…",
  deliveryFailed: "Не доставлено",
  deliveryRetry: "Повторить",
  backToAccount: "В кабинет",
  sendErrorGuest:
    "Не получилось открыть диалог. Обновите страницу и попробуйте ещё раз.",
} as const;

const en = {
  title: "Support",
  lede: "You can write without signing up — even before you buy. The reply will appear in this chat.",
  emptyTitle: "Write to us — we’ll reply here",
  emptyBody:
    "A question about a lesson, access, or payment. You can attach a screenshot or a file.",
  errorTitle: "Couldn’t load the conversation",
  errorBody: "Check your connection and try again.",
  retry: "Try again",
  placeholder: "Message",
  attach: "File",
  preparing: "Preparing image…",
  send: "Send",
  sending: "Sending…",
  you: "You",
  agent: "Support",
  fileTooLarge: "The file is over 12 MB — choose a smaller one.",
  sendError: "Couldn’t send. Check your connection and try again.",
  sendErrorAuth: "The session expired. Refresh the page and send again.",
  sendErrorEmpty: "The file is empty. Choose another one.",
  openPhoto: "Open photo",
  closePhoto: "Close",
  removeFile: "Remove file",
  download: "Download",
  composerNeedContent: "Write a message or attach a file.",
  deliveryPending: "Sending…",
  deliveryFailed: "Not delivered",
  deliveryRetry: "Retry",
  backToAccount: "Account",
  sendErrorGuest:
    "Couldn’t open the conversation. Refresh the page and try again.",
};

export type SupportCopy = { [K in keyof typeof ru]: string };

export function supportT(locale: Locale): SupportCopy {
  return locale === "en" ? en : ru;
}

/** @deprecated use supportT(locale) */
export const supportCopy = ru;
