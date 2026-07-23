-- Multi-month lesson groups (no community chat)

alter table subscriptions
  add column if not exists unlocked_months integer[] not null default '{1}'::integer[];

create table if not exists subscription_invites (
  invite_link text primary key,
  subscription_id uuid not null references subscriptions (id) on delete cascade,
  telegram_id bigint not null references bot_users (telegram_id) on delete cascade,
  month smallint not null check (month between 1 and 3),
  chat_id text not null,
  created_at timestamptz not null default now()
);

create index if not exists subscription_invites_sub_idx
  on subscription_invites (subscription_id);
create index if not exists subscription_invites_telegram_idx
  on subscription_invites (telegram_id);

alter table subscription_invites enable row level security;
alter table subscription_invites force row level security;
revoke all on table subscription_invites from anon, authenticated;
grant all on table subscription_invites to service_role;
