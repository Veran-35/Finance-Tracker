-- ============================================================
--  MIGRASI: Bank / E-Wallet Accounts
--  Cara pakai: paste ke Supabase SQL Editor lalu "Run"
--              (SETELAH migration.sql dijalankan).
--  Aman dijalankan lebih dari sekali (idempoten):
--  tidak menghapus baris, backfill terkorelasi ke BCA
--  milik tiap user sendiri.
-- ============================================================

-- 1. Tabel accounts
create table if not exists public.accounts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  name        text not null,
  type        text not null default 'bank' check (type in ('bank', 'ewallet')),
  color       text not null default '#2A9D8F',
  icon        text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint accounts_user_name_unique unique (user_id, name)
);

create index if not exists idx_accounts_user      on public.accounts(user_id);
create index if not exists idx_accounts_user_type on public.accounts(user_id, type);

drop trigger if exists accounts_updated_at on public.accounts;
create trigger accounts_updated_at
  before update on public.accounts
  for each row execute procedure public.set_updated_at();


-- 2. Kolom transactions.account_id (cermin category_id di migration.sql)
alter table public.transactions
  add column if not exists account_id uuid
  references public.accounts(id) on delete set null;

create index if not exists idx_transactions_account on public.transactions(account_id);


-- 3. Seed akun default (BCA) per user — idempoten
create or replace function public.seed_default_accounts(p_user_id uuid)
returns void
language plpgsql
as $$
begin
  insert into public.accounts (user_id, name, type, color, icon)
  values (p_user_id, 'BCA', 'bank', '#2A9D8F', '🏦')
  on conflict (user_id, name) do nothing;
end;
$$;


-- 4. Profil baru: seed kategori + akun (ganti body fungsi yang sudah ada)
create or replace function public.handle_new_profile()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  perform public.seed_default_categories(new.id);
  perform public.seed_default_accounts(new.id);
  return new;
end;
$$;


-- 5. RLS accounts (cermin categories)
alter table public.accounts enable row level security;

drop policy if exists "Users manage own accounts" on public.accounts;
create policy "Users manage own accounts"
  on public.accounts for all
  using (is_owner(user_id))
  with check (is_owner(user_id));


-- 6. Backfill user & transaksi yang SUDAH ada
-- 6a. pastikan tiap profil punya BCA
insert into public.accounts (user_id, name, type, color, icon)
select p.id, 'BCA', 'bank', '#2A9D8F', '🏦'
from public.profiles p
on conflict (user_id, name) do nothing;

-- 6b. tugaskan transaksi tanpa akun ke BCA milik user-nya sendiri
update public.transactions t
set account_id = a.id
from public.accounts a
where t.account_id is null
  and a.user_id = t.user_id
  and a.name = 'BCA'
  and a.type = 'bank';
