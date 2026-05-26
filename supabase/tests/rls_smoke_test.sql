-- RLS smoke test template
-- Run this only in a controlled non-production database first.

begin;

-- Verify required helper functions exist
select proname
from pg_proc
where proname in ('is_company_member', 'has_company_role', 'has_permission', 'insert_audit_log')
order by proname;

-- Verify core tables exist
select tablename
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
  )
order by tablename;

-- Verify RLS enabled on key tables
select relname as table_name, relrowsecurity as rls_enabled
from pg_class
where relname in (
  'companies',
  'company_members',
  'roles',
  'projects',
  'reports',
  'media_files',
  'offline_sync_jobs',
  'audit_logs'
)
order by relname;

rollback;
