-- BeTango research bot schema

create extension if not exists pgcrypto;

create table if not exists bot_users (
  telegram_id bigint primary key,
  username text,
  first_name text,
  last_name text,
  payment_method text,
  state text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  telegram_id bigint not null references bot_users (telegram_id) on delete cascade,
  tariff text not null,
  payment_method text,
  status text not null default 'active',
  access_starts_at timestamptz not null default now(),
  access_ends_at timestamptz not null,
  invite_link text,
  invite_created_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists subscriptions_telegram_id_idx on subscriptions (telegram_id);
create index if not exists subscriptions_status_ends_idx on subscriptions (status, access_ends_at);

create table if not exists vip_intake (
  telegram_id bigint primary key references bot_users (telegram_id) on delete cascade,
  timezone_country text,
  preferred_days text,
  preferred_time text,
  topic text,
  step text not null default 'q1',
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists scheduled_messages (
  id uuid primary key default gen_random_uuid(),
  telegram_id bigint not null references bot_users (telegram_id) on delete cascade,
  kind text not null,
  payload jsonb not null default '{}'::jsonb,
  send_at timestamptz not null,
  sent_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists scheduled_messages_due_idx
  on scheduled_messages (send_at)
  where sent_at is null and cancelled_at is null;

create table if not exists bot_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

-- RLS: таблицы только для backend (service_role обходит RLS).
-- anon / authenticated без политик = доступа нет.
alter table bot_users enable row level security;
alter table subscriptions enable row level security;
alter table vip_intake enable row level security;
alter table scheduled_messages enable row level security;
alter table bot_settings enable row level security;

alter table bot_users force row level security;
alter table subscriptions force row level security;
alter table vip_intake force row level security;
alter table scheduled_messages force row level security;
alter table bot_settings force row level security;

revoke all on table bot_users from anon, authenticated;
revoke all on table subscriptions from anon, authenticated;
revoke all on table vip_intake from anon, authenticated;
revoke all on table scheduled_messages from anon, authenticated;
revoke all on table bot_settings from anon, authenticated;

grant all on table bot_users to service_role;
grant all on table subscriptions to service_role;
grant all on table vip_intake to service_role;
grant all on table scheduled_messages to service_role;
grant all on table bot_settings to service_role;
