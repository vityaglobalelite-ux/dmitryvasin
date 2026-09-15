-- Pricing cohort per person + frozen legacy list in tariff_prices.
-- New buyers lock to 'current' on first paid grant and stay there.
-- Anyone who already paid before the Sep 2026 RUB raise stays on 'legacy'.
-- Having a subscription after the raise does NOT unlock old prices.
-- Safe to re-run.

begin;

alter table public.bot_users
  add column if not exists pricing_cohort text;

alter table public.bot_users
  drop constraint if exists bot_users_pricing_cohort_check;

alter table public.bot_users
  add constraint bot_users_pricing_cohort_check
  check (pricing_cohort is null or pricing_cohort in ('legacy', 'current'));

comment on column public.bot_users.pricing_cohort is
  'Price list locked to this person. legacy = paid before the Sep 2026 RUB raise. current = new public list. Null until first paid grant (then locked to current). Never inferred from merely having a subscription.';

alter table public.tariff_prices
  add column if not exists price_list text;

update public.tariff_prices
set price_list = 'current'
where price_list is null;

alter table public.tariff_prices
  alter column price_list set default 'current';

alter table public.tariff_prices
  alter column price_list set not null;

alter table public.tariff_prices
  drop constraint if exists tariff_prices_list_check;

alter table public.tariff_prices
  add constraint tariff_prices_list_check
  check (price_list in ('current', 'legacy'));

alter table public.tariff_prices
  drop constraint if exists tariff_prices_pkey;

alter table public.tariff_prices
  drop constraint if exists tariff_prices_tariff_key;

alter table public.tariff_prices
  add constraint tariff_prices_pkey primary key (price_list, tariff);

-- Frozen pre-raise amounts. No Stripe Price ID: Checkout always charges these majors.
insert into public.tariff_prices (
  tariff, price_list,
  price_rub, price_usd, price_eur,
  checkout_currency, stripe_price_id, label, active,
  price_rub_was, price_usd_was, price_eur_was, updated_at
) values
  ('trial',    'legacy', 14900, 195, 170, 'usd', null, 'Test-drive | 1 month',    true, null,  null, null, now()),
  ('full',     'legacy', 35900, 460, 405, 'usd', null, 'Full research | 90 days', true, null,  null, null, now()),
  ('vip',      'legacy', 60900, 770, 675, 'usd', null, 'VIP research | 90 days',  true, null,  null, null, now()),
  ('month1',   'legacy', 14900, 195, 170, 'usd', null, 'Month 1 materials',       true, null,  null, null, now()),
  ('month2',   'legacy', 14900, 195, 170, 'usd', null, 'Month 2 renewal',         true, null,  null, null, now()),
  ('month3',   'legacy', 14900, 195, 170, 'usd', null, 'Month 3 renewal',         true, null,  null, null, now()),
  ('month2_3', 'legacy', 27800, 360, 320, 'usd', null, 'Month 2+3',               true, 29800, 390,  340,  now())
on conflict (price_list, tariff) do update set
  price_rub = excluded.price_rub,
  price_usd = excluded.price_usd,
  price_eur = excluded.price_eur,
  price_rub_was = excluded.price_rub_was,
  price_usd_was = excluded.price_usd_was,
  price_eur_was = excluded.price_eur_was,
  stripe_price_id = null,
  label = excluded.label,
  active = true,
  updated_at = now();

update public.tariff_prices as legacy
set checkout_currency = cur.checkout_currency
from public.tariff_prices as cur
where legacy.price_list = 'legacy'
  and cur.price_list = 'current'
  and legacy.tariff = cur.tariff;

-- Public landing never sees the grandfathered list.
drop policy if exists tariff_prices_public_read on public.tariff_prices;
create policy tariff_prices_public_read
  on public.tariff_prices
  for select
  to anon, authenticated
  using (active = true and price_list = 'current');

-- Freeze the raise instant once. Re-running 016 must not move this and reclassify people.
insert into public.bot_settings (key, value, updated_at)
select
  'pricing_legacy_cutoff',
  to_char(
    coalesce(
      (select updated_at from public.bot_settings where key = 'sep21_close_prices_applied'),
      timestamptz '2026-09-15 15:05:00+00'
    ) at time zone 'utc',
    'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
  ),
  now()
on conflict (key) do nothing;

-- Paid before the raise → legacy forever (including later renewals).
update public.bot_users u
set pricing_cohort = 'legacy', updated_at = now()
where exists (
  select 1
  from public.subscriptions s
  where s.telegram_id = u.telegram_id
    and s.created_at < (
      select (value)::timestamptz from public.bot_settings where key = 'pricing_legacy_cutoff'
    )
);

-- Paid only after the raise → current, even if a previous bug showed them old prices.
update public.bot_users u
set pricing_cohort = 'current', updated_at = now()
where exists (
  select 1 from public.subscriptions s where s.telegram_id = u.telegram_id
)
  and not exists (
    select 1
    from public.subscriptions s
    where s.telegram_id = u.telegram_id
      and s.created_at < (
        select (value)::timestamptz from public.bot_settings where key = 'pricing_legacy_cutoff'
      )
  );

commit;

notify pgrst, 'reload schema';
