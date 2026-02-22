-- Make auth->profile sync robust when auth.users.email is generated/non-insertable.

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
    raise exception 'Unable to resolve email for auth user %', new.id;
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
