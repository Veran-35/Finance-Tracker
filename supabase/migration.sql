-- ============================================================
--  PERSONAL WEBSITE — Supabase Schema
--  Modules: Auth (via Supabase), Financial Tracker,
--           Study Timer, Todo / Sticky Notes
--  Cara pakai: paste seluruh file ini ke Supabase SQL Editor
--              lalu klik "Run"
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";


-- ============================================================
-- 0. PROFILES
--    Extends Supabase auth.users — dibuat otomatis saat
--    user mendaftar via trigger di bawah
-- ============================================================

create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text unique not null,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Trigger: buat profil otomatis saat user baru register
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger: update updated_at otomatis
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();


-- ============================================================
-- 1. CATEGORIES
--    Dipakai bersama oleh Finance (transactions & budgets)
--    Field module: 'finance' | 'study'
-- ============================================================

create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  module      text not null check (module in ('finance', 'study')),
  name        text not null,
  color       text not null default '#6B7280',
  icon        text,
  created_at  timestamptz not null default now()
);

-- Seed kategori default untuk user baru
create or replace function public.seed_default_categories(p_user_id uuid)
returns void
language plpgsql
as $$
begin
  insert into public.categories (user_id, module, name, color, icon) values
    (p_user_id, 'finance', 'Makanan',        '#E76F51', '🍜'),
    (p_user_id, 'finance', 'Transportasi',   '#2A9D8F', '🚗'),
    (p_user_id, 'finance', 'Hiburan',        '#8338EC', '🎮'),
    (p_user_id, 'finance', 'Kesehatan',      '#E9C46A', '💊'),
    (p_user_id, 'finance', 'Belanja',        '#F4A261', '🛍️'),
    (p_user_id, 'finance', 'Tagihan',        '#457B9D', '🧾'),
    (p_user_id, 'finance', 'Gaji',           '#219EBC', '💼'),
    (p_user_id, 'finance', 'Freelance',      '#06D6A0', '💻'),
    (p_user_id, 'finance', 'Lainnya',        '#9CA3AF', '📦');
end;
$$;

-- Panggil seed saat profil baru dibuat
create or replace function public.handle_new_profile()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  perform public.seed_default_categories(new.id);
  return new;
end;
$$;

create trigger on_profile_created
  after insert on public.profiles
  for each row execute procedure public.handle_new_profile();


-- ============================================================
-- 2. FINANCIAL TRACKER
-- ============================================================

-- 2a. Transactions
create table public.transactions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  category_id      uuid references public.categories(id) on delete set null,
  type             text not null check (type in ('income', 'expense')),
  amount           numeric(15, 2) not null check (amount > 0),
  currency         text not null default 'IDR',
  description      text not null,
  transaction_date date not null default current_date,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create trigger transactions_updated_at
  before update on public.transactions
  for each row execute procedure public.set_updated_at();

-- Index untuk query umum
create index idx_transactions_user_date
  on public.transactions(user_id, transaction_date desc);

create index idx_transactions_user_type
  on public.transactions(user_id, type);

create index idx_transactions_category
  on public.transactions(category_id);

-- 2b. Budgets
create table public.budgets (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  category_id  uuid not null references public.categories(id) on delete cascade,
  amount       numeric(15, 2) not null check (amount > 0),
  period       text not null default 'monthly' check (period in ('weekly', 'monthly', 'yearly')),
  start_date   date not null,
  end_date     date not null,
  created_at   timestamptz not null default now(),
  constraint budgets_date_check check (end_date >= start_date),
  -- Satu budget per kategori per periode
  constraint budgets_unique_period unique (user_id, category_id, start_date, end_date)
);

create index idx_budgets_user on public.budgets(user_id);

-- 2c. View: ringkasan bulanan (income, expense, balance)
create or replace view public.finance_monthly_summary as
select
  user_id,
  date_trunc('month', transaction_date)::date as month,
  sum(amount) filter (where type = 'income')  as total_income,
  sum(amount) filter (where type = 'expense') as total_expense,
  sum(amount) filter (where type = 'income')
    - sum(amount) filter (where type = 'expense') as balance
from public.transactions
group by user_id, date_trunc('month', transaction_date);

-- 2d. View: pengeluaran vs budget bulan ini
create or replace view public.budget_progress as
select
  b.id            as budget_id,
  b.user_id,
  b.category_id,
  c.name          as category_name,
  c.color         as category_color,
  c.icon          as category_icon,
  b.amount        as budget_limit,
  b.period,
  b.start_date,
  b.end_date,
  coalesce(
    sum(t.amount) filter (
      where t.transaction_date between b.start_date and b.end_date
    ), 0
  )               as spent,
  b.amount - coalesce(
    sum(t.amount) filter (
      where t.transaction_date between b.start_date and b.end_date
    ), 0
  )               as remaining,
  round(
    coalesce(
      sum(t.amount) filter (
        where t.transaction_date between b.start_date and b.end_date
      ), 0
    ) / b.amount * 100, 1
  )               as percentage_used
from public.budgets b
join public.categories c on c.id = b.category_id
left join public.transactions t
  on t.category_id = b.category_id
  and t.user_id    = b.user_id
  and t.type       = 'expense'
group by b.id, b.user_id, b.category_id, c.name, c.color, c.icon,
         b.amount, b.period, b.start_date, b.end_date;


-- ============================================================
-- 3. STUDY TIMER
-- ============================================================

-- 3a. Subjects (mata pelajaran / topik)
create table public.subjects (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  name          text not null,
  color         text not null default '#3B82F6',
  total_seconds integer not null default 0 check (total_seconds >= 0),
  created_at    timestamptz not null default now()
);

