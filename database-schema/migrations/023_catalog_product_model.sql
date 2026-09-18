-- BeTango catalog product model (Wave 0). Prefix catalog_ — do not ALTER bot tables.
-- Write-only in this repo: do not apply to the live instance (api.betango.dance)
-- until a human explicitly asks.

-- ---------------------------------------------------------------------------
-- catalog_products: schedule + ordering + skills whitelist
-- ---------------------------------------------------------------------------

alter table public.catalog_products
  add column if not exists available_at timestamptz null;

alter table public.catalog_products
  add column if not exists sort_index integer null;

comment on column public.catalog_products.available_at is
  'Peek unlock instant (Europe/Moscow start-of-day in seed). NULL = no extra lock.';

comment on column public.catalog_products.sort_index is
  'Catalog ordering (peeks 1–24). Lower first when set.';

alter table public.catalog_products
  alter column cover_url drop not null;

create index if not exists catalog_products_type_available_at_idx
  on public.catalog_products (type, available_at);

create index if not exists catalog_products_peek_sort_idx
  on public.catalog_products (sort_index)
  where type = 'peek';

-- Legacy seed stored Russian labels ('Ось', 'Осознавание', …).
-- Clear them before the whitelist check; Wave 0 seed writes keys.
update public.catalog_products
set skills = '{}'::text[]
where skills is not null
  and not (
    skills <@ array[
      'awareness',
      'technique',
      'variability',
      'interaction',
      'musicality'
    ]::text[]
  );

alter table public.catalog_products
  drop constraint if exists catalog_products_skills_allowed;

alter table public.catalog_products
  add constraint catalog_products_skills_allowed check (
    skills <@ array[
      'awareness',
      'technique',
      'variability',
      'interaction',
      'musicality'
    ]::text[]
  );

-- ---------------------------------------------------------------------------
-- Cover carousel + program gifs
-- ---------------------------------------------------------------------------

create table if not exists public.catalog_product_media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null,
  sort integer not null check (sort >= 0),
  url text not null,
  kind text not null,
  constraint catalog_product_media_product_id_fkey
    foreign key (product_id) references public.catalog_products (id) on delete cascade,
  constraint catalog_product_media_kind_check
    check (kind in ('cover', 'program_gif')),
  constraint catalog_product_media_product_sort_kind_key
    unique (product_id, sort, kind)
);

create index if not exists catalog_product_media_product_kind_idx
  on public.catalog_product_media (product_id, kind, sort);

comment on table public.catalog_product_media is
  'Product covers (carousel) and program gif assets. Public read when parent is published.';

-- ---------------------------------------------------------------------------
-- Course bundles (full course → block SKUs)
-- ---------------------------------------------------------------------------

create table if not exists public.catalog_product_bundles (
  parent_id uuid not null,
  child_id uuid not null,
  sort integer not null default 0 check (sort >= 0),
  constraint catalog_product_bundles_pkey primary key (parent_id, child_id),
  constraint catalog_product_bundles_parent_id_fkey
    foreign key (parent_id) references public.catalog_products (id) on delete cascade,
  constraint catalog_product_bundles_child_id_fkey
    foreign key (child_id) references public.catalog_products (id) on delete cascade,
  constraint catalog_product_bundles_no_self check (parent_id <> child_id)
);

create index if not exists catalog_product_bundles_child_idx
  on public.catalog_product_bundles (child_id);

comment on table public.catalog_product_bundles is
  'Buying parent grants access to children (see Edge webhook). Children together grant parent.';

-- ---------------------------------------------------------------------------
-- Structured course program (outcomes + lessons + gif urls)
-- ---------------------------------------------------------------------------

create table if not exists public.catalog_product_program (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null,
  block_key text not null,
  sort integer not null check (sort >= 0),
  kind text not null,
  gif_urls text[] not null default '{}'::text[],
  constraint catalog_product_program_product_id_fkey
    foreign key (product_id) references public.catalog_products (id) on delete cascade,
  constraint catalog_product_program_kind_check
    check (kind in ('outcome', 'lesson')),
  constraint catalog_product_program_product_block_sort_kind_key
    unique (product_id, block_key, sort, kind)
);

create table if not exists public.catalog_product_program_i18n (
  program_id uuid not null,
  locale text not null,
  body text not null,
  constraint catalog_product_program_i18n_pkey primary key (program_id, locale),
  constraint catalog_product_program_i18n_program_id_fkey
    foreign key (program_id) references public.catalog_product_program (id) on delete cascade,
  constraint catalog_product_program_i18n_locale_check
    check (locale in ('ru', 'en'))
);

comment on table public.catalog_product_program is
  'Structured program rows per product SKU (full course or single block).';

-- ---------------------------------------------------------------------------
-- RLS (public SELECT when parent product published)
-- ---------------------------------------------------------------------------

alter table public.catalog_product_media enable row level security;
alter table public.catalog_product_bundles enable row level security;
alter table public.catalog_product_program enable row level security;
alter table public.catalog_product_program_i18n enable row level security;

alter table public.catalog_product_media force row level security;
alter table public.catalog_product_bundles force row level security;
alter table public.catalog_product_program force row level security;
alter table public.catalog_product_program_i18n force row level security;

revoke all on table public.catalog_product_media from anon, authenticated;
revoke all on table public.catalog_product_bundles from anon, authenticated;
revoke all on table public.catalog_product_program from anon, authenticated;
revoke all on table public.catalog_product_program_i18n from anon, authenticated;

grant all on table public.catalog_product_media to service_role;
grant all on table public.catalog_product_bundles to service_role;
grant all on table public.catalog_product_program to service_role;
grant all on table public.catalog_product_program_i18n to service_role;

grant select on table public.catalog_product_media to anon, authenticated;
grant select on table public.catalog_product_bundles to anon, authenticated;
grant select on table public.catalog_product_program to anon, authenticated;
grant select on table public.catalog_product_program_i18n to anon, authenticated;

drop policy if exists catalog_product_media_public_read on public.catalog_product_media;
create policy catalog_product_media_public_read
  on public.catalog_product_media
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.catalog_products p
      where p.id = catalog_product_media.product_id
        and p.published = true
    )
  );

drop policy if exists catalog_product_bundles_public_read on public.catalog_product_bundles;
create policy catalog_product_bundles_public_read
  on public.catalog_product_bundles
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.catalog_products p
      where p.id = catalog_product_bundles.parent_id
        and p.published = true
    )
  );

drop policy if exists catalog_product_program_public_read on public.catalog_product_program;
create policy catalog_product_program_public_read
  on public.catalog_product_program
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.catalog_products p
      where p.id = catalog_product_program.product_id
        and p.published = true
    )
  );

drop policy if exists catalog_product_program_i18n_public_read on public.catalog_product_program_i18n;
create policy catalog_product_program_i18n_public_read
  on public.catalog_product_program_i18n
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.catalog_product_program pr
      join public.catalog_products p on p.id = pr.product_id
      where pr.id = catalog_product_program_i18n.program_id
        and p.published = true
    )
  );

notify pgrst, 'reload schema';
