-- Adds superadmin role and superadmin-aware helpers.

alter table public.users drop constraint if exists users_role_check;
alter table public.users
  add constraint users_role_check
  check (role in ('superadmin', 'admin', 'user'));

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
    where u.id = auth.uid() and u.role in ('superadmin', 'admin')
  );
$$;

create or replace function public.is_superadmin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users u
    where u.id = auth.uid() and u.role = 'superadmin'
  );
$$;

create or replace function public.resolve_admin_email_by_username(input_username text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select u.email
  from public.users u
  where lower(u.username) = lower(input_username)
    and u.role in ('admin', 'superadmin')
  limit 1;
$$;

revoke all on function public.resolve_admin_email_by_username(text) from public;
grant execute on function public.resolve_admin_email_by_username(text) to anon, authenticated;
