-- リーディングランプ: データベーススキーマ
-- Supabaseダッシュボードの SQL Editor に貼り付けて実行してください。

create extension if not exists "uuid-ossp";

-- ---------- books ----------
create table if not exists public.books (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  author text default '',
  status text not null default 'reading' check (status in ('reading','done','want')),
  cover_path text,
  created_at timestamptz not null default now(),
  finished_at timestamptz
);

create index if not exists books_user_id_idx on public.books(user_id);

alter table public.books enable row level security;

create policy "books_select_own" on public.books
  for select using (auth.uid() = user_id);
create policy "books_insert_own" on public.books
  for insert with check (auth.uid() = user_id);
create policy "books_update_own" on public.books
  for update using (auth.uid() = user_id);
create policy "books_delete_own" on public.books
  for delete using (auth.uid() = user_id);

-- ---------- records ----------
create table if not exists public.records (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  book_title text not null,
  date date not null,
  page_from int,
  page_to int,
  raw_text text not null,
  summary text not null,
  created_at timestamptz not null default now()
);

create index if not exists records_user_id_idx on public.records(user_id);
create index if not exists records_book_id_idx on public.records(book_id);
create index if not exists records_date_idx on public.records(date);

alter table public.records enable row level security;

create policy "records_select_own" on public.records
  for select using (auth.uid() = user_id);
create policy "records_insert_own" on public.records
  for insert with check (auth.uid() = user_id);
create policy "records_update_own" on public.records
  for update using (auth.uid() = user_id);
create policy "records_delete_own" on public.records
  for delete using (auth.uid() = user_id);

-- ---------- storage: book covers ----------
insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict (id) do nothing;

create policy "cover_images_public_read"
  on storage.objects for select
  using (bucket_id = 'covers');

create policy "cover_images_owner_write"
  on storage.objects for insert
  with check (bucket_id = 'covers' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "cover_images_owner_delete"
  on storage.objects for delete
  using (bucket_id = 'covers' and auth.uid()::text = (storage.foldername(name))[1]);
