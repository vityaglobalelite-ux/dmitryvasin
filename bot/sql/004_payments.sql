-- Stripe payments (foreign cards via Checkout + Edge Functions)

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  telegram_id bigint not null references bot_users (telegram_id) on delete cascade,
  tariff text not null,
  payment_method text not null default 'foreign',
  -- pending → paid → granting → granted | expired | failed | refunded
  status text not null default 'pending',
  amount_cents integer,
  currency text,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  stripe_event_id text,
  checkout_url text,
  subscription_id uuid references subscriptions (id) on delete set null,
  granted_at timestamptz,
  error text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payments_status_check check (
    status in (
      'pending',
      'paid',
      'granting',
      'granted',
      'expired',
      'failed',
      'refunded'
    )
  )
);

create index if not exists payments_telegram_id_idx on payments (telegram_id);
create index if not exists payments_status_idx on payments (status);
create index if not exists payments_pending_grant_idx
  on payments (created_at)
  where status = 'paid';

alter table payments enable row level security;
alter table payments force row level security;
revoke all on table payments from anon, authenticated;
grant all on table payments to service_role;

-- Atomically claim a paid payment for access grant (bot worker)
create or replace function claim_paid_payment(p_id uuid)
returns payments
language plpgsql
security definer
set search_path = public
as $$
declare
  r payments;
begin
  update payments
  set status = 'granting',
      updated_at = now(),
      error = null
  where id = p_id
    and status = 'paid'
  returning * into r;
  return r;
end;
$$;

revoke all on function claim_paid_payment(uuid) from public, anon, authenticated;
grant execute on function claim_paid_payment(uuid) to service_role;
