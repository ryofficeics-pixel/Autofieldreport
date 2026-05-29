-- RLS smoke verification
-- Run on staging/test database with current migrations applied.
-- This script is read-only and validates policy/function/grant posture.

begin;

create temporary table _assertions (
  check_name text primary key,
  ok boolean not null,
  detail text not null
) on commit drop;

insert into _assertions (check_name, ok, detail)
select
  'core_helper_functions_exist',
  count(*) = 5,
  'expected=5 actual=' || count(*)
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'is_company_member',
    'has_company_role',
    'has_permission',
    'insert_audit_log',
    'ensure_company_roles'
  );

insert into _assertions (check_name, ok, detail)
select
  'security_definer_helpers',
  bool_and(p.prosecdef),
  'all helper functions must be SECURITY DEFINER'
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('is_company_member', 'has_company_role', 'has_permission', 'insert_audit_log', 'ensure_company_roles');

insert into _assertions (check_name, ok, detail)
select
  'core_tables_exist',
  count(*) = 10,
  'expected=10 actual=' || count(*)
from pg_tables
where schemaname = 'public'
  and tablename in (
    'companies',
    'company_members',
    'roles',
    'permissions',
    'role_permissions',
    'projects',
    'reports',
    'media_files',
    'offline_sync_jobs',
    'audit_logs'
  );

insert into _assertions (check_name, ok, detail)
select
  'rls_enabled_on_key_tables',
  count(*) = 8 and bool_and(c.relrowsecurity),
  'expected=8 tables with RLS enabled, actual=' || count(*)
from pg_class c
where c.relname in (
  'companies',
  'company_members',
  'roles',
  'projects',
  'reports',
  'media_files',
  'offline_sync_jobs',
  'audit_logs'
);

insert into _assertions (check_name, ok, detail)
select
  'required_policies_exist',
  count(*) = 6,
  'expected=6 critical policies, actual=' || count(*)
from pg_policies
where schemaname = 'public'
  and policyname in (
    'reports_select_authorized',
    'reports_insert_authorized',
    'reports_update_authorized',
    'media_select_authorized',
    'media_insert_authorized',
    'sync_jobs_member_rw'
  );

insert into _assertions (check_name, ok, detail)
select
  'reports_select_policy_has_company_and_permission_checks',
  exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'reports'
      and policyname = 'reports_select_authorized'
      and coalesce(qual, '') ilike '%is_company_member%'
      and coalesce(qual, '') ilike '%has_permission%'
  ),
  'reports_select_authorized should enforce company membership and report.read permission';

insert into _assertions (check_name, ok, detail)
select
  'media_insert_policy_has_scope_checks',
  exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'media_files'
      and policyname = 'media_insert_authorized'
      and coalesce(with_check, '') ilike '%is_company_member%'
      and coalesce(with_check, '') ilike '%has_permission%'
  ),
  'media_insert_authorized should enforce company membership and media.upload permission';

insert into _assertions (check_name, ok, detail)
select
  'no_anon_public_table_writes',
  count(*) = 0,
  'anon/public write grants count=' || count(*)
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('companies', 'projects', 'reports', 'media_files', 'offline_sync_jobs', 'audit_logs')
  and privilege_type in ('INSERT', 'UPDATE', 'DELETE')
  and lower(grantee) in ('anon', 'public');

insert into _assertions (check_name, ok, detail)
select
  'ensure_company_roles_service_only',
  not has_function_privilege('anon', 'public.ensure_company_roles(uuid, uuid)', 'EXECUTE')
  and not has_function_privilege('authenticated', 'public.ensure_company_roles(uuid, uuid)', 'EXECUTE')
  and has_function_privilege('service_role', 'public.ensure_company_roles(uuid, uuid)', 'EXECUTE'),
  'anon/authenticated must not execute ensure_company_roles; service_role must execute';

insert into _assertions (check_name, ok, detail)
select
  'report_permission_helper_executable_by_authenticated',
  has_function_privilege('authenticated', 'public.has_permission(uuid, text)', 'EXECUTE'),
  'authenticated must execute has_permission(uuid,text)';

select check_name, ok, detail
from _assertions
order by check_name;

do $$
begin
  if exists (select 1 from _assertions where not ok) then
    raise exception 'RLS smoke assertions failed. Review result rows above.';
  end if;
end $$;

rollback;
