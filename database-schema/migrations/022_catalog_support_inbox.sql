-- Catalog support inbox: unread queue, atomic agent reply, durable admin draft.
-- Additive. Replaces waiting semantics from 021: inbox = unread user messages.

create table if not exists public.catalog_support_admin_drafts (
  admin_telegram_id bigint primary key,
  user_id uuid not null,
  updated_at timestamptz not null default now(),
  constraint catalog_support_admin_drafts_user_id_fkey
    foreign key (user_id) references public.catalog_profiles (id) on delete cascade
);

alter table public.catalog_support_admin_drafts enable row level security;
alter table public.catalog_support_admin_drafts force row level security;

revoke all on table public.catalog_support_admin_drafts from anon, authenticated;
grant all on table public.catalog_support_admin_drafts to service_role;

-- Answered threads: user messages that already have a later agent reply
-- must not sit in the unread inbox.
update public.catalog_support_messages u
set read_at = (
  select min(a.created_at)
  from public.catalog_support_messages a
  where a.user_id = u.user_id
    and a.from_role = 'agent'
    and a.created_at > u.created_at
)
where u.from_role = 'user'
  and u.read_at is null
  and exists (
    select 1
    from public.catalog_support_messages a
    where a.user_id = u.user_id
      and a.from_role = 'agent'
      and a.created_at > u.created_at
  );

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
  where m.from_role = 'user'
    and m.read_at is null
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
  with last_msg as (
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
        and m.read_at is null
    ) as waiting_count
  from last_msg lm
  join catalog_profiles p on p.id = lm.user_id
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
      from catalog_support_messages
      where user_id = p_user_id
        and from_role = 'user'
        and read_at is null
    );
$$;

create or replace function public.catalog_support_post_agent_reply(
  p_user_id uuid,
  p_body text,
  p_storage_path text default null,
  p_admin_telegram_id bigint default null,
  p_admin_name text default null
)
returns public.catalog_support_messages
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_body text := btrim(coalesce(p_body, ''));
  v_path text := nullif(btrim(coalesce(p_storage_path, '')), '');
  v_preview text;
  v_row public.catalog_support_messages;
begin
  if p_user_id is null then
    raise exception 'invalid_user';
  end if;

  if not exists (select 1 from catalog_profiles where id = p_user_id) then
    raise exception 'missing_profile';
  end if;

  if v_path is not null then
    if v_path not like (p_user_id::text || '/%') or position('..' in v_path) > 0 then
      raise exception 'invalid_storage_path';
    end if;
  end if;

  if v_body = '' then
    v_body := case when v_path is not null then 'Вложение' else '' end;
  end if;

  if v_body = '' then
    raise exception 'empty_reply';
  end if;

  insert into catalog_support_messages (
    user_id,
    from_role,
    body,
    storage_path,
    admin_telegram_id,
    admin_name
  )
  values (
    p_user_id,
    'agent',
    v_body,
    v_path,
    p_admin_telegram_id,
    nullif(btrim(coalesce(p_admin_name, '')), '')
  )
  returning * into v_row;

  update catalog_support_messages
  set read_at = now()
  where user_id = p_user_id
    and from_role = 'user'
    and read_at is null;

  v_preview := left(v_body, 240);
  if length(v_body) > 240 then
    v_preview := v_preview || '…';
  end if;

  insert into catalog_notifications (
    user_id,
    type,
    title,
    body,
    href,
    read
  )
  values (
    p_user_id,
    'support_reply',
    'Ответ поддержки',
    v_preview,
    '/support/',
    false
  );

  return v_row;
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
      where left(replace(p.id::text, '-', ''), 8) = hex;
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

revoke all on function public.catalog_support_post_agent_reply(uuid, text, text, bigint, text)
  from public, anon, authenticated;
grant execute on function public.catalog_support_post_agent_reply(uuid, text, text, bigint, text)
  to service_role;
