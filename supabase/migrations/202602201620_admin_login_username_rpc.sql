-- Enables username/password admin login without service role key.

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
    and u.role = 'admin'
  limit 1;
$$;

revoke all on function public.resolve_admin_email_by_username(text) from public;
grant execute on function public.resolve_admin_email_by_username(text) to anon, authenticated;
