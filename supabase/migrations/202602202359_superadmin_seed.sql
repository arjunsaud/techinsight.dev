-- Seed (or repair) initial superadmin auth user + profile.
-- Credentials:
--   email: superadmin@vitafy.local
--   password: SuperAdmin@12345
-- IMPORTANT: rotate this password immediately in non-dev environments.

create extension if not exists pgcrypto with schema extensions;

-- Keep auth->profile sync robust even when auth.users.email is generated/non-insertable.
create or replace function public.handle_auth_user_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
  v_role text;
  v_username text;
begin
  v_email := coalesce(new.email, new.raw_user_meta_data ->> 'email');

  if v_email is null then
    return new;
  end if;

  v_role := case
    when coalesce(new.raw_user_meta_data ->> 'role', 'user') in ('superadmin', 'admin', 'user')
      then coalesce(new.raw_user_meta_data ->> 'role', 'user')
    else 'user'
  end;

  v_username := coalesce(new.raw_user_meta_data ->> 'username', split_part(v_email, '@', 1));

  if to_regclass('public.superadmins') is not null then
    execute $sql$
      insert into public.superadmins (id, username, email, role)
      values ($1, $2, $3, $4)
      on conflict (id) do update
        set username = excluded.username,
            email = excluded.email,
            role = excluded.role
    $sql$
    using new.id, v_username, v_email, v_role;
  elsif to_regclass('public.users') is not null then
    execute $sql$
      insert into public.users (id, username, email, role)
      values ($1, $2, $3, $4)
      on conflict (id) do update
        set username = excluded.username,
            email = excluded.email,
            role = excluded.role
    $sql$
    using new.id, v_username, v_email, v_role;
  end if;

  return new;
end;
$$;

do $$
declare
  v_email constant text := 'superadmin@vitafy.local';
  v_password constant text := 'SuperAdmin@12345';
  v_username constant text := 'superadmin';
  v_superadmin_id uuid;
begin
  select u.id
  into v_superadmin_id
  from auth.users u
  left join auth.identities i
    on i.user_id = u.id
   and i.provider = 'email'
  where lower(coalesce(u.email, i.identity_data ->> 'email', u.raw_user_meta_data ->> 'email')) = lower(v_email)
  order by u.created_at asc
  limit 1;

  if v_superadmin_id is null then
    v_superadmin_id := gen_random_uuid();

    begin
      insert into auth.users (
        id,
        instance_id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at
      )
      values (
        v_superadmin_id,
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        v_email,
        extensions.crypt(v_password, extensions.gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('email', v_email, 'username', v_username, 'role', 'superadmin'),
        now(),
        now()
      );
    exception
      when SQLSTATE '428C9' then
        insert into auth.users (
          id,
          instance_id,
          aud,
          role,
          encrypted_password,
          email_confirmed_at,
          raw_app_meta_data,
          raw_user_meta_data,
          created_at,
          updated_at
        )
        values (
          v_superadmin_id,
          '00000000-0000-0000-0000-000000000000',
          'authenticated',
          'authenticated',
          extensions.crypt(v_password, extensions.gen_salt('bf')),
          now(),
          '{"provider":"email","providers":["email"]}'::jsonb,
          jsonb_build_object('email', v_email, 'username', v_username, 'role', 'superadmin'),
          now(),
          now()
        );
    end;
  else
    update auth.users
    set encrypted_password = extensions.crypt(v_password, extensions.gen_salt('bf')),
        email_confirmed_at = coalesce(email_confirmed_at, now()),
        raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) ||
          '{"provider":"email","providers":["email"]}'::jsonb,
        raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) ||
          jsonb_build_object('email', v_email, 'username', v_username, 'role', 'superadmin'),
        updated_at = now()
    where id = v_superadmin_id;
  end if;

  begin
    insert into auth.identities (
      id,
      user_id,
      provider_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at,
      email
    )
    values (
      gen_random_uuid(),
      v_superadmin_id,
      v_superadmin_id::text,
      jsonb_build_object('sub', v_superadmin_id::text, 'email', v_email),
      'email',
      now(),
      now(),
      now(),
      v_email
    )
    on conflict do nothing;
  exception
    when SQLSTATE '428C9' then
      begin
        insert into auth.identities (
          id,
          user_id,
          provider_id,
          identity_data,
          provider,
          last_sign_in_at,
          created_at,
          updated_at
        )
        values (
          gen_random_uuid(),
          v_superadmin_id,
          v_superadmin_id::text,
          jsonb_build_object('sub', v_superadmin_id::text, 'email', v_email),
          'email',
          now(),
          now(),
          now()
        )
        on conflict do nothing;
      exception
        when undefined_column then
          insert into auth.identities (
            id,
            user_id,
            identity_data,
            provider,
            last_sign_in_at,
            created_at,
            updated_at
          )
          values (
            gen_random_uuid(),
            v_superadmin_id,
            jsonb_build_object('sub', v_superadmin_id::text, 'email', v_email),
            'email',
            now(),
            now(),
            now()
          )
          on conflict do nothing;
      end;
    when undefined_column then
      insert into auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        last_sign_in_at,
        created_at,
        updated_at
      )
      values (
        gen_random_uuid(),
        v_superadmin_id,
        jsonb_build_object('sub', v_superadmin_id::text, 'email', v_email),
        'email',
        now(),
        now(),
        now()
      )
      on conflict do nothing;
  end;

  if to_regclass('public.superadmins') is not null then
    insert into public.superadmins (id, username, email, role)
    values (v_superadmin_id, v_username, v_email, 'superadmin')
    on conflict (id) do update
      set username = excluded.username,
          email = excluded.email,
          role = excluded.role;
  elsif to_regclass('public.users') is not null then
    insert into public.users (id, username, email, role)
    values (v_superadmin_id, v_username, v_email, 'superadmin')
    on conflict (id) do update
      set username = excluded.username,
          email = excluded.email,
          role = excluded.role;
  end if;
end $$;
