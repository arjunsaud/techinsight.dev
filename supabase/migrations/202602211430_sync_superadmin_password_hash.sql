-- Keep public.superadmins.password_hash aligned with auth.users.encrypted_password.
-- Note: Auth uses auth.users.encrypted_password for actual login verification.

do $$
begin
  if to_regclass('public.superadmins') is null or to_regclass('auth.users') is null then
    return;
  end if;

  update public.superadmins s
  set password_hash = u.encrypted_password
  from auth.users u
  where s.id::text = u.id::text
    and coalesce(s.password_hash, '') <> coalesce(u.encrypted_password, '');
end $$;
