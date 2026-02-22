-- Backfill public.users from auth.users and ensure the auth trigger exists.

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

  insert into public.users (id, username, email, role)
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

insert into public.users (id, username, email, role)
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

update public.users
set username = 'superadmin',
    role = 'superadmin'
where lower(email) = 'superadmin@vitafy.local';
