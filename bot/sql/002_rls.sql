-- Apply on already-created tables (idempotent)

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
