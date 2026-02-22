-- Initial schema for admin-only blog platform.
create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  email text unique not null,
  password_hash text,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.blogs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content text not null,
  excerpt text,
  category_id uuid references public.categories(id) on delete set null,
  featured_image_url text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  author_id uuid not null references public.users(id) on delete restrict,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_tags (
  blog_id uuid not null references public.blogs(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blog_id, tag_id)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  blog_id uuid not null references public.blogs(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_blogs_status_published_at on public.blogs(status, published_at desc);
create index if not exists idx_blogs_category on public.blogs(category_id);
create index if not exists idx_comments_blog on public.comments(blog_id, created_at asc);
create index if not exists idx_comments_parent on public.comments(parent_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_blogs_updated_at on public.blogs;
create trigger trg_blogs_updated_at
before update on public.blogs
for each row
execute function public.set_updated_at();

create or replace function public.handle_auth_user_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, username, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'role', 'user')
  )
  on conflict (id) do update
    set username = excluded.username,
        email = excluded.email,
        role = excluded.role;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_auth_user_created();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users u
    where u.id = auth.uid() and u.role = 'admin'
  );
$$;

alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.blogs enable row level security;
alter table public.blog_tags enable row level security;
alter table public.comments enable row level security;

drop policy if exists "Users can view users" on public.users;
drop policy if exists "Admins can manage users" on public.users;
drop policy if exists "Categories public read" on public.categories;
drop policy if exists "Admins manage categories" on public.categories;
drop policy if exists "Tags public read" on public.tags;
drop policy if exists "Admins manage tags" on public.tags;
drop policy if exists "Published blogs public read" on public.blogs;
drop policy if exists "Admins manage blogs" on public.blogs;
drop policy if exists "Blog tags public read" on public.blog_tags;
drop policy if exists "Admins manage blog tags" on public.blog_tags;
drop policy if exists "Comments public read" on public.comments;
drop policy if exists "Authenticated users can create comments" on public.comments;
drop policy if exists "Admins delete comments" on public.comments;

-- Users
create policy "Users can view users"
on public.users
for select
using (auth.role() = 'authenticated');

create policy "Admins can manage users"
on public.users
for all
using (public.is_admin())
with check (public.is_admin());

-- Categories and tags
create policy "Categories public read"
on public.categories
for select
using (true);

create policy "Admins manage categories"
on public.categories
for all
using (public.is_admin())
with check (public.is_admin());

create policy "Tags public read"
on public.tags
for select
using (true);

create policy "Admins manage tags"
on public.tags
for all
using (public.is_admin())
with check (public.is_admin());

-- Blogs
create policy "Published blogs public read"
on public.blogs
for select
using (
  status = 'published' or public.is_admin()
);

create policy "Admins manage blogs"
on public.blogs
for all
using (public.is_admin())
with check (public.is_admin());

-- Blog tags
create policy "Blog tags public read"
on public.blog_tags
for select
using (true);

create policy "Admins manage blog tags"
on public.blog_tags
for all
using (public.is_admin())
with check (public.is_admin());

-- Comments
create policy "Comments public read"
on public.comments
for select
using (true);

create policy "Authenticated users can create comments"
on public.comments
for insert
with check (
  auth.uid() = user_id and exists (
    select 1
    from public.blogs b
    where b.id = blog_id and b.status = 'published'
  )
);

create policy "Admins delete comments"
on public.comments
for delete
using (public.is_admin());
