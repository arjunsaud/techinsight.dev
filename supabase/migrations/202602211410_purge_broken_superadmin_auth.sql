-- Purge corrupted legacy superadmin auth rows that break GoTrue queries.
-- This migration is intentionally targeted and idempotent.

do $$
declare
  v_email constant text := 'superadmin@vitafy.local';
  v_known_id constant text := 'e74c0555-7064-43af-a166-94d815d72f80';
  v_ids text[];
begin
  if to_regclass('auth.users') is null then
    raise exception 'auth.users table not found';
  end if;

  select coalesce(array_agg(distinct id), '{}'::text[])
  into v_ids
  from (
    select v_known_id as id
    union all
    select u.id::text
    from auth.users u
    where lower(coalesce(u.raw_user_meta_data ->> 'email', '')) = lower(v_email)
    union all
    select i.user_id::text
    from auth.identities i
    where lower(coalesce(i.identity_data ->> 'email', '')) = lower(v_email)
  ) matched
  where id is not null;

  if array_length(v_ids, 1) is null then
    return;
  end if;

  if to_regclass('auth.refresh_tokens') is not null then
    execute 'delete from auth.refresh_tokens where user_id::text = any($1)'
    using v_ids;
  end if;

  if to_regclass('auth.sessions') is not null then
    execute 'delete from auth.sessions where user_id::text = any($1)'
    using v_ids;
  end if;

  if to_regclass('auth.mfa_factors') is not null then
    execute 'delete from auth.mfa_factors where user_id::text = any($1)'
    using v_ids;
  end if;

  if to_regclass('auth.one_time_tokens') is not null then
    execute 'delete from auth.one_time_tokens where user_id::text = any($1)'
    using v_ids;
  end if;

  if to_regclass('auth.flow_state') is not null then
    execute 'delete from auth.flow_state where user_id::text = any($1)'
    using v_ids;
  end if;

  if to_regclass('auth.identities') is not null then
    execute 'delete from auth.identities where user_id::text = any($1)'
    using v_ids;
  end if;

  execute 'delete from auth.users where id::text = any($1)'
  using v_ids;
end $$;
