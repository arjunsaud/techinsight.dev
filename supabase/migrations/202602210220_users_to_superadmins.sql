-- Rename profile table from public.users to public.superadmins and
-- route admin auth checks to the new table.

do $$
begin
  if to_regclass('public.users') is not null
     and to_regclass('public.superadmins') is null then
    alter table public.users rename to superadmins;
  end if;
end $$;

alter table if exists public.superadmins drop constraint if exists users_role_check;
alter table if exists public.superadmins drop constraint if exists superadmins_role_check;
alter table if exists public.superadmins
  add constraint superadmins_role_check
  check (role in ('superadmin', 'admin', 'user'));

create or replace function public.handle_auth_user_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
begin
  v_email := coalesce(new.email, new.raw_user_meta_data ->> 'email');

  if v_email is null then
    return new;
  end if;

  insert into public.superadmins (id, username, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(v_email, '@', 1)),
    v_email,
    case
      when coalesce(new.raw_user_meta_data ->> 'role', 'user') in ('superadmin', 'admin', 'user')
        then coalesce(new.raw_user_meta_data ->> 'role', 'user')
      else 'user'
    end
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
    from public.superadmins s
    where s.id = auth.uid() and s.role in ('superadmin', 'admin')
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
    from public.superadmins s
    where s.id = auth.uid() and s.role = 'superadmin'
  );
$$;

create or replace function public.resolve_admin_email_by_username(input_username text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select s.email
  from public.superadmins s
  where lower(s.username) = lower(input_username)
    and s.role in ('admin', 'superadmin')
  limit 1;
$$;

revoke all on function public.resolve_admin_email_by_username(text) from public;
grant execute on function public.resolve_admin_email_by_username(text) to anon, authenticated;

alter table public.superadmins enable row level security;

drop policy if exists "Users can view users" on public.superadmins;
drop policy if exists "Admins can manage users" on public.superadmins;

create policy "Users can view users"
on public.superadmins
for select
using (auth.role() = 'authenticated');

create policy "Admins can manage users"
on public.superadmins
for all
using (public.is_admin())
with check (public.is_admin());

insert into public.superadmins (id, username, email, role)
select
  u.id,
  coalesce(
    u.raw_user_meta_data ->> 'username',
    split_part(
      coalesce(u.email, i.identity_data ->> 'email', u.raw_user_meta_data ->> 'email'),
      '@',
      1
    )
  ),
  coalesce(u.email, i.identity_data ->> 'email', u.raw_user_meta_data ->> 'email'),
  case
    when coalesce(u.raw_user_meta_data ->> 'role', 'user') in ('superadmin', 'admin', 'user')
      then coalesce(u.raw_user_meta_data ->> 'role', 'user')
    else 'user'
  end
from auth.users u
left join lateral (
  select ii.identity_data
  from auth.identities ii
  where ii.user_id = u.id
    and ii.provider = 'email'
  order by ii.created_at asc
  limit 1
) i on true
where coalesce(u.email, i.identity_data ->> 'email', u.raw_user_meta_data ->> 'email') is not null
on conflict (id) do update
  set username = excluded.username,
      email = excluded.email,
      role = excluded.role;

update public.superadmins
set username = 'superadmin',
    role = 'superadmin'
where lower(email) = 'superadmin@vitafy.local';
