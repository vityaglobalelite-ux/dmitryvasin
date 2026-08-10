-- Telegram Stars prices and idempotent payment tracking.

alter table tariff_prices
  add column if not exists price_stars integer,
  add column if not exists price_stars_was integer;

update tariff_prices
set price_stars = coalesce(price_stars, round(price_rub)::integer),
    price_stars_was = coalesce(
      price_stars_was,
      round(price_rub_was)::integer,
      price_stars,
      round(price_rub)::integer
    );

alter table tariff_prices
  drop constraint if exists tariff_prices_price_stars_check,
  add constraint tariff_prices_price_stars_check
    check (price_stars > 0),
  drop constraint if exists tariff_prices_price_stars_was_check,
  add constraint tariff_prices_price_stars_was_check
    check (price_stars_was > 0),
  alter column price_stars set not null,
  alter column price_stars_was set not null;

alter table payments
  add column if not exists amount_stars integer,
  add column if not exists telegram_payment_charge_id text,
  add column if not exists provider_payment_charge_id text;

alter table payments
  drop constraint if exists payments_amount_stars_check,
  add constraint payments_amount_stars_check
    check (amount_stars is null or amount_stars > 0);

create unique index if not exists payments_telegram_charge_id_uidx
  on payments (telegram_payment_charge_id)
  where telegram_payment_charge_id is not null;
