-- Stage 3 list prices without strikethrough.
-- Safe to run anytime: no-op until 21 Aug 2026 00:00 America/New_York.
-- The bot also applies this automatically; this file is a manual fallback.
--
-- Rollback (re-open sales, keep stage-3 prices, no countdown):
--   delete from public.bot_settings where key = 'price_increase_at';
-- Rollback (re-open with a new countdown):
--   update public.bot_settings set value = '<future ISO>', updated_at = now()
--     where key = 'price_increase_at';
-- Restore stage-2 promo: re-run 012_tariff_prices_aug20.sql and
--   delete from public.bot_settings where key = 'stage3_prices_applied_at';

update public.tariff_prices set
  price_rub = 14900, price_usd = 195, price_eur = 170,
  price_rub_was = null, price_usd_was = null, price_eur_was = null,
  updated_at = now()
where tariff = 'trial'
  and now() >= timestamptz '2026-08-21 00:00:00-04';

update public.tariff_prices set
  price_rub = 35900, price_usd = 460, price_eur = 405,
  price_rub_was = null, price_usd_was = null, price_eur_was = null,
  updated_at = now()
where tariff = 'full'
  and now() >= timestamptz '2026-08-21 00:00:00-04';

update public.tariff_prices set
  price_rub = 60900, price_usd = 770, price_eur = 675,
  price_rub_was = null, price_usd_was = null, price_eur_was = null,
  updated_at = now()
where tariff = 'vip'
  and now() >= timestamptz '2026-08-21 00:00:00-04';

insert into public.bot_settings (key, value, updated_at)
select 'stage3_prices_applied_at', now()::text, now()
where now() >= timestamptz '2026-08-21 00:00:00-04'
on conflict (key) do update
set value = excluded.value, updated_at = now();
