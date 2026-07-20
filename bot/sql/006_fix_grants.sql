-- Fix RLS/grants when applied as supabase_admin

alter table public.payments enable row level security;
alter table public.payments force row level security;
alter table public.tariff_prices enable row level security;
alter table public.tariff_prices force row level security;

revoke all on table public.payments from anon, authenticated;
revoke all on table public.tariff_prices from anon, authenticated;
grant all on table public.payments to service_role;
grant all on table public.tariff_prices to service_role;

create or replace function public.claim_paid_payment(p_id uuid)
returns public.payments
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.payments;
begin
  update public.payments
  set status = 'granting',
      updated_at = now(),
      error = null
  where id = p_id
    and status = 'paid'
  returning * into r;
  return r;
end;
$$;

revoke all on function public.claim_paid_payment(uuid) from public, anon, authenticated;
grant execute on function public.claim_paid_payment(uuid) to service_role;
