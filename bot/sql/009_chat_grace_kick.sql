-- Grace period: +30 days chat access after subscription access_ends_at, then kick

alter table subscriptions
  add column if not exists chat_access_ends_at timestamptz;

alter table subscriptions
  add column if not exists chat_kicked_at timestamptz;

-- Backfill: paid end + 30 days
update subscriptions
set chat_access_ends_at = access_ends_at + interval '30 days'
where chat_access_ends_at is null;

create index if not exists subscriptions_chat_kick_idx
  on subscriptions (chat_access_ends_at)
  where chat_kicked_at is null;
