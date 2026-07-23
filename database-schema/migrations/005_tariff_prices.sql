-- Prices per tariff: RUB / USD / EUR (major units, e.g. 49.00)
-- Stripe Checkout for foreign cards uses checkout_currency (default eur).

create table if not exists tariff_prices (
  tariff text primary key,
  price_rub numeric(12, 2) not null check (price_rub > 0),
  price_usd numeric(12, 2) not null check (price_usd > 0),
  price_eur numeric(12, 2) not null check (price_eur > 0),
  -- which currency Stripe charges for foreign-card Checkout: rub | usd | eur
  checkout_currency text not null default 'eur'
    check (checkout_currency in ('rub', 'usd', 'eur')),
  -- optional Stripe Price ID (if set for that currency, used instead of amount)
  stripe_price_id text,
  label text,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table tariff_prices enable row level security;
alter table tariff_prices force row level security;
revoke all on table tariff_prices from anon, authenticated;
grant all on table tariff_prices to service_role;

-- Seed (поменяйте под себя)
insert into tariff_prices (
  tariff, price_rub, price_usd, price_eur, checkout_currency, label
) values
  ('trial',    1000.00, 11.00, 10.00, 'eur', 'Test-drive | 1 month'),
  ('full',     1000.00, 11.00, 10.00, 'eur', 'Full research | 90 days'),
  ('vip',      1000.00, 11.00, 10.00, 'eur', 'VIP research | 90 days'),
  ('month2',   1000.00, 11.00, 10.00, 'eur', 'Month 2 renewal'),
  ('month2_3', 1000.00, 11.00, 10.00, 'eur', 'Month 2+3 renewal'),
  ('month3',   1000.00, 11.00, 10.00, 'eur', 'Month 3 renewal')
on conflict (tariff) do nothing;
