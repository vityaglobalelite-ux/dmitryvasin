-- Public read of landing price-increase countdown target.
-- Key: price_increase_at → ISO timestamptz string (e.g. 2026-07-25T00:00:00+03:00)

grant select on table public.bot_settings to anon, authenticated;

drop policy if exists bot_settings_public_price_increase on public.bot_settings;
create policy bot_settings_public_price_increase
  on public.bot_settings
  for select
  to anon, authenticated
  using (key = 'price_increase_at');

insert into public.bot_settings (key, value)
values ('price_increase_at', '2026-07-25T00:00:00+03:00')
on conflict (key) do nothing;
