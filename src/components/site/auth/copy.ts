import type { Locale } from "@/lib/catalog/types";

const ru = {
  meta: {
    login: "Вход",
    signup: "Регистрация",
    forgotPassword: "Восстановление пароля",
  },
  loginTitle: "Войти в личный кабинет",
  signupTitle: "Зарегистрироваться",
  forgotTitle: "Введите E-mail, указанный при регистрации",
  forgotSubtitle: "Мы отправим вам инструкцию по восстановлению пароля",
  email: "Email",
  emailPlaceholder: "mail@mail.ru",
  password: "Пароль",
  passwordRepeat: "Повторите пароль",
  passwordPlaceholder: "Введите пароль",
  forgotLink: "Забыли пароль?",
  submitLogin: "Войти",
  submitSignup: "Зарегистрироваться",
  submitForgot: "Восстановить пароль",
  submitting: "Отправка…",
  privacy: "Соглашаюсь с Политикой конфиденциальности",
  privacyLead: "Соглашаюсь с",
  privacyPolicy: "Политикой конфиденциальности",
  noAccount: "Не зарегистрированы?",
  hasAccount: "Уже зарегистрированы?",
  goSignup: "Зарегистрироваться",
  goLogin: "Войти",
  showPassword: "Показать пароль",
  hidePassword: "Скрыть пароль",
  loginError: "Неверно введен логин или пароль",
  userExists: "Профиль с таким логином уже существует",
  mismatch: "Введенные пароли не совпадают",
  match: "Пароли совпадают",
  privacyRequired: "Чтобы продолжить, подтвердите согласие с политикой конфиденциальности",
  genericError: "Не получилось отправить форму. Попробуйте ещё раз.",
  notConfigured: "Вход временно недоступен. Проверьте подключение к сервису.",
  emailNotConfirmed:
    "Этот email ещё не подтверждён. Откройте письмо и перейдите по ссылке, затем войдите снова.",
  weakPassword: "Пароль слишком короткий. Придумайте более надёжный.",
  checkEmailTitle: "Проверьте почту",
  checkEmailBody:
    "Мы отправили письмо на {email}. Откройте его и перейдите по ссылке, чтобы завершить регистрацию. В кабинет можно войти только после подтверждения — это не вход в аккаунт.",
  forgotSentTitle: "Письмо отправлено",
  forgotSentBody:
    "Если аккаунт с адресом {email} существует, мы отправили инструкцию по восстановлению пароля. Письмо может прийти через несколько минут. Это не вход в кабинет.",
} as const;

const en = {
  meta: {
    login: "Sign in",
    signup: "Sign up",
    forgotPassword: "Forgot password",
  },
  loginTitle: "Sign in to your account",
  signupTitle: "Create an account",
  forgotTitle: "Enter the email you used to register",
  forgotSubtitle: "We will send you password reset instructions",
  email: "Email",
  emailPlaceholder: "mail@mail.ru",
  password: "Password",
  passwordRepeat: "Repeat password",
  passwordPlaceholder: "Enter password",
  forgotLink: "Forgot password?",
  submitLogin: "Sign in",
  submitSignup: "Sign up",
  submitForgot: "Reset password",
  submitting: "Sending…",
  privacy: "I agree to the Privacy Policy",
  privacyLead: "I agree to the",
  privacyPolicy: "Privacy Policy",
  noAccount: "Not registered?",
  hasAccount: "Already registered?",
  goSignup: "Sign up",
  goLogin: "Sign in",
  showPassword: "Show password",
  hidePassword: "Hide password",
  loginError: "Incorrect login or password",
  userExists: "An account with this login already exists",
  mismatch: "The passwords do not match",
  match: "Passwords match",
  privacyRequired: "To continue, confirm that you agree to the privacy policy",
  genericError: "Couldn’t submit the form. Please try again.",
  notConfigured: "Sign-in is temporarily unavailable. Check the service connection.",
  emailNotConfirmed:
    "This email is not confirmed yet. Open the message, follow the link, then sign in again.",
  weakPassword: "The password is too short. Please choose a stronger one.",
  checkEmailTitle: "Check your email",
  checkEmailBody:
    "We sent a message to {email}. Open it and follow the link to finish signing up. You can enter your account only after confirmation — this is not a sign-in.",
  forgotSentTitle: "Email sent",
  forgotSentBody:
    "If an account with {email} exists, we sent password reset instructions. The message may take a few minutes. This is not a sign-in.",
} as const;

type DeepString<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepString<T[K]>;
};

export type AuthCopy = DeepString<typeof ru>;

export const authCopy = ru;

export function authT(locale: Locale = "ru"): AuthCopy {
  return locale === "en" ? en : ru;
}
