update tariff_prices set
  price_rub = 12900, price_usd = 165, price_eur = 145,
  price_rub_was = 13900, price_usd_was = 180, price_eur_was = 160,
  updated_at = now()
where tariff = 'trial';

update tariff_prices set
  price_rub = 29900, price_usd = 380, price_eur = 335,
  price_rub_was = 32900, price_usd_was = 420, price_eur_was = 370,
  updated_at = now()
where tariff = 'full';

update tariff_prices set
  price_rub = 54900, price_usd = 690, price_eur = 605,
  price_rub_was = 57900, price_usd_was = 730, price_eur_was = 640,
  updated_at = now()
where tariff = 'vip';

select tariff, price_rub, price_usd, price_eur, price_rub_was, price_usd_was, price_eur_was
from tariff_prices
where tariff in ('trial','full','vip')
order by case tariff when 'trial' then 1 when 'full' then 2 when 'vip' then 3 end;
