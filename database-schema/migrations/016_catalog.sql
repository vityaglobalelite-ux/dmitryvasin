-- BeTango catalog (Wave 1A). Prefix catalog_ — do not ALTER bot tables.
-- Write-only in this repo: do not apply to the live instance (api.betango.dance)
-- until a human explicitly asks.
--
-- Auth (ops, not this migration): enable Email/Password on this instance
-- (api.betango.dance) and the Russian password-reset email template.
-- Do not invent SMTP settings here; GoTrue config is unchanged in this PR.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.catalog_products (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  price_minor integer not null check (price_minor >= 0),
  currency text not null,
  access_days integer not null check (access_days > 0),
  cover_url text not null,
  duration_sec integer not null check (duration_sec >= 0),
  level text not null,
  skills text[] not null default '{}'::text[],
  lesson_count integer check (lesson_count is null or lesson_count >= 0),
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint catalog_products_type_check
    check (type in ('lifehack', 'lesson', 'course', 'extra', 'research', 'peek')),
  constraint catalog_products_currency_check
    check (currency in ('rub', 'eur', 'usd'))
);

create table if not exists public.catalog_product_i18n (
  product_id uuid not null,
  locale text not null,
  title text not null,
  short text not null,
  description text not null,
  program text,
  constraint catalog_product_i18n_pkey primary key (product_id, locale),
  constraint catalog_product_i18n_product_id_fkey
    foreign key (product_id) references public.catalog_products (id) on delete cascade,
  constraint catalog_product_i18n_locale_check
    check (locale in ('ru', 'en'))
);

create table if not exists public.catalog_product_videos (
  product_id uuid not null,
  locale text not null,
  kinescope_id text not null,
  constraint catalog_product_videos_pkey primary key (product_id, locale),
  constraint catalog_product_videos_product_id_fkey
    foreign key (product_id) references public.catalog_products (id) on delete cascade,
  constraint catalog_product_videos_locale_check
    check (locale in ('ru', 'en'))
);

comment on table public.catalog_product_videos is
  'Kinescope ids. No SELECT for anon/authenticated; service_role / Edge Functions only.';

create table if not exists public.catalog_settings (
  key text primary key,
  value jsonb not null
);

comment on table public.catalog_settings is
  'Public-read shop settings (wholesale modal). Do not store secrets here.';

create table if not exists public.catalog_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists public.catalog_cart_items (
  user_id uuid not null,
  product_id uuid not null,
  qty integer not null check (qty >= 1),
  added_at timestamptz not null default now(),
  constraint catalog_cart_items_pkey primary key (user_id, product_id),
  constraint catalog_cart_items_user_id_fkey
    foreign key (user_id) references public.catalog_profiles (id) on delete cascade,
  constraint catalog_cart_items_product_id_fkey
    foreign key (product_id) references public.catalog_products (id) on delete cascade
);

create table if not exists public.catalog_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  status text not null default 'pending',
  subtotal_minor integer not null check (subtotal_minor >= 0),
  discount_minor integer not null check (discount_minor >= 0),
  total_minor integer not null check (total_minor >= 0),
  currency text not null,
  stripe_session_id text unique,
  created_at timestamptz not null default now(),
  constraint catalog_orders_user_id_fkey
    foreign key (user_id) references public.catalog_profiles (id) on delete cascade,
  constraint catalog_orders_status_check
    check (status in ('pending', 'paid', 'failed', 'canceled')),
  constraint catalog_orders_currency_check
    check (currency in ('rub', 'eur', 'usd'))
);

create table if not exists public.catalog_order_items (
  order_id uuid not null,
  product_id uuid not null,
  title_snapshot text not null,
  price_minor integer not null check (price_minor >= 0),
  qty integer not null check (qty >= 1),
  constraint catalog_order_items_pkey primary key (order_id, product_id),
  constraint catalog_order_items_order_id_fkey
    foreign key (order_id) references public.catalog_orders (id) on delete cascade,
  constraint catalog_order_items_product_id_fkey
    foreign key (product_id) references public.catalog_products (id)
);

