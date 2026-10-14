-- ============================================================
--  MIGRASI: Kolom profil tambahan (tanggal lahir & jenis kelamin)
--  Cara pakai: paste ke Supabase SQL Editor lalu "Run"
--              (SETELAH migration.sql & migration_accounts.sql).
--  Aman dijalankan lebih dari sekali (idempoten).
-- ============================================================

-- 1. Kolom baru di profiles
alter table public.profiles
  add column if not exists birth_date date,
  add column if not exists gender text
    check (gender in ('laki-laki', 'perempuan', 'lainnya'));


-- 2. Trigger signup ikut menyimpan metadata profil
--    (username, avatar, birth_date, gender dikirim via options.data
--     saat signUp dan masuk ke raw_user_meta_data)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, avatar_url, birth_date, gender)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data->>'username', ''),
      split_part(new.email, '@', 1)
    ),
    nullif(new.raw_user_meta_data->>'avatar', ''),
    nullif(new.raw_user_meta_data->>'birth_date', '')::date,
    nullif(new.raw_user_meta_data->>'gender', '')
  );
  return new;
end;
$$;
