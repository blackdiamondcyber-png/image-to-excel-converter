-- SnapSheet Database Schema
-- Run this in the Supabase SQL editor to set up the database.

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── Users Profile Table ─────────────────────────────────────────
-- Extends Supabase auth.users with app-specific fields
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── Scans Table ─────────────────────────────────────────────────
-- Each scan represents one batch of images processed together
create table if not exists public.scans (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null default 'Untitled Scan',
  image_count integer not null default 0,
  table_count integer not null default 0,
  row_count integer not null default 0,
  tables_json jsonb not null default '[]'::jsonb,
  status text not null default 'completed' check (status in ('processing', 'completed', 'failed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.scans enable row level security;

create policy "Users can view own scans"
  on public.scans for select
  using (auth.uid() = user_id);

create policy "Users can insert own scans"
  on public.scans for insert
  with check (auth.uid() = user_id);

create policy "Users can update own scans"
  on public.scans for update
  using (auth.uid() = user_id);

create policy "Users can delete own scans"
  on public.scans for delete
  using (auth.uid() = user_id);

-- ─── Scan Images Table ───────────────────────────────────────────
-- Stores references to uploaded images in Supabase Storage
create table if not exists public.scan_images (
  id uuid default uuid_generate_v4() primary key,
  scan_id uuid references public.scans on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  file_name text not null,
  file_size integer,
  storage_path text not null,
  sort_order integer not null default 0,
  created_at timestamptz default now()
);

alter table public.scan_images enable row level security;

create policy "Users can view own scan images"
  on public.scan_images for select
  using (auth.uid() = user_id);

create policy "Users can insert own scan images"
  on public.scan_images for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own scan images"
  on public.scan_images for delete
  using (auth.uid() = user_id);

-- ─── Exports Table ───────────────────────────────────────────────
-- Tracks exported Excel files
create table if not exists public.exports (
  id uuid default uuid_generate_v4() primary key,
  scan_id uuid references public.scans on delete set null,
  user_id uuid references auth.users on delete cascade not null,
  file_name text not null,
  storage_path text,
  table_count integer not null default 0,
  row_count integer not null default 0,
  created_at timestamptz default now()
);

alter table public.exports enable row level security;

create policy "Users can view own exports"
  on public.exports for select
  using (auth.uid() = user_id);

create policy "Users can insert own exports"
  on public.exports for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own exports"
  on public.exports for delete
  using (auth.uid() = user_id);

-- ─── Storage Bucket ──────────────────────────────────────────────
-- Create storage bucket for scan images and exports
insert into storage.buckets (id, name, public)
values ('snapsheet', 'snapsheet', false)
on conflict (id) do nothing;

-- Storage policies: users can only access their own files
create policy "Users can upload to own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'snapsheet'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can view own files"
  on storage.objects for select
  using (
    bucket_id = 'snapsheet'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete own files"
  on storage.objects for delete
  using (
    bucket_id = 'snapsheet'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ─── Indexes ─────────────────────────────────────────────────────
create index if not exists idx_scans_user_id on public.scans (user_id);
create index if not exists idx_scans_created_at on public.scans (created_at desc);
create index if not exists idx_scan_images_scan_id on public.scan_images (scan_id);
create index if not exists idx_exports_user_id on public.exports (user_id);
create index if not exists idx_exports_scan_id on public.exports (scan_id);
