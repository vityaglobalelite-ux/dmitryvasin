# Stripe + Edge Functions

## 1. SQL

В Supabase SQL Editor (или `psql`) выполнить по порядку:

```text
bot/sql/004_payments.sql
bot/sql/005_tariff_prices.sql
```

Цены в `tariff_prices`: колонки `price_rub`, `price_usd`, `price_eur` (обычные единицы, не копейки/центы).
Какой валютой бить в Stripe — `checkout_currency` (`eur` / `usd` / `rub`).
Env `STRIPE_AMOUNT_*` — только fallback, если строки в БД нет.

## 2. Secrets функций

Нужны: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `CHECKOUT_SECRET`,
`STRIPE_PRICE_*` (или `STRIPE_AMOUNT_*`), `STRIPE_CURRENCY`,
`STRIPE_SUCCESS_URL` / `STRIPE_CANCEL_URL`.

Cloud:

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_... STRIPE_WEBHOOK_SECRET=whsec_... CHECKOUT_SECRET=...
```

Self-hosted: прописать те же переменные в env контейнера `edge-runtime` / functions.

## 3. Deploy functions

```bash
supabase functions deploy create-checkout --no-verify-jwt
supabase functions deploy stripe-webhook --no-verify-jwt
```

## 4. Stripe Webhook

Dashboard → Developers → Webhooks → Add endpoint:

`https://<SUPABASE_URL>/functions/v1/stripe-webhook`

Events:

- `checkout.session.completed`
- `checkout.session.expired`
- `charge.refunded`

Скопировать Signing secret → `STRIPE_WEBHOOK_SECRET`.

## 5. Бот

В `bot/.env`:

```env
PAYMENT_MODE=stripe
CHECKOUT_SECRET=...
TELEGRAM_BOT_USERNAME=your_bot
```

Перезапустить контейнер бота.

## Flow

1. Бот → `create-checkout` → Stripe Checkout URL  
2. Оплата → Stripe → `stripe-webhook` → `payments.status = paid`  
3. Scheduler бота → `grantAccess` → invite + сообщение пользователю  
