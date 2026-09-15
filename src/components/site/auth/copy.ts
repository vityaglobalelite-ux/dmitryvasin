import type { Locale } from "@/lib/catalog/types";

const ru = {
  meta: {
    login: "Вход",
    signup: "Регистрация",
    forgotPassword: "Восстановление пароля",
  },
  loginTitle: "Войти в личный кабинет",
  signupTitle: "Зарегистрироваться",
  forgotTitle: "Восстановление пароля",
  forgotSubtitle: "Введите email, указанный при регистрации — пришлём инструкцию",
  resetTitle: "Придумайте новый пароль",
  resetSubtitle: "После сохранения вы войдёте в кабинет с новым паролем",
  email: "Email",
  emailPlaceholder: "mail@mail.ru",
  password: "Пароль",
  passwordRepeat: "Повторите пароль",
  passwordPlaceholder: "Введите пароль",
  forgotLink: "Забыли пароль?",
  submitLogin: "Войти",
  submitSignup: "Зарегистрироваться",
  submitForgot: "Восстановить пароль",
  submitReset: "Сохранить пароль",
  submitting: "Отправка…",
  privacy: "Соглашаюсь с Политикой конфиденциальности",
  privacyLead: "Соглашаюсь с",
  privacyPolicy: "Политикой конфиденциальности",
  noAccount: "Не зарегистрированы?",
  hasAccount: "Уже зарегистрированы?",
  rememberedPassword: "Вспомнили пароль?",
  goSignup: "Зарегистрироваться",
  goLogin: "Войти",
  showPassword: "Показать пароль",
  hidePassword: "Скрыть пароль",
  closeAria: "Закрыть окно входа",
  loginError: "Неверно введен логин или пароль",
  userExists: "Профиль с таким логином уже существует",
  mismatch: "Введенные пароли не совпадают",
  match: "Пароли совпадают",
  privacyRequired: "Подтвердите согласие с политикой конфиденциальности",
  genericError: "Не получилось отправить форму. Попробуйте ещё раз.",
  notConfigured: "Вход временно недоступен. Проверьте подключение к сервису.",
  emailNotConfirmed:
    "Этот email ещё не подтверждён. Откройте письмо и перейдите по ссылке, затем войдите снова.",
  weakPassword: "Пароль слишком короткий. Придумайте более надёжный.",
  checkEmailTitle: "Проверьте почту",
  checkEmailBody:
    "Отправили письмо на {email}. Откройте его и перейдите по ссылке, чтобы завершить регистрацию.",
  forgotSentTitle: "Письмо отправлено",
  forgotSentBody:
    "Если аккаунт с адресом {email} есть, инструкция уже в пути. Проверьте почту — письмо может прийти через несколько минут.",
} as const;

const en = {
  meta: {
    login: "Sign in",
    signup: "Sign up",
    forgotPassword: "Forgot password",
  },
  loginTitle: "Sign in to your account",
  signupTitle: "Create an account",
  forgotTitle: "Forgot password",
  forgotSubtitle: "Enter the email you used to register — we will send instructions",
  resetTitle: "Choose a new password",
  resetSubtitle: "After saving, you will enter your account with the new password",
  email: "Email",
  emailPlaceholder: "mail@mail.ru",
  password: "Password",
  passwordRepeat: "Repeat password",
  passwordPlaceholder: "Enter password",
  forgotLink: "Forgot password?",
  submitLogin: "Sign in",
  submitSignup: "Sign up",
  submitForgot: "Reset password",
  submitReset: "Save password",
  submitting: "Sending…",
  privacy: "I agree to the Privacy Policy",
  privacyLead: "I agree to the",
  privacyPolicy: "Privacy Policy",
  noAccount: "Not registered?",
  hasAccount: "Already registered?",
  rememberedPassword: "Remembered your password?",
  goSignup: "Sign up",
  goLogin: "Sign in",
  showPassword: "Show password",
  hidePassword: "Hide password",
  closeAria: "Close sign-in",
  loginError: "Incorrect login or password",
  userExists: "An account with this login already exists",
  mismatch: "The passwords do not match",
  match: "Passwords match",
  privacyRequired: "Confirm that you agree to the privacy policy",
  genericError: "Couldn’t submit the form. Please try again.",
  notConfigured: "Sign-in is temporarily unavailable. Check the service connection.",
  emailNotConfirmed:
    "This email is not confirmed yet. Open the message, follow the link, then sign in again.",
  weakPassword: "The password is too short. Please choose a stronger one.",
  checkEmailTitle: "Check your email",
  checkEmailBody:
    "We sent a message to {email}. Open it and follow the link to finish signing up.",
  forgotSentTitle: "Email sent",
  forgotSentBody:
    "If an account with {email} exists, instructions are on the way. Check your inbox — it may take a few minutes.",
} as const;

type DeepString<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepString<T[K]>;
};

export type AuthCopy = DeepString<typeof ru>;

export const authCopy = ru;

export function authT(locale: Locale = "ru"): AuthCopy {
  return locale === "en" ? en : ru;
}
