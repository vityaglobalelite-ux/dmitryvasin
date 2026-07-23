-- Support bot upgrade migration (additive, safe)
-- 1) Track which admin answered each message
alter table public.messages
  add column if not exists admin_id   bigint,
  add column if not exists admin_name text;

-- 2) Queue of users waiting for an answer.
--    A user message is "waiting" if no admin message exists in that chat
--    with a created_at strictly greater than the user's message.
create or replace function public.support_waiting()
returns table (
  chat_id          uuid,
  telegram_id      bigint,
  username         text,
  first_name       text,
  last_name        text,
  waiting_count    int,
  first_waiting_at timestamptz,
  last_waiting_at  timestamptz,
  bodies           text[]
)
language sql
stable
security definer
set search_path to 'public'
as $$
  with last_admin as (
    select chat_id, max(created_at) as t
    from messages
    where is_user = false
    group by chat_id
  )
  select
    m.chat_id,
    c.telegram_id,
    coalesce(c.username, u.username)                     as username,
    u.first_name,
    u.last_name,
    count(*)::int                                        as waiting_count,
    min(m.created_at)                                    as first_waiting_at,
    max(m.created_at)                                    as last_waiting_at,
    array_agg(m.body order by m.created_at)              as bodies
  from messages m
  join chats c on c.id = m.chat_id
  left join last_admin la on la.chat_id = m.chat_id
  left join bot_users u on u.telegram_id = c.telegram_id
  where m.is_user = true
    and (la.t is null or m.created_at > la.t)
  group by m.chat_id, c.telegram_id, coalesce(c.username, u.username), u.first_name, u.last_name
  order by min(m.created_at) asc;
$$;

-- 3) Recent dialogs list with a per-chat "waiting" counter.
create or replace function public.support_recent(p_limit int default 15)
returns table (
  chat_id              uuid,
  telegram_id          bigint,
  username             text,
  first_name           text,
  last_name            text,
  last_message_at      timestamptz,
  last_message_preview text,
  waiting_count        int
)
language sql
stable
security definer
set search_path to 'public'
as $$
  with last_admin as (
    select chat_id, max(created_at) as t
    from messages
    where is_user = false
    group by chat_id
  )
  select
    c.id,
    c.telegram_id,
    coalesce(c.username, u.username) as username,
    u.first_name,
    u.last_name,
    c.last_message_at,
    c.last_message_preview,
    (
      select count(*)
      from messages m
      where m.chat_id = c.id
        and m.is_user = true
        and m.created_at > coalesce(la.t, '-infinity'::timestamptz)
    )::int as waiting_count
  from chats c
  left join bot_users u on u.telegram_id = c.telegram_id
  left join last_admin la on la.chat_id = c.id
  order by c.last_message_at desc nulls last
  limit greatest(p_limit, 1);
$$;

-- 4) Per-chat status: total messages + how many are waiting for an answer.
create or replace function public.support_chat_status(p_chat_id uuid)
returns table (
  total_messages int,
  waiting_count  int
)
language sql
stable
security definer
set search_path to 'public'
as $$
  select
    (select count(*) from messages where chat_id = p_chat_id)::int,
    (
      select count(*)
      from messages m
      where m.chat_id = p_chat_id
        and m.is_user = true
        and m.created_at > coalesce(
          (select max(created_at) from messages where chat_id = p_chat_id and is_user = false),
          '-infinity'::timestamptz
        )
    )::int;
$$;
