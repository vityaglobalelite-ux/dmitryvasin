-- Catalog watch progress. Additive; does not touch bot_* tables.
-- Write-only in this repo: do not apply to the live instance until a human asks.

create table if not exists public.catalog_watch_progress (
  user_id uuid not null,
  product_id uuid not null,
  position_sec integer not null default 0 check (position_sec >= 0),
  duration_sec integer not null default 0 check (duration_sec >= 0),
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint catalog_watch_progress_pkey primary key (user_id, product_id),
  constraint catalog_watch_progress_user_id_fkey
    foreign key (user_id) references public.catalog_profiles (id) on delete cascade,
  constraint catalog_watch_progress_product_id_fkey
    foreign key (product_id) references public.catalog_products (id) on delete cascade
);

comment on table public.catalog_watch_progress is
  'Per-user playback position. Own-row RLS; write only if catalog_access exists.';

create index if not exists catalog_watch_progress_user_updated_idx
  on public.catalog_watch_progress (user_id, updated_at desc);

alter table public.catalog_watch_progress enable row level security;
alter table public.catalog_watch_progress force row level security;

revoke all on table public.catalog_watch_progress from anon, authenticated;
grant all on table public.catalog_watch_progress to service_role;
grant select, insert, update on table public.catalog_watch_progress to authenticated;

drop policy if exists catalog_watch_progress_select_own on public.catalog_watch_progress;
create policy catalog_watch_progress_select_own
  on public.catalog_watch_progress
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists catalog_watch_progress_insert_own on public.catalog_watch_progress;
create policy catalog_watch_progress_insert_own
  on public.catalog_watch_progress
  for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.catalog_access a
      where a.user_id = auth.uid()
        and a.product_id = catalog_watch_progress.product_id
    )
  );

drop policy if exists catalog_watch_progress_update_own on public.catalog_watch_progress;
create policy catalog_watch_progress_update_own
  on public.catalog_watch_progress
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.catalog_access a
      where a.user_id = auth.uid()
        and a.product_id = catalog_watch_progress.product_id
    )
  );
