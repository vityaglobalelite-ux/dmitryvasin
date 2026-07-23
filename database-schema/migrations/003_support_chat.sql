-- Support chat: диалоги пользователь ↔ админ

create table if not exists chats (
  id uuid primary key default gen_random_uuid(),
  telegram_id bigint not null unique references bot_users (telegram_id) on delete cascade,
  username text,
  status text not null default 'open' check (status in ('open', 'closed')),
  unread_user integer not null default 0 check (unread_user >= 0),
  unread_admin integer not null default 0 check (unread_admin >= 0),
  last_message_at timestamptz,
  last_message_preview text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists chats_status_last_msg_idx
  on chats (status, last_message_at desc nulls last);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references chats (id) on delete cascade,
  -- true = написал пользователь, false = админ / поддержка
  is_user boolean not null,
  body text not null,
  telegram_message_id bigint,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists messages_chat_created_idx
  on messages (chat_id, created_at);

create index if not exists messages_chat_unread_idx
  on messages (chat_id, is_user)
  where read_at is null;

-- Пересчёт непрочитанных по фактическим сообщениям (надёжнее инкрементов)
create or replace function refresh_chat_unread_counts(p_chat_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update chats c
  set
    unread_admin = (
      select count(*)::integer
      from messages m
      where m.chat_id = p_chat_id
        and m.is_user = true
        and m.read_at is null
    ),
    unread_user = (
      select count(*)::integer
      from messages m
      where m.chat_id = p_chat_id
        and m.is_user = false
        and m.read_at is null
    ),
    updated_at = now()
  where c.id = p_chat_id;
end;
$$;

create or replace function messages_after_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_chat_id uuid;
  v_preview text;
begin
  v_chat_id := coalesce(new.chat_id, old.chat_id);

  if tg_op = 'INSERT' then
    v_preview := left(new.body, 200);
    update chats
    set
      last_message_at = new.created_at,
      last_message_preview = v_preview,
      status = case when status = 'closed' then 'open' else status end,
      updated_at = now()
    where id = v_chat_id;
  end if;

  perform refresh_chat_unread_counts(v_chat_id);
  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_messages_after_change on messages;
create trigger trg_messages_after_change
  after insert or update of read_at, is_user, body or delete
  on messages
  for each row
  execute function messages_after_change();

-- Удобные хелперы для бота / админки
create or replace function mark_chat_read_for_admin(p_chat_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update messages
  set read_at = now()
  where chat_id = p_chat_id
    and is_user = true
    and read_at is null;
end;
$$;

create or replace function mark_chat_read_for_user(p_chat_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update messages
  set read_at = now()
  where chat_id = p_chat_id
    and is_user = false
    and read_at is null;
end;
$$;

-- RLS: только service_role (бот / будущая админка с service key или через RPC)
alter table chats enable row level security;
alter table messages enable row level security;
alter table chats force row level security;
alter table messages force row level security;

revoke all on table chats from anon, authenticated;
revoke all on table messages from anon, authenticated;
grant all on table chats to service_role;
grant all on table messages to service_role;

grant execute on function refresh_chat_unread_counts(uuid) to service_role;
grant execute on function mark_chat_read_for_admin(uuid) to service_role;
grant execute on function mark_chat_read_for_user(uuid) to service_role;
