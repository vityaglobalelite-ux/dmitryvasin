-- Renewal list prices for month 2 / 2+3 / month 3.
-- Bundle "was" = 2 × month-2 list price (sum of previous monthly prices).
-- Safe to re-run. Numbered 015: 014 is landing add-on tariffs.

update public.tariff_prices set
  price_rub = 14900, price_usd = 195, price_eur = 170,
  price_rub_was = null, price_usd_was = null, price_eur_was = null,
  updated_at = now()
where tariff = 'month2';

update public.tariff_prices set
  price_rub = 27800, price_usd = 360, price_eur = 320,
  price_rub_was = 29800, price_usd_was = 390, price_eur_was = 340,
  updated_at = now()
where tariff = 'month2_3';

update public.tariff_prices set
  price_rub = 14900, price_usd = 195, price_eur = 170,
  price_rub_was = null, price_usd_was = null, price_eur_was = null,
  updated_at = now()
where tariff = 'month3';

insert into public.bot_settings (key, value, updated_at)
values ('renewal_prices_applied', 'month2-2026-14900', now())
on conflict (key) do update
set value = excluded.value, updated_at = now();
