-- Rewards / profile avatars.
--
-- Adds a profile avatar (stored in a public Storage bucket) and surfaces it on
-- the public leaderboard. Rank tiers, crowns, streak flair, and achievement
-- badges are computed CLIENT-SIDE from existing synced data (predicted_score,
-- xp, streak, mock/calibration stats) — no schema needed for those.

alter table public.profiles add column if not exists avatar_url text;

-- avatar_url is user-writable (profiles_self_update) and rendered as <img> on the
-- PUBLIC leaderboard. Without this, a user could point it at an arbitrary external
-- URL (IP-logging pixel, offensive image) shown to everyone. Constrain it to our
-- own avatars bucket (or null) so a malicious value can't even be stored.
alter table public.profiles drop constraint if exists avatar_url_origin_check;
alter table public.profiles add constraint avatar_url_origin_check check (
  avatar_url is null
  or avatar_url like 'https://rigtrdtdxpqtdjvpeqnr.supabase.co/storage/v1/object/public/avatars/%'
);

-- Public avatars bucket: world-readable (shown on the public leaderboard),
-- 2 MB cap, images only. Writes are restricted to the owner's own folder below.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Anyone may read avatars; a user may only write/replace/delete files under a
-- folder named with their own uid (path: "<uid>/...").
drop policy if exists avatars_public_read on storage.objects;
create policy avatars_public_read on storage.objects
  for select using ( bucket_id = 'avatars' );
drop policy if exists avatars_self_insert on storage.objects;
create policy avatars_self_insert on storage.objects
  for insert with check ( bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text );
drop policy if exists avatars_self_update on storage.objects;
create policy avatars_self_update on storage.objects
  for update using ( bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text );
drop policy if exists avatars_self_delete on storage.objects;
create policy avatars_self_delete on storage.objects
  for delete using ( bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text );

-- Surface avatar_url on the public leaderboard so ranked rows can show it.
create or replace view public.public_leaderboard as
  select us.user_id, us.xp, us.level, us.streak, us.predicted_score,
         p.display_name, p.avatar_url
  from public.user_state us
  join public.profiles p on p.user_id = us.user_id
  where p.is_publicly_listed = true;
