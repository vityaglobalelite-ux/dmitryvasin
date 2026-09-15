import type { Locale } from "@/lib/catalog/types";

const ru = {
  breadcrumbHome: "Главная",
  breadcrumbCart: "Корзина",
  breadcrumbCheckout: "Оформление",
  title: "Корзина",
  subtitle: "Проверьте выбранные видео и оформите заказ",
  backDesktop: "Вернуться к покупкам",
  backMobile: "Назад",
  chooseVideos: "Выбрать видео",
  bannerDesktop: "Чем больше видео покупаете — тем выше выгода!",
  bannerMobile: "И чем больше вы выбираете, тем больше ваша выгода!",
  remove: "Удалить",
  totalsTitle: "Итого",
  subtotal: "Сумма",
  discount: "Скидка",
  payable: "К оплате",
  checkoutGuest: "Войти и оформить заказ",
  checkoutSigned: "Оформить заказ",
  paySigned: "Оплатить",
  payTrust: "Оплата защищена Stripe. Данные карты на сайт не попадают.",
  payRedirectTitle: "Открываем защищённую оплату",
  payRedirectBody: "Сейчас откроется форма Stripe. Карта обрабатывается у них, не у нас.",
  checkoutCanceledTitle: "Оплата не завершена",
  checkoutCanceledBody:
    "Ничего не списалось. Состав заказа на месте — можно оплатить снова.",
  emptyTitle: "Корзина пуста",
  emptyBody: "Добавьте товары, чтобы оформить заказ",
  unavailableTitle: "Товар недоступен",
  errorTitle: "Не удалось загрузить корзину",
  errorBody: "Попробуйте ещё раз — позиции подтянутся из сохранённой корзины.",
  retry: "Повторить",
  modalTitle: "Чем больше видео покупаете — тем выше выгода!",
  modalBody:
    "Добавьте ещё обучающие видео в заказ — скидка считается по числу разных позиций.",
  modalClose: "Закрыть",
  modalContinue: "Продолжить выбор",
  checkoutTitle: "Оформление заказа",
  checkoutSubtitle: "Проверьте состав заказа и перейдите к оплате",
  checkoutEmptyTitle: "В заказе пока ничего нет",
  checkoutEmptyBody: "Вернитесь в каталог, выберите видео и оформите заказ.",
  payPending: "Переходим к оплате…",
  payErrorTitle: "Не удалось начать оплату",
  payErrorFallback: "Не удалось начать оплату. Попробуйте ещё раз.",
  checkoutProcessingTitle: "Подтверждаем оплату",
  checkoutProcessingBody:
    "Ждём ответ от банка и Stripe. Обычно это занимает до минуты.",
  checkoutProcessingTimeoutTitle: "Оплата ещё обрабатывается",
  checkoutProcessingTimeoutBody:
    "Если списание прошло, материалы появятся в кабинете чуть позже. Проверьте «Историю покупок» или обновите страницу.",
  checkoutConfirmedTitle: "Оплата прошла",
  checkoutConfirmedBody:
    "Заказ оплачен. Материалы уже доступны в личном кабинете.",
  checkoutConfirmedCta: "Перейти в кабинет",
  checkoutProcessingRetry: "Обновить статус",
} as const;

const en = {
  breadcrumbHome: "Home",
  breadcrumbCart: "Cart",
  breadcrumbCheckout: "Checkout",
  title: "Cart",
  subtitle: "Review the videos you chose and place your order",
  backDesktop: "Continue shopping",
  backMobile: "Back",
  chooseVideos: "Choose videos",
  bannerDesktop: "The more videos you buy — the greater the benefit!",
  bannerMobile: "And the more you choose, the greater your benefit!",
  remove: "Remove",
  totalsTitle: "Total",
  subtotal: "Subtotal",
  discount: "Discount",
  payable: "Amount due",
  checkoutGuest: "Sign in and checkout",
  checkoutSigned: "Checkout",
  paySigned: "Pay",
  payTrust: "Payment is secured by Stripe. Card details never touch this site.",
  payRedirectTitle: "Opening secure payment",
  payRedirectBody: "Stripe’s payment form will open next. Your card is handled by Stripe, not by us.",
  checkoutCanceledTitle: "Payment was not completed",
  checkoutCanceledBody:
    "Nothing was charged. Your order is still here — you can pay again.",
  emptyTitle: "Your cart is empty",
  emptyBody: "Add items to place an order",
  unavailableTitle: "This item is unavailable",
  errorTitle: "Couldn’t load the cart",
  errorBody: "Please try again — items will load from your saved cart.",
  retry: "Try again",
  modalTitle: "The more videos you buy — the greater the benefit!",
  modalBody:
    "Add more training videos to the order — the discount is based on the number of different items.",
  modalClose: "Close",
  modalContinue: "Keep browsing",
  checkoutTitle: "Checkout",
  checkoutSubtitle: "Review the order and continue to payment",
  checkoutEmptyTitle: "There is nothing in the order yet",
  checkoutEmptyBody: "Go back to the catalog, choose videos, and checkout.",
  payPending: "Taking you to payment…",
  payErrorTitle: "Couldn’t start payment",
  payErrorFallback: "Couldn’t start payment. Please try again.",
  checkoutProcessingTitle: "Confirming payment",
  checkoutProcessingBody:
    "Waiting for the bank and Stripe. This usually takes up to a minute.",
  checkoutProcessingTimeoutTitle: "Payment is still processing",
  checkoutProcessingTimeoutBody:
    "If the charge went through, materials will appear in your account shortly. Check Order history or refresh the page.",
  checkoutConfirmedTitle: "Payment complete",
  checkoutConfirmedBody:
    "The order is paid. Materials are already available in your account.",
  checkoutConfirmedCta: "Go to account",
  checkoutProcessingRetry: "Refresh status",
} as const;

export type CartCopy = { [K in keyof typeof ru]: string };

export const cartCopy = ru;

export function cartT(locale: Locale = "ru"): CartCopy {
  return locale === "en" ? en : ru;
}

export function cartModalTier(
  locale: Locale,
  minQty: number,
  percent: number,
): string {
  return locale === "en"
    ? `From ${minQty} videos — ${percent}% off`
    : `От ${minQty} видео — скидка ${percent}%`;
}