create table if not exists public.catalog_access (
  user_id uuid not null,
  product_id uuid not null,
  order_id uuid not null,
  purchased_at timestamptz not null default now(),
  expires_at timestamptz not null,
  status text not null default 'active',
  constraint catalog_access_pkey primary key (user_id, product_id),
  constraint catalog_access_user_id_fkey
    foreign key (user_id) references public.catalog_profiles (id) on delete cascade,
  constraint catalog_access_product_id_fkey
    foreign key (product_id) references public.catalog_products (id),
  constraint catalog_access_order_id_fkey
    foreign key (order_id) references public.catalog_orders (id) on delete cascade,
  constraint catalog_access_status_check
    check (status in ('active', 'expired'))
);

create table if not exists public.catalog_support_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  from_role text not null,
  body text not null,
  storage_path text,
  created_at timestamptz not null default now(),
  constraint catalog_support_messages_user_id_fkey
    foreign key (user_id) references public.catalog_profiles (id) on delete cascade,
  constraint catalog_support_messages_from_role_check
    check (from_role in ('user', 'agent'))
);

create table if not exists public.catalog_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  type text not null,
  title text not null,
  body text not null,
  href text,
  read boolean not null default false,
  created_at timestamptz not null default now(),
  constraint catalog_notifications_user_id_fkey
    foreign key (user_id) references public.catalog_profiles (id) on delete cascade
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index if not exists catalog_products_published_type_idx
  on public.catalog_products (published, type);

create index if not exists catalog_access_user_status_idx
  on public.catalog_access (user_id, status);

create index if not exists catalog_orders_user_status_idx
  on public.catalog_orders (user_id, status);

-- ---------------------------------------------------------------------------
-- Signup → catalog_profiles
-- ---------------------------------------------------------------------------

create or replace function public.handle_catalog_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.catalog_profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function public.handle_catalog_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created_catalog on auth.users;
create trigger on_auth_user_created_catalog
  after insert on auth.users
  for each row
  execute function public.handle_catalog_new_user();

insert into public.catalog_profiles (id, email)
select id, email
from auth.users
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- RLS + grants
-- Client cannot write access / orders / videos (service_role only).
-- ---------------------------------------------------------------------------

alter table public.catalog_products enable row level security;
alter table public.catalog_product_i18n enable row level security;
alter table public.catalog_product_videos enable row level security;
alter table public.catalog_settings enable row level security;
alter table public.catalog_profiles enable row level security;
alter table public.catalog_cart_items enable row level security;
alter table public.catalog_orders enable row level security;
alter table public.catalog_order_items enable row level security;
alter table public.catalog_access enable row level security;
alter table public.catalog_support_messages enable row level security;
alter table public.catalog_notifications enable row level security;

alter table public.catalog_products force row level security;
alter table public.catalog_product_i18n force row level security;
alter table public.catalog_product_videos force row level security;
alter table public.catalog_settings force row level security;
alter table public.catalog_profiles force row level security;
alter table public.catalog_cart_items force row level security;
alter table public.catalog_orders force row level security;
alter table public.catalog_order_items force row level security;
alter table public.catalog_access force row level security;
alter table public.catalog_support_messages force row level security;
alter table public.catalog_notifications force row level security;

revoke all on table public.catalog_products from anon, authenticated;
revoke all on table public.catalog_product_i18n from anon, authenticated;
revoke all on table public.catalog_product_videos from anon, authenticated;
revoke all on table public.catalog_settings from anon, authenticated;
revoke all on table public.catalog_profiles from anon, authenticated;
revoke all on table public.catalog_cart_items from anon, authenticated;
revoke all on table public.catalog_orders from anon, authenticated;
revoke all on table public.catalog_order_items from anon, authenticated;
revoke all on table public.catalog_access from anon, authenticated;
revoke all on table public.catalog_support_messages from anon, authenticated;
revoke all on table public.catalog_notifications from anon, authenticated;

grant all on table public.catalog_products to service_role;
grant all on table public.catalog_product_i18n to service_role;
grant all on table public.catalog_product_videos to service_role;
grant all on table public.catalog_settings to service_role;
grant all on table public.catalog_profiles to service_role;
grant all on table public.catalog_cart_items to service_role;
grant all on table public.catalog_orders to service_role;
grant all on table public.catalog_order_items to service_role;
grant all on table public.catalog_access to service_role;
grant all on table public.catalog_support_messages to service_role;
grant all on table public.catalog_notifications to service_role;

-- Public read of published catalog (anon + authenticated)
grant select on table public.catalog_products to anon, authenticated;
grant select on table public.catalog_product_i18n to anon, authenticated;
grant select on table public.catalog_settings to anon, authenticated;

