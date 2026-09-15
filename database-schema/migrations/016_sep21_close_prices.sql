-- New public list prices for buyers on the current list.
-- Grandfathered amounts live in tariff_prices.price_list = 'legacy' (017).
-- Sales window: close new enrollment 22 Sep 2026 00:00 America/New_York (Miami).
-- Safe to re-run. After 017, only touches the public list.

update public.tariff_prices set
  price_rub = 16900, price_usd = 195, price_eur = 170,
  price_rub_was = null, price_usd_was = null, price_eur_was = null,
  updated_at = now()
where tariff in ('trial', 'month1', 'month2', 'month3')
  and coalesce(price_list, 'current') = 'current';

update public.tariff_prices set
  price_rub = 39900, price_usd = 460, price_eur = 405,
  price_rub_was = null, price_usd_was = null, price_eur_was = null,
  updated_at = now()
where tariff = 'full'
  and coalesce(price_list, 'current') = 'current';

update public.tariff_prices set
  price_rub = 67900, price_usd = 770, price_eur = 675,
  price_rub_was = null, price_usd_was = null, price_eur_was = null,
  updated_at = now()
where tariff = 'vip'
  and coalesce(price_list, 'current') = 'current';

-- Bundle "was" = 2 × new monthly list (16 900 × 2).
update public.tariff_prices set
  price_rub = 30900, price_usd = 360, price_eur = 320,
  price_rub_was = 33800, price_usd_was = 390, price_eur_was = 340,
  updated_at = now()
where tariff = 'month2_3'
  and coalesce(price_list, 'current') = 'current';

insert into public.bot_settings (key, value, updated_at)
values ('price_increase_at', '2026-09-22T00:00:00-04:00', now())
on conflict (key) do update
set value = excluded.value, updated_at = now();

insert into public.bot_settings (key, value, updated_at)
values ('sep21_close_prices_applied', '2026-09-15-16900', now())
on conflict (key) do update
set value = excluded.value, updated_at = now();
