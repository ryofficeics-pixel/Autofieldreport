create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  timezone text default 'Asia/Jakarta',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  status text not null default 'active' check (status in ('active', 'suspended', 'archived')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  description text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  key text not null,
  name text not null,
  description text,
  is_system boolean not null default false,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (company_id, key)
);

create table if not exists public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  primary key (role_id, permission_id)
);

create table if not exists public.company_members (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role_id uuid not null references public.roles(id),
  member_status text not null default 'active' check (member_status in ('invited', 'active', 'inactive')),
  invited_by uuid references auth.users(id),
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (company_id, user_id)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  code text not null,
  description text,
  project_status text not null default 'draft' check (project_status in ('draft', 'active', 'completed', 'archived')),
  start_date date,
  end_date date,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create unique index if not exists projects_company_code_uniq
  on public.projects(company_id, code)
  where deleted_at is null;

create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  address text,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  location_status text not null default 'active' check (location_status in ('active', 'inactive')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  name text not null,
  description text,
  team_status text not null default 'active' check (team_status in ('active', 'inactive')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.team_members (
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  role_title text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  primary key (team_id, user_id)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  location_id uuid references public.locations(id) on delete set null,
  report_type text not null check (report_type in ('daily', 'weekly', 'survey', 'progress')),
  report_date date not null,
  status text not null default 'draft' check (status in ('draft', 'submitted', 'approved', 'rejected', 'archived')),
  data jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  submitted_by uuid references auth.users(id),
  approved_by uuid references auth.users(id),
  submitted_at timestamptz,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.media_files (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  module text not null,
  record_id uuid,
  uploaded_by uuid references auth.users(id),
  cloudinary_public_id text not null,
  secure_url text not null,
  resource_type text,
  format text,
  bytes bigint,
  width integer,
  height integer,
  caption text,
  taken_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.offline_sync_jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  module text not null,
  action_type text not null,
  payload jsonb not null default '{}'::jsonb,
  attachment_refs jsonb not null default '[]'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'syncing', 'synced', 'failed', 'conflict')),
  tries integer not null default 0,
  last_error text,
  synced_response jsonb,
  created_by uuid references auth.users(id),
  synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  actor_user_id uuid references auth.users(id),
  action text not null,
  target_type text not null,
  target_id uuid,
  before_data jsonb,
  after_data jsonb,
  meta jsonb not null default '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists company_members_company_idx on public.company_members(company_id);
create index if not exists company_members_user_idx on public.company_members(user_id);
create index if not exists projects_company_idx on public.projects(company_id);
create index if not exists projects_company_status_idx on public.projects(company_id, project_status);
create index if not exists projects_company_created_idx on public.projects(company_id, created_at);
create index if not exists locations_company_idx on public.locations(company_id);
create index if not exists locations_company_project_idx on public.locations(company_id, project_id);
create index if not exists teams_company_idx on public.teams(company_id);
create index if not exists reports_company_idx on public.reports(company_id);
create index if not exists reports_company_status_idx on public.reports(company_id, status);
create index if not exists reports_project_date_idx on public.reports(project_id, report_date);
create index if not exists media_company_idx on public.media_files(company_id);
create index if not exists media_company_project_idx on public.media_files(company_id, project_id);
create index if not exists media_record_idx on public.media_files(module, record_id);
create index if not exists media_owner_idx on public.media_files(uploaded_by, created_at);
create index if not exists sync_jobs_company_idx on public.offline_sync_jobs(company_id);
create index if not exists sync_jobs_company_status_idx on public.offline_sync_jobs(company_id, status);
create index if not exists sync_jobs_company_created_idx on public.offline_sync_jobs(company_id, created_at);
create index if not exists audit_logs_company_idx on public.audit_logs(company_id, created_at);
create index if not exists audit_logs_target_idx on public.audit_logs(target_type, target_id);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_touch_updated_at on public.profiles;
create trigger trg_profiles_touch_updated_at before update on public.profiles
for each row execute function public.touch_updated_at();

drop trigger if exists trg_companies_touch_updated_at on public.companies;
create trigger trg_companies_touch_updated_at before update on public.companies
for each row execute function public.touch_updated_at();

drop trigger if exists trg_permissions_touch_updated_at on public.permissions;
create trigger trg_permissions_touch_updated_at before update on public.permissions
for each row execute function public.touch_updated_at();

drop trigger if exists trg_roles_touch_updated_at on public.roles;
create trigger trg_roles_touch_updated_at before update on public.roles
for each row execute function public.touch_updated_at();

drop trigger if exists trg_company_members_touch_updated_at on public.company_members;
create trigger trg_company_members_touch_updated_at before update on public.company_members
for each row execute function public.touch_updated_at();

drop trigger if exists trg_projects_touch_updated_at on public.projects;
create trigger trg_projects_touch_updated_at before update on public.projects
for each row execute function public.touch_updated_at();

drop trigger if exists trg_locations_touch_updated_at on public.locations;
create trigger trg_locations_touch_updated_at before update on public.locations
for each row execute function public.touch_updated_at();

drop trigger if exists trg_teams_touch_updated_at on public.teams;
create trigger trg_teams_touch_updated_at before update on public.teams
for each row execute function public.touch_updated_at();

drop trigger if exists trg_reports_touch_updated_at on public.reports;
create trigger trg_reports_touch_updated_at before update on public.reports
for each row execute function public.touch_updated_at();

drop trigger if exists trg_media_files_touch_updated_at on public.media_files;
create trigger trg_media_files_touch_updated_at before update on public.media_files
for each row execute function public.touch_updated_at();

drop trigger if exists trg_offline_sync_jobs_touch_updated_at on public.offline_sync_jobs;
create trigger trg_offline_sync_jobs_touch_updated_at before update on public.offline_sync_jobs
for each row execute function public.touch_updated_at();

create or replace function public.current_user_id()
returns uuid
language sql
stable
as $$
  select auth.uid();
$$;

create or replace function public.is_company_member(p_company_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public, pg_catalog
as $$
declare
  v_uid uuid;
begin
  v_uid := auth.uid();
  if v_uid is null then
    return false;
  end if;

  return exists (
    select 1
    from public.company_members cm
    where cm.company_id = p_company_id
      and cm.user_id = v_uid
      and cm.member_status = 'active'
      and cm.deleted_at is null
  );
end;
$$;

create or replace function public.has_company_role(p_company_id uuid, p_roles text[])
returns boolean
language plpgsql
stable
security definer
set search_path = public, pg_catalog
as $$
declare
  v_uid uuid;
begin
  v_uid := auth.uid();
  if v_uid is null then
    return false;
  end if;

  return exists (
    select 1
    from public.company_members cm
    join public.roles r on r.id = cm.role_id
    where cm.company_id = p_company_id
      and cm.user_id = v_uid
      and cm.member_status = 'active'
      and cm.deleted_at is null
      and r.deleted_at is null
      and r.key = any (p_roles)
  );
end;
$$;

create or replace function public.has_permission(p_company_id uuid, p_permission_key text)
returns boolean
language plpgsql
stable
security definer
set search_path = public, pg_catalog
as $$
declare
  v_uid uuid;
begin
  v_uid := auth.uid();
  if v_uid is null then
    return false;
  end if;

  return exists (
    select 1
    from public.company_members cm
    join public.roles r on r.id = cm.role_id
    join public.role_permissions rp on rp.role_id = r.id
    join public.permissions p on p.id = rp.permission_id
    where cm.company_id = p_company_id
      and cm.user_id = v_uid
      and cm.member_status = 'active'
      and cm.deleted_at is null
      and r.deleted_at is null
      and p.status = 'active'
      and p.key = p_permission_key
  );
end;
$$;

create or replace function public.insert_audit_log(
  p_company_id uuid,
  p_action text,
  p_target_type text,
  p_target_id uuid default null,
  p_before_data jsonb default null,
  p_after_data jsonb default null,
  p_meta jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_id uuid;
begin
  insert into public.audit_logs (
    company_id,
    actor_user_id,
    action,
    target_type,
    target_id,
    before_data,
    after_data,
    meta
  ) values (
    p_company_id,
    auth.uid(),
    p_action,
    p_target_type,
    p_target_id,
    p_before_data,
    p_after_data,
    coalesce(p_meta, '{}'::jsonb)
  )
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.is_company_member(uuid) from public;
revoke all on function public.has_company_role(uuid, text[]) from public;
revoke all on function public.has_permission(uuid, text) from public;
revoke all on function public.insert_audit_log(uuid, text, text, uuid, jsonb, jsonb, jsonb) from public;

grant execute on function public.current_user_id() to anon, authenticated, service_role;
grant execute on function public.is_company_member(uuid) to authenticated, service_role;
grant execute on function public.has_company_role(uuid, text[]) to authenticated, service_role;
grant execute on function public.has_permission(uuid, text) to authenticated, service_role;
grant execute on function public.insert_audit_log(uuid, text, text, uuid, jsonb, jsonb, jsonb) to authenticated, service_role;
