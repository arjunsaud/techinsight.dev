-- Retry-safe backfill for superadmin profile in public.superadmins.
-- This migration only works if an auth user with this email already exists.

do $$
declare
  v_id uuid;
begin
  select u.id
  into v_id
  from auth.users u
  left join auth.identities i
    on i.user_id = u.id
   and i.provider = 'email'
  where lower(coalesce(u.email, i.identity_data ->> 'email', u.raw_user_meta_data ->> 'email')) = 'superadmin@vitafy.local'
  limit 1;

  if v_id is null then
    raise notice 'No auth.users row for superadmin@vitafy.local. Create the auth user first, then rerun this SQL.';
    return;
  end if;

  insert into public.superadmins (id, username, email, role)
  values (v_id, 'superadmin', 'superadmin@vitafy.local', 'superadmin')
  on conflict (id) do update
    set username = excluded.username,
        email = excluded.email,
        role = excluded.role;
end $$;
