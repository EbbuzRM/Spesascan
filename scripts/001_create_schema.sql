-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  display_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create stores table
create table if not exists public.stores (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create receipts table
create table if not exists public.receipts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  store_id uuid references public.stores(id),
  image_url text,
  status text default 'pending', -- pending, processed, rejected
  total_amount numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create products table
create table if not exists public.products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  category text default 'Altro',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create prices table
create table if not exists public.prices (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references public.products(id) on delete cascade not null,
  store_id uuid references public.stores(id) on delete cascade not null,
  price numeric not null,
  source_type text default 'receipt',
  source_receipt_id uuid references public.receipts(id),
  user_id uuid references auth.users on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.stores enable row level security;
alter table public.receipts enable row level security;
alter table public.products enable row level security;
alter table public.prices enable row level security;

-- Policies for profiles
create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on public.profiles for update
  using ( auth.uid() = id );

-- Policies for stores
create policy "Stores are viewable by everyone."
  on public.stores for select
  using ( true );

create policy "Authenticated users can create stores."
  on public.stores for insert
  with check ( auth.role() = 'authenticated' );

-- Policies for receipts
create policy "Users can view own receipts."
  on public.receipts for select
  using ( auth.uid() = user_id );

create policy "Users can insert own receipts."
  on public.receipts for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own receipts."
  on public.receipts for update
  using ( auth.uid() = user_id );

create policy "Users can delete own receipts."
  on public.receipts for delete
  using ( auth.uid() = user_id );

-- Policies for products
create policy "Products are viewable by everyone."
  on public.products for select
  using ( true );

create policy "Authenticated users can create products."
  on public.products for insert
  with check ( auth.role() = 'authenticated' );

-- Policies for prices
create policy "Prices are viewable by everyone."
  on public.prices for select
  using ( true );

create policy "Authenticated users can create prices."
  on public.prices for insert
  with check ( auth.role() = 'authenticated' );

create policy "Users can delete own prices."
  on public.prices for delete
  using ( auth.uid() = user_id );


-- Storage Bucket Setup
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', true)
on conflict (id) do nothing;

-- Storage Policies
create policy "Receipt images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'receipts' );

create policy "Authenticated users can upload receipt images."
  on storage.objects for insert
  with check ( bucket_id = 'receipts' and auth.role() = 'authenticated' );

create policy "Users can update own receipt images."
  on storage.objects for update
  using ( bucket_id = 'receipts' and auth.uid() = owner );
