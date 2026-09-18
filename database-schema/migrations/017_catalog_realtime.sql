-- Catalog support chat + notifications must reach the browser in realtime.
-- Replica identity FULL is required so filters on user_id work for UPDATE.

alter table public.catalog_notifications replica identity full;
alter table public.catalog_support_messages replica identity full;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'catalog_notifications'
  ) then
    execute 'alter publication supabase_realtime add table public.catalog_notifications';
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'catalog_support_messages'
  ) then
    execute 'alter publication supabase_realtime add table public.catalog_support_messages';
  end if;
end
$$;
