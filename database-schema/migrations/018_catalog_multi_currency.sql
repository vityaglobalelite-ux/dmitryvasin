-- Catalog shopper currency: RUB / USD / EUR, same geo model as privateclub.
-- price_minor stays the RUB list. Foreign amounts are stored list prices
-- (club trial ratio 16900₽ / $195 / €170, courses rounded to shoppable points).
-- Do not convert at request time.

alter table public.catalog_products
  add column if not exists price_usd_minor integer,
  add column if not exists price_eur_minor integer;

update public.catalog_products set
  price_usd_minor = v.usd,
  price_eur_minor = v.eur
from (values
  ('c0a7a109-0001-4000-8000-000000000001'::uuid,  600,  500),
  ('c0a7a109-0001-4000-8000-000000000002'::uuid,  700,  600),
  ('c0a7a109-0001-4000-8000-000000000009'::uuid,  500,  500),
  ('c0a7a109-0001-4000-8000-000000000010'::uuid,  600,  600),
  ('c0a7a109-0001-4000-8000-000000000011'::uuid,  600,  500),
  ('c0a7a109-0001-4000-8000-000000000003'::uuid, 1700, 1500),
  ('c0a7a109-0001-4000-8000-000000000004'::uuid, 2000, 1700),
  ('c0a7a109-0001-4000-8000-000000000012'::uuid, 1600, 1400),
  ('c0a7a109-0001-4000-8000-000000000013'::uuid, 1800, 1600),
  ('c0a7a109-0001-4000-8000-000000000014'::uuid, 2100, 1800),
  ('c0a7a109-0001-4000-8000-000000000015'::uuid, 1800, 1600),
  ('c0a7a109-0001-4000-8000-000000000016'::uuid, 1900, 1700),
  ('c0a7a109-0001-4000-8000-000000000005'::uuid, 11500, 9900),
  ('c0a7a109-0001-4000-8000-000000000017'::uuid, 14900, 12900),
  ('c0a7a109-0001-4000-8000-000000000018'::uuid, 13900, 11900),
  ('c0a7a109-0001-4000-8000-000000000019'::uuid, 17500, 14900),
  ('c0a7a109-0001-4000-8000-000000000006'::uuid,  900,  800),
  ('c0a7a109-0001-4000-8000-000000000020'::uuid,  800,  700),
  ('c0a7a109-0001-4000-8000-000000000021'::uuid, 1000,  900),
  ('c0a7a109-0001-4000-8000-000000000007'::uuid, 2900, 2500),
  ('c0a7a109-0001-4000-8000-000000000022'::uuid, 2600, 2300),
  ('c0a7a109-0001-4000-8000-000000000023'::uuid, 3000, 2600),
  ('c0a7a109-0001-4000-8000-000000000008'::uuid, 2300, 2000),
  ('c0a7a109-0001-4000-8000-000000000024'::uuid, 2200, 1900),
  ('c0a7a109-0001-4000-8000-000000000025'::uuid, 2500, 2200)
) as v(id, usd, eur)
where catalog_products.id = v.id;

alter table public.catalog_products
  alter column price_usd_minor set not null,
  alter column price_eur_minor set not null;

alter table public.catalog_products
  drop constraint if exists catalog_products_price_usd_minor_check,
  drop constraint if exists catalog_products_price_eur_minor_check;

alter table public.catalog_products
  add constraint catalog_products_price_usd_minor_check
    check (price_usd_minor >= 0),
  add constraint catalog_products_price_eur_minor_check
    check (price_eur_minor >= 0);

comment on column public.catalog_products.price_minor is
  'RUB list price in kopecks.';
comment on column public.catalog_products.price_usd_minor is
  'USD list price in cents.';
comment on column public.catalog_products.price_eur_minor is
  'EUR list price in cents.';

notify pgrst, 'reload schema';
