-- Repair superadmin auth/password and mirror hash into public.superadmins.password_hash.
-- This migration is safe to run multiple times.
-- Credentials:
--   email: superadmin@vitafy.local
--   password: SuperAdmin@12345

create extension if not exists pgcrypto with schema extensions;

do $$
declare
  v_email constant text := 'superadmin@vitafy.local';
  v_password constant text := 'SuperAdmin@12345';
  v_username constant text := 'superadmin';
  v_password_hash text := extensions.crypt(v_password, extensions.gen_salt('bf'));
  v_auth_id uuid;
  v_profile_id uuid;
begin
  if to_regclass('public.superadmins') is null then
    raise exception 'public.superadmins table not found';
  end if;

  select s.id
  into v_profile_id
  from public.superadmins s
  where lower(s.email) = lower(v_email)
  limit 1;

  select u.id
  into v_auth_id
  from auth.users u
  left join auth.identities i
    on i.user_id = u.id
   and i.provider = 'email'
  where lower(coalesce(u.email, i.identity_data ->> 'email', u.raw_user_meta_data ->> 'email')) = lower(v_email)
  order by u.created_at asc
  limit 1;

  if v_profile_id is not null and v_auth_id is null then
    v_auth_id := v_profile_id;
  elsif v_profile_id is not null and v_auth_id <> v_profile_id then
    raise exception 'Conflicting IDs for % (auth.users=% vs public.superadmins=%)', v_email, v_auth_id, v_profile_id;
  end if;

  if v_auth_id is null then
    v_auth_id := gen_random_uuid();
  end if;

  if exists (select 1 from auth.users where id = v_auth_id) then
    update auth.users
    set encrypted_password = v_password_hash,
        email_confirmed_at = coalesce(email_confirmed_at, now()),
        raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) ||
          '{"provider":"email","providers":["email"]}'::jsonb,
        raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) ||
          jsonb_build_object('email', v_email, 'username', v_username, 'role', 'superadmin'),
        updated_at = now()
    where id = v_auth_id;
  else
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
        v_auth_id,
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        v_email,
        v_password_hash,
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
          v_auth_id,
          '00000000-0000-0000-0000-000000000000',
          'authenticated',
          'authenticated',
          v_password_hash,
          now(),
          '{"provider":"email","providers":["email"]}'::jsonb,
          jsonb_build_object('email', v_email, 'username', v_username, 'role', 'superadmin'),
          now(),
          now()
        );
    end;
  end if;

  update auth.identities
  set provider_id = coalesce(provider_id, v_auth_id::text),
      identity_data = coalesce(identity_data, '{}'::jsonb) ||
        jsonb_build_object('sub', v_auth_id::text, 'email', v_email),
      updated_at = now()
  where user_id = v_auth_id
    and provider = 'email';

  if not found then
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
        v_auth_id,
        v_auth_id::text,
        jsonb_build_object('sub', v_auth_id::text, 'email', v_email),
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
            v_auth_id,
            v_auth_id::text,
            jsonb_build_object('sub', v_auth_id::text, 'email', v_email),
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
              v_auth_id,
              jsonb_build_object('sub', v_auth_id::text, 'email', v_email),
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
          v_auth_id,
          jsonb_build_object('sub', v_auth_id::text, 'email', v_email),
          'email',
          now(),
          now(),
          now()
        )
        on conflict do nothing;
    end;
  end if;

  insert into public.superadmins (id, username, email, role, password_hash)
  values (v_auth_id, v_username, v_email, 'superadmin', v_password_hash)
  on conflict (id) do update
    set username = excluded.username,
        email = excluded.email,
        role = excluded.role,
        password_hash = excluded.password_hash;

  update public.superadmins
  set username = v_username,
      role = 'superadmin',
      password_hash = v_password_hash
  where lower(email) = lower(v_email);
end $$;
