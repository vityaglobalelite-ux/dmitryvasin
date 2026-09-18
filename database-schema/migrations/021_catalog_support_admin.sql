-- Catalog support admin: unread, waiting queue, who answered.
-- Additive; does not touch bot_* club tables.

alter table public.catalog_support_messages
  add column if not exists read_at timestamptz,
  add column if not exists admin_telegram_id bigint,
  add column if not exists admin_name text;

create index if not exists catalog_support_messages_user_created_idx
  on public.catalog_support_messages (user_id, created_at);

create index if not exists catalog_support_messages_unread_admin_idx
  on public.catalog_support_messages (user_id)
  where from_role = 'user' and read_at is null;

create or replace function public.catalog_support_waiting()
returns table (
  user_id uuid,
  email text,
  first_name text,
  last_name text,
  waiting_count int,
  first_waiting_at timestamptz,
  last_waiting_at timestamptz,
  bodies text[]
)
language sql
stable
security definer
set search_path to 'public'
as $$
  with last_agent as (
    select user_id, max(created_at) as t
    from catalog_support_messages
    where from_role = 'agent'
    group by user_id
  )
  select
    m.user_id,
    p.email,
    p.first_name,
    p.last_name,
    count(*)::int as waiting_count,
    min(m.created_at) as first_waiting_at,
    max(m.created_at) as last_waiting_at,
    array_agg(left(m.body, 600) order by m.created_at) as bodies
  from catalog_support_messages m
  join catalog_profiles p on p.id = m.user_id
  left join last_agent la on la.user_id = m.user_id
  where m.from_role = 'user'
    and (la.t is null or m.created_at > la.t)
  group by m.user_id, p.email, p.first_name, p.last_name
  order by min(m.created_at) asc;
$$;

create or replace function public.catalog_support_recent(p_limit int default 15)
returns table (
  user_id uuid,
  email text,
  first_name text,
  last_name text,
  last_message_at timestamptz,
  last_message_preview text,
  waiting_count int
)
language sql
stable
security definer
set search_path to 'public'
as $$
  with last_agent as (
    select user_id, max(created_at) as t
    from catalog_support_messages
    where from_role = 'agent'
    group by user_id
  ),
  last_msg as (
    select distinct on (user_id)
      user_id,
      body,
      created_at
    from catalog_support_messages
    order by user_id, created_at desc
  )
  select
    lm.user_id,
    p.email,
    p.first_name,
    p.last_name,
    lm.created_at as last_message_at,
    left(lm.body, 200) as last_message_preview,
    (
      select count(*)::int
      from catalog_support_messages m
      where m.user_id = lm.user_id
        and m.from_role = 'user'
        and m.created_at > coalesce(la.t, '-infinity'::timestamptz)
    ) as waiting_count
  from last_msg lm
  join catalog_profiles p on p.id = lm.user_id
  left join last_agent la on la.user_id = lm.user_id
  order by lm.created_at desc
  limit greatest(p_limit, 1);
$$;

create or replace function public.catalog_support_thread_status(p_user_id uuid)
returns table (
  total_messages int,
  waiting_count int
)
language sql
stable
security definer
set search_path to 'public'
as $$
  select
    (select count(*) from catalog_support_messages where user_id = p_user_id)::int,
    (
      select count(*)::int
      from catalog_support_messages m
      where m.user_id = p_user_id
        and m.from_role = 'user'
        and m.created_at > coalesce(
          (
            select max(created_at)
            from catalog_support_messages
            where user_id = p_user_id
              and from_role = 'agent'
          ),
          '-infinity'::timestamptz
        )
    );
$$;

create or replace function public.mark_catalog_support_read_for_admin(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  update catalog_support_messages
  set read_at = now()
  where user_id = p_user_id
    and from_role = 'user'
    and read_at is null;
end;
$$;

create or replace function public.catalog_find_support_person(p_query text)
returns table (
  id uuid,
  email text,
  first_name text,
  last_name text
)
language plpgsql
stable
security definer
set search_path to 'public'
as $$
declare
  q text := lower(btrim(coalesce(p_query, '')));
  hex text;
begin
  if q = '' then
    return;
  end if;

  if q ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
    return query
      select p.id, p.email, p.first_name, p.last_name
      from catalog_profiles p
      where p.id = q::uuid;
    return;
  end if;

  hex := regexp_replace(q, '[^0-9a-f]', '', 'g');
  if length(hex) = 8 then
    return query
      select p.id, p.email, p.first_name, p.last_name
      from catalog_profiles p
      where replace(p.id::text, '-', '') like hex || '%';
    return;
  end if;

  return query
    select p.id, p.email, p.first_name, p.last_name
    from catalog_profiles p
    where p.email is not null
      and lower(p.email) not like '%@guest.betango.internal'
      and lower(p.email) = q
    limit 8;
end;
$$;

revoke all on function public.catalog_support_waiting() from public, anon, authenticated;
revoke all on function public.catalog_support_recent(int) from public, anon, authenticated;
revoke all on function public.catalog_support_thread_status(uuid) from public, anon, authenticated;
revoke all on function public.mark_catalog_support_read_for_admin(uuid) from public, anon, authenticated;
revoke all on function public.catalog_find_support_person(text) from public, anon, authenticated;

grant execute on function public.catalog_support_waiting() to service_role;
grant execute on function public.catalog_support_recent(int) to service_role;
grant execute on function public.catalog_support_thread_status(uuid) to service_role;
grant execute on function public.mark_catalog_support_read_for_admin(uuid) to service_role;
grant execute on function public.catalog_find_support_person(text) to service_role;
