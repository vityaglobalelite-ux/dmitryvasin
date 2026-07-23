-- Landing tariffs (trial / full / vip) current + crossed-out prices.

update public.tariff_prices set
  price_rub = 12900, price_usd = 165, price_eur = 145,
  price_rub_was = 13900, price_usd_was = 180, price_eur_was = 160,
  updated_at = now()
where tariff = 'trial';

update public.tariff_prices set
  price_rub = 29900, price_usd = 380, price_eur = 335,
  price_rub_was = 32900, price_usd_was = 420, price_eur_was = 370,
  updated_at = now()
where tariff = 'full';

update public.tariff_prices set
  price_rub = 54900, price_usd = 690, price_eur = 605,
  price_rub_was = 57900, price_usd_was = 730, price_eur_was = 640,
  updated_at = now()
where tariff = 'vip';