-- Own-row client access (authenticated only)
grant select on table public.catalog_profiles to authenticated;
grant update (email) on table public.catalog_profiles to authenticated;

grant select, insert, update, delete on table public.catalog_cart_items to authenticated;

grant select on table public.catalog_orders to authenticated;
grant select on table public.catalog_order_items to authenticated;
grant select on table public.catalog_access to authenticated;

grant select, insert on table public.catalog_support_messages to authenticated;

grant select on table public.catalog_notifications to authenticated;
grant update ("read") on table public.catalog_notifications to authenticated;

-- catalog_product_videos: no policies for anon/authenticated (revoke already).

drop policy if exists catalog_products_public_read on public.catalog_products;
create policy catalog_products_public_read
  on public.catalog_products
  for select
  to anon, authenticated
  using (published = true);

drop policy if exists catalog_product_i18n_public_read on public.catalog_product_i18n;
create policy catalog_product_i18n_public_read
  on public.catalog_product_i18n
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.catalog_products p
      where p.id = catalog_product_i18n.product_id
        and p.published = true
    )
  );

drop policy if exists catalog_settings_public_read on public.catalog_settings;
create policy catalog_settings_public_read
  on public.catalog_settings
  for select
  to anon, authenticated
  using (true);

drop policy if exists catalog_profiles_select_own on public.catalog_profiles;
create policy catalog_profiles_select_own
  on public.catalog_profiles
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists catalog_profiles_update_own on public.catalog_profiles;
create policy catalog_profiles_update_own
  on public.catalog_profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- INSERT into catalog_profiles is via handle_catalog_new_user, not the client.

drop policy if exists catalog_cart_items_select_own on public.catalog_cart_items;
create policy catalog_cart_items_select_own
  on public.catalog_cart_items
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists catalog_cart_items_insert_own on public.catalog_cart_items;
create policy catalog_cart_items_insert_own
  on public.catalog_cart_items
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists catalog_cart_items_update_own on public.catalog_cart_items;
create policy catalog_cart_items_update_own
  on public.catalog_cart_items
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists catalog_cart_items_delete_own on public.catalog_cart_items;
create policy catalog_cart_items_delete_own
  on public.catalog_cart_items
  for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists catalog_orders_select_own on public.catalog_orders;
create policy catalog_orders_select_own
  on public.catalog_orders
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists catalog_order_items_select_own on public.catalog_order_items;
create policy catalog_order_items_select_own
  on public.catalog_order_items
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.catalog_orders o
      where o.id = catalog_order_items.order_id
        and o.user_id = auth.uid()
    )
  );

drop policy if exists catalog_access_select_own on public.catalog_access;
create policy catalog_access_select_own
  on public.catalog_access
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists catalog_support_messages_select_own on public.catalog_support_messages;
create policy catalog_support_messages_select_own
  on public.catalog_support_messages
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists catalog_support_messages_insert_user on public.catalog_support_messages;
create policy catalog_support_messages_insert_user
  on public.catalog_support_messages
  for insert
  to authenticated
  with check (auth.uid() = user_id and from_role = 'user');

drop policy if exists catalog_notifications_select_own on public.catalog_notifications;
create policy catalog_notifications_select_own
  on public.catalog_notifications
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists catalog_notifications_update_own on public.catalog_notifications;
create policy catalog_notifications_update_own
  on public.catalog_notifications
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Storage: private support attachments, path {user_id}/...
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('catalog-support', 'catalog-support', false)
on conflict (id) do update
set
  public = excluded.public,
  name = excluded.name;

drop policy if exists catalog_support_objects_select on storage.objects;
create policy catalog_support_objects_select
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'catalog-support'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists catalog_support_objects_insert on storage.objects;
create policy catalog_support_objects_insert
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'catalog-support'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists catalog_support_objects_update on storage.objects;
create policy catalog_support_objects_update
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'catalog-support'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'catalog-support'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists catalog_support_objects_delete on storage.objects;
create policy catalog_support_objects_delete
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'catalog-support'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------------
-- Settings seed (dev placeholder). Production wholesale % need a human.
-- ---------------------------------------------------------------------------

insert into public.catalog_settings (key, value)
values (
  'wholesale_tiers',
  '[{"minQty": 2, "percent": 5}]'::jsonb
)
on conflict (key) do nothing;
