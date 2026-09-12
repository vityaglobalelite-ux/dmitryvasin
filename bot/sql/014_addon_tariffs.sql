-- Point-join add-ons under the main 3 landing tariffs.
-- month1: archive of lessons 1–8 (list price matches trial until a separate price is set).
-- month2_3: months 2+3 without month 1 / VIP — 27 800 ₽ / $360 / €320.

insert into public.tariff_prices (
  tariff, price_rub, price_usd, price_eur, checkout_currency, label, active, updated_at
) values (
  'month1', 14900, 195, 170, 'usd', 'Month 1 materials', true, now()
)
on conflict (tariff) do update set
  price_rub = excluded.price_rub,
  price_usd = excluded.price_usd,
  price_eur = excluded.price_eur,
  label = excluded.label,
  active = true,
  updated_at = now();

update public.tariff_prices set
  price_rub = 27800,
  price_usd = 360,
  price_eur = 320,
  price_rub_was = 29800,
  price_usd_was = 390,
  price_eur_was = 340,
  label = 'Month 2+3',
  active = true,
  updated_at = now()
where tariff = 'month2_3';
