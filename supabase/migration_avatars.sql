-- ============================================================
--  MIGRASI: Bucket avatar (upload file gambar profil)
--  Cara pakai: paste ke Supabase SQL Editor lalu "Run"
--              (SETELAH migration_profile.sql).
--  Aman dijalankan lebih dari sekali (idempoten).
-- ============================================================

-- 1. Bucket publik 'avatars'
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 2. Semua orang boleh membaca avatar (untuk ditampilkan di UI)
drop policy if exists "Avatars public read" on storage.objects;
create policy "Avatars public read"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- 3. Hanya owner yang boleh mengunggah / menimpa / menghapus avatarnya
--    Path wajib diawali dengan uid pemilik: <uid>/avatar
drop policy if exists "Avatars owner insert" on storage.objects;
create policy "Avatars owner insert"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid() = (storage.foldername(name))[1]
  );

drop policy if exists "Avatars owner update" on storage.objects;
create policy "Avatars owner update"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid() = (storage.foldername(name))[1]
  );

drop policy if exists "Avatars owner delete" on storage.objects;
create policy "Avatars owner delete"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid() = (storage.foldername(name))[1]
  );
