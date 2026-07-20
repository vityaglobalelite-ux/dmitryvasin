-- Optional "was" prices for promo copy (e.g. month2_3)

alter table public.tariff_prices
  add column if not exists price_rub_was numeric(12, 2),
  add column if not exists price_usd_was numeric(12, 2),
  add column if not exists price_eur_was numeric(12, 2);

update public.tariff_prices
set price_rub_was = 2000,
    price_usd_was = 22,
    price_eur_was = 20
where tariff = 'month2_3'
  and price_rub_was is null;
