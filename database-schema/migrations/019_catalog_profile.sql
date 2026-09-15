-- Catalog profile: name + avatar. Additive; does not touch bot_* tables.

alter table public.catalog_profiles
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists avatar_path text;

revoke update on table public.catalog_profiles from authenticated;
grant update (email, first_name, last_name, avatar_path)
  on table public.catalog_profiles to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'catalog-avatars',
  'catalog-avatars',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types,
  name = excluded.name;

drop policy if exists catalog_avatars_objects_select on storage.objects;
create policy catalog_avatars_objects_select
  on storage.objects
  for select
  to public
  using (bucket_id = 'catalog-avatars');

drop policy if exists catalog_avatars_objects_insert on storage.objects;
create policy catalog_avatars_objects_insert
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'catalog-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists catalog_avatars_objects_update on storage.objects;
create policy catalog_avatars_objects_update
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'catalog-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'catalog-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists catalog_avatars_objects_delete on storage.objects;
create policy catalog_avatars_objects_delete
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'catalog-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