create index idx_subjects_user on public.subjects(user_id);

-- 3b. Study sessions
create table public.study_sessions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  subject_id       uuid references public.subjects(id) on delete set null,
  mode             text not null default 'stopwatch' check (mode in ('pomodoro', 'stopwatch')),
  duration_seconds integer check (duration_seconds >= 0),
  status           text not null default 'in_progress'
                   check (status in ('in_progress', 'completed', 'cancelled')),
  started_at       timestamptz not null default now(),
  ended_at         timestamptz
);

create index idx_study_sessions_user on public.study_sessions(user_id, started_at desc);
create index idx_study_sessions_subject on public.study_sessions(subject_id);

-- Trigger: update total_seconds di subjects saat sesi selesai
create or replace function public.update_subject_total()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'completed'
     and new.subject_id is not null
     and new.duration_seconds is not null
  then
    update public.subjects
    set total_seconds = total_seconds + new.duration_seconds
    where id = new.subject_id;
  end if;
  return new;
end;
$$;

create trigger study_session_completed
  after update of status on public.study_sessions
  for each row
  when (old.status = 'in_progress' and new.status = 'completed')
  execute procedure public.update_subject_total();

-- Trigger yang sama untuk sesi yang langsung di-insert dengan status
-- 'completed' (aplikasi menyimpan sesi sekaligus dengan status akhir)
create trigger study_session_inserted
  after insert on public.study_sessions
  for each row
  when (new.status = 'completed'
     and new.subject_id is not null
     and new.duration_seconds is not null)
  execute procedure public.update_subject_total();

-- 3c. View: statistik belajar per user
create or replace view public.study_stats as
select
  user_id,
  count(*)                                              as total_sessions,
  coalesce(sum(duration_seconds) filter (
    where status = 'completed'), 0)                     as total_seconds,
  coalesce(sum(duration_seconds) filter (
    where status = 'completed'
    and started_at >= date_trunc('week', now())), 0)    as this_week_seconds,
  coalesce(sum(duration_seconds) filter (
    where status = 'completed'
    and started_at >= date_trunc('month', now())), 0)   as this_month_seconds
from public.study_sessions
group by user_id;


-- ============================================================
-- 4. TODO / STICKY NOTES
-- ============================================================

-- 4a. Todo lists (papan / koleksi)
create table public.todo_lists (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  title      text not null,
  color      text not null default '#6B7280',
  icon       text,
  position   integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger todo_lists_updated_at
  before update on public.todo_lists
  for each row execute procedure public.set_updated_at();

create index idx_todo_lists_user on public.todo_lists(user_id, position);

-- 4b. Todo items
create table public.todos (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  list_id      uuid not null references public.todo_lists(id) on delete cascade,
  title        text not null,
  content      text,
  is_completed boolean not null default false,
  priority     text not null default 'medium'
               check (priority in ('low', 'medium', 'high')),
  due_date     date,
  position     integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger todos_updated_at
  before update on public.todos
  for each row execute procedure public.set_updated_at();

create index idx_todos_list on public.todos(list_id, position);
create index idx_todos_user on public.todos(user_id);
create index idx_todos_due  on public.todos(user_id, due_date)
  where due_date is not null and is_completed = false;

-- 4c. View: todo lists dengan jumlah item
create or replace view public.todo_lists_with_counts as
select
  l.*,
  count(t.id)                                    as item_count,
  count(t.id) filter (where t.is_completed)      as completed_count,
  count(t.id) filter (where not t.is_completed)  as pending_count
from public.todo_lists l
left join public.todos t on t.list_id = l.id
group by l.id;


-- ============================================================
-- 5. ROW LEVEL SECURITY (RLS)
--    Setiap user hanya bisa akses data miliknya sendiri
-- ============================================================

-- Profiles
alter table public.profiles       enable row level security;
alter table public.categories     enable row level security;
alter table public.transactions   enable row level security;
alter table public.budgets        enable row level security;
alter table public.subjects       enable row level security;
alter table public.study_sessions enable row level security;
alter table public.todo_lists     enable row level security;
alter table public.todos          enable row level security;

-- Helper: cek apakah request berasal dari user yang login
create or replace function public.is_owner(row_user_id uuid)
returns boolean
language sql stable
as $$
  select auth.uid() = row_user_id
$$;

-- Profiles
create policy "Users can view own profile"
  on public.profiles for select
  using (is_owner(id));

create policy "Users can update own profile"
  on public.profiles for update
  using (is_owner(id));

-- Categories
create policy "Users manage own categories"
  on public.categories for all
  using (is_owner(user_id))
  with check (is_owner(user_id));

-- Transactions
create policy "Users manage own transactions"
  on public.transactions for all
  using (is_owner(user_id))
  with check (is_owner(user_id));

-- Budgets
create policy "Users manage own budgets"
  on public.budgets for all
  using (is_owner(user_id))
  with check (is_owner(user_id));

-- Subjects
create policy "Users manage own subjects"
  on public.subjects for all
  using (is_owner(user_id))
  with check (is_owner(user_id));

-- Study sessions
create policy "Users manage own study sessions"
  on public.study_sessions for all
  using (is_owner(user_id))
  with check (is_owner(user_id));

-- Todo lists
create policy "Users manage own todo lists"
  on public.todo_lists for all
  using (is_owner(user_id))
  with check (is_owner(user_id));

-- Todos
create policy "Users manage own todos"
  on public.todos for all
  using (is_owner(user_id))
  with check (is_owner(user_id));
