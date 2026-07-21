-- Public read of active tariff prices for the landing page.
-- Columns price_*_was already exist (007); seed crossed-out for landing tariffs.

grant select on table public.tariff_prices to anon, authenticated;

drop policy if exists tariff_prices_public_read on public.tariff_prices;
create policy tariff_prices_public_read
  on public.tariff_prices
  for select
  to anon, authenticated
  using (active = true);

-- Crossed-out promo prices for landing cards (trial / full / vip)
update public.tariff_prices
set
  price_rub_was = coalesce(price_rub_was, 2000),
  price_usd_was = coalesce(price_usd_was, 22),
  price_eur_was = coalesce(price_eur_was, 20),
  updated_at = now()
where tariff in ('trial', 'full', 'vip');
