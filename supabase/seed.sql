-- Seed Superadmin User

DO $$
DECLARE
  v_email text := COALESCE(NULLIF(current_setting('app.settings.superadmin_email', true), ''));
  v_password text := COALESCE(NULLIF(current_setting('app.settings.superadmin_password', true), ''));
  v_username text := COALESCE(NULLIF(current_setting('app.settings.superadmin_username', true), ''));
  v_auth_id uuid;
BEGIN
  -- Check if user already exists
  SELECT id INTO v_auth_id FROM auth.users WHERE email = v_email;

  IF v_auth_id IS NULL THEN
    v_auth_id := gen_random_uuid();
    
    INSERT INTO auth.users (
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
    VALUES (
      v_auth_id,
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

    INSERT INTO auth.identities (
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
    VALUES (
      gen_random_uuid(),
      v_auth_id,
      v_auth_id::text,
      jsonb_build_object('sub', v_auth_id::text, 'email', v_email),
      'email',
      now(),
      now(),
      now(),
      v_email
    );

    INSERT INTO public.superadmins (id, username, email, role)
    VALUES (v_auth_id, v_username, v_email, 'superadmin')
    ON CONFLICT (id) DO UPDATE 
    SET username = EXCLUDED.username, 
        email = EXCLUDED.email, 
        role = EXCLUDED.role;
  ELSE
    -- User exists, update password just in case
    UPDATE auth.users
    SET encrypted_password = extensions.crypt(v_password, extensions.gen_salt('bf'))
    WHERE id = v_auth_id;
  END IF;

END $$;
