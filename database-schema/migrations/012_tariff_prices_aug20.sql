-- Current: 13900₽/$180/€160, 32900₽/$420/€370, 57900₽/$730/€640
-- Crossed-out: 14900₽/$195/€175, 35900₽/$460/€405, 60900₽/$770/€675
-- Valid until 21 Aug 2026 00:00 Miami (America/New_York, EDT = UTC-4).

update public.tariff_prices set
  price_rub = 13900,
  price_usd = 180,
  price_eur = 160,
  price_rub_was = 14900,
  price_usd_was = 195,
  price_eur_was = 175,
  updated_at = now()
where tariff = 'trial';

update public.tariff_prices set
  price_rub = 32900,
  price_usd = 420,
  price_eur = 370,
  price_rub_was = 35900,
  price_usd_was = 460,
  price_eur_was = 405,
  updated_at = now()
where tariff = 'full';

update public.tariff_prices set
  price_rub = 57900,
  price_usd = 730,
  price_eur = 640,
  price_rub_was = 60900,
  price_usd_was = 770,
  price_eur_was = 675,
  updated_at = now()
where tariff = 'vip';

insert into public.bot_settings (key, value, updated_at)
values ('price_increase_at', '2026-08-21T00:00:00-04:00', now())
on conflict (key) do update
set value = excluded.value, updated_at = now();

select tariff, price_rub, price_rub_was, price_usd, price_eur
from public.tariff_prices
where tariff in ('trial', 'full', 'vip')
order by case tariff when 'trial' then 1 when 'full' then 2 when 'vip' then 3 end;

select key, value from public.bot_settings where key = 'price_increase_at';
