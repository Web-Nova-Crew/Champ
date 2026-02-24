-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Users Table (Extends Supabase Auth)
create table public.users (
  id uuid references auth.users not null primary key,
  full_name text,
  email text,
  phone text,
  role text default 'user' check (role in ('user', 'admin', 'agent', 'owner')),
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Properties Table
create table public.properties (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  type text not null,
  listing_type text not null check (listing_type in ('sale', 'rent')),
  price numeric not null,
  location text not null,
  city text not null,
  area text,
  bedrooms integer default 0,
  bathrooms integer default 0,
  sqft numeric default 0,
  images text[] default '{}',
  amenities text[] default '{}',
  latitude numeric,
  longitude numeric,
  owner_id uuid references public.users(id),
  owner_name text,
  owner_email text,
  owner_phone text,
  status text default 'pending' check (status in ('active', 'pending', 'sold', 'rented', 'rejected')),
  featured boolean default false,
  views integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Saved Properties (Wishlist)
create table public.saved_properties (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) not null,
  property_id uuid references public.properties(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, property_id)
);

-- Banners Table
create table public.banners (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  subtitle text,
  image text not null,
  link text,
  position text default 'hero' check (position in ('hero', 'sidebar', 'footer', 'popup')),
  active boolean default true,
  start_date date,
  end_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Categories (Property Types)
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  slug text not null unique,
  icon text default 'Home',
  description text,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Amenities
create table public.amenities (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  icon text default 'check',
  category text default 'basic' check (category in ('basic', 'comfort', 'security', 'outdoor')),
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Blog Posts
create table public.blog_posts (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text not null unique,
  content text,
  excerpt text,
  cover_image text,
  author_id uuid references public.users(id),
  status text default 'draft' check (status in ('published', 'draft', 'archived')),
  published_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Pages (Static Content)
create table public.pages (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text not null unique,
  content text,
  status text default 'draft' check (status in ('published', 'draft')),
  meta_title text,
  meta_description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Media Library
create table public.media_library (
  id uuid default uuid_generate_v4() primary key,
  filename text not null,
  url text not null,
  type text,
  size integer,
  uploaded_by uuid references public.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Mobile App: Feature Flags
create table public.feature_flags (
  id uuid default uuid_generate_v4() primary key,
  key text not null unique,
  name text not null,
  description text,
  enabled boolean default false,
  platform text default 'all' check (platform in ('android', 'ios', 'web', 'all')),
  rollout_percentage integer default 0 check (rollout_percentage >= 0 and rollout_percentage <= 100),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Mobile App: Remote Config
create table public.remote_config (
  id uuid default uuid_generate_v4() primary key,
  key text not null unique,
  value text not null,
  type text default 'string' check (type in ('string', 'number', 'boolean', 'json')),
  description text,
  platform text default 'all' check (platform in ('android', 'ios', 'all')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Mobile App: Push Templates
create table public.push_templates (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  title text not null,
  body text not null,
  trigger_event text,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Mobile App: App Versions
create table public.app_versions (
  id uuid default uuid_generate_v4() primary key,
  version text not null,
  platform text not null check (platform in ('android', 'ios')),
  force_update boolean default false,
  description text,
  release_date timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.properties enable row level security;
alter table public.saved_properties enable row level security;
alter table public.banners enable row level security;
alter table public.categories enable row level security;
alter table public.amenities enable row level security;
alter table public.blog_posts enable row level security;
alter table public.pages enable row level security;
alter table public.media_library enable row level security;
alter table public.feature_flags enable row level security;
alter table public.remote_config enable row level security;
alter table public.push_templates enable row level security;
alter table public.app_versions enable row level security;

-- Create Policies

-- Users: view own profile, admins view all
create policy "Public profiles are viewable by everyone" on public.users
  for select using (true);

create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

-- Properties: view active, admins view all, owners view own
create policy "Active properties are viewable by everyone" on public.properties
  for select using (status = 'active');

create policy "Users can view own properties" on public.properties
  for select using (auth.uid() = owner_id);

create policy "Users can insert own properties" on public.properties
  for insert with check (auth.uid() = owner_id);

create policy "Users can update own properties" on public.properties
  for update using (auth.uid() = owner_id);

-- Saved Properties: view/manage own
create policy "Users can view own saved properties" on public.saved_properties
  for select using (auth.uid() = user_id);

create policy "Users can insert own saved properties" on public.saved_properties
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own saved properties" on public.saved_properties
  for delete using (auth.uid() = user_id);

-- Admin Tables: Public Read, Admin Write
-- Helper function to check if user is admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- Apply admin policies to content tables
create policy "Content is viewable by everyone" on public.banners for select using (true);
create policy "Admins can manage banners" on public.banners for all using (public.is_admin());

create policy "Categories viewable by everyone" on public.categories for select using (true);
create policy "Admins can manage categories" on public.categories for all using (public.is_admin());

create policy "Amenities viewable by everyone" on public.amenities for select using (true);
create policy "Admins can manage amenities" on public.amenities for all using (public.is_admin());

create policy "Published posts viewable by everyone" on public.blog_posts for select using (status = 'published');
create policy "Admins can manage posts" on public.blog_posts for all using (public.is_admin());

create policy "Published pages viewable by everyone" on public.pages for select using (status = 'published');
create policy "Admins can manage pages" on public.pages for all using (public.is_admin());

create policy "Media viewable by everyone" on public.media_library for select using (true);
create policy "Admins can manage media" on public.media_library for all using (public.is_admin());

-- Mobile Config: Public Read (for app), Admin Write
create policy "Config viewable by everyone" on public.feature_flags for select using (true);
create policy "Admins can manage feature flags" on public.feature_flags for all using (public.is_admin());

create policy "Remote config viewable by everyone" on public.remote_config for select using (true);
create policy "Admins can manage remote config" on public.remote_config for all using (public.is_admin());

create policy "App versions viewable by everyone" on public.app_versions for select using (true);
create policy "Admins can manage app versions" on public.app_versions for all using (public.is_admin());

create policy "Admins can manage push templates" on public.push_templates for all using (public.is_admin());

-- Create Storage Buckets (need to be done via dashboard or API, but SQL can set policies)
insert into storage.buckets (id, name, public) values ('property-images', 'property-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public) values ('blog-images', 'blog-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public) values ('media', 'media', true)
on conflict (id) do nothing;

create policy "Public Access" on storage.objects for select using ( bucket_id in ('property-images', 'blog-images', 'media') );
create policy "Authenticated Upload" on storage.objects for insert with check ( auth.role() = 'authenticated' );
create policy "Owner Update" on storage.objects for update using ( auth.uid() = owner );
create policy "Owner Delete" on storage.objects for delete using ( auth.uid() = owner );
