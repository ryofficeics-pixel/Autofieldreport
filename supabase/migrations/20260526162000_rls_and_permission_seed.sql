insert into public.permissions (key, name, description)
values
  ('company.manage', 'Company Manage', 'Manage company settings'),
  ('user.invite', 'User Invite', 'Invite users to company'),
  ('user.read', 'User Read', 'Read users and member lists'),
  ('role.manage', 'Role Manage', 'Manage roles and capability mapping'),
  ('project.create', 'Project Create', 'Create project'),
  ('project.read', 'Project Read', 'Read project'),
  ('project.update', 'Project Update', 'Update project'),
  ('project.delete', 'Project Delete', 'Archive or delete project'),
  ('report.create', 'Report Create', 'Create report'),
  ('report.read', 'Report Read', 'Read report'),
  ('report.update', 'Report Update', 'Update report'),
  ('report.approve', 'Report Approve', 'Approve report'),
  ('report.reject', 'Report Reject', 'Reject report'),
  ('report.export', 'Report Export', 'Export report output'),
  ('media.upload', 'Media Upload', 'Upload media evidence'),
  ('media.read', 'Media Read', 'Read media metadata'),
  ('media.delete', 'Media Delete', 'Delete media metadata'),
  ('settings.manage', 'Settings Manage', 'Manage app settings'),
  ('audit.read', 'Audit Read', 'Read audit logs')
on conflict (key) do update
set
  name = excluded.name,
  description = excluded.description,
  updated_at = now();

create or replace function public.ensure_company_roles(p_company_id uuid, p_actor_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_role_id uuid;
begin
  insert into public.roles (company_id, key, name, description, is_system, status, created_by)
  values
    (p_company_id, 'owner', 'Owner', 'Full ownership', true, 'active', p_actor_user_id),
    (p_company_id, 'admin', 'Admin', 'Administrative access', true, 'active', p_actor_user_id),
    (p_company_id, 'manager', 'Manager', 'Operational management', true, 'active', p_actor_user_id),
    (p_company_id, 'supervisor', 'Supervisor', 'Supervision and approval', true, 'active', p_actor_user_id),
    (p_company_id, 'staff', 'Staff', 'Field operations', true, 'active', p_actor_user_id),
    (p_company_id, 'viewer', 'Viewer', 'Read-only access', true, 'active', p_actor_user_id)
  on conflict (company_id, key) do nothing;

  select id into v_role_id from public.roles where company_id = p_company_id and key = 'owner' limit 1;
  if v_role_id is not null then
    insert into public.role_permissions(role_id, permission_id, created_by)
    select v_role_id, p.id, p_actor_user_id
    from public.permissions p
    on conflict (role_id, permission_id) do nothing;
  end if;

  select id into v_role_id from public.roles where company_id = p_company_id and key = 'admin' limit 1;
  if v_role_id is not null then
    insert into public.role_permissions(role_id, permission_id, created_by)
    select v_role_id, p.id, p_actor_user_id
    from public.permissions p
    where p.key not in ('company.manage')
    on conflict (role_id, permission_id) do nothing;
  end if;

  select id into v_role_id from public.roles where company_id = p_company_id and key = 'manager' limit 1;
  if v_role_id is not null then
    insert into public.role_permissions(role_id, permission_id, created_by)
    select v_role_id, p.id, p_actor_user_id
    from public.permissions p
    where p.key in ('project.create','project.read','project.update','report.create','report.read','report.update','report.export','media.upload','media.read')
    on conflict (role_id, permission_id) do nothing;
  end if;

  select id into v_role_id from public.roles where company_id = p_company_id and key = 'supervisor' limit 1;
  if v_role_id is not null then
    insert into public.role_permissions(role_id, permission_id, created_by)
    select v_role_id, p.id, p_actor_user_id
    from public.permissions p
    where p.key in ('project.read','report.read','report.approve','report.reject','report.export','media.read','audit.read')
    on conflict (role_id, permission_id) do nothing;
  end if;

  select id into v_role_id from public.roles where company_id = p_company_id and key = 'staff' limit 1;
  if v_role_id is not null then
    insert into public.role_permissions(role_id, permission_id, created_by)
    select v_role_id, p.id, p_actor_user_id
    from public.permissions p
    where p.key in ('project.read','report.create','report.read','report.update','media.upload','media.read')
    on conflict (role_id, permission_id) do nothing;
  end if;

  select id into v_role_id from public.roles where company_id = p_company_id and key = 'viewer' limit 1;
  if v_role_id is not null then
    insert into public.role_permissions(role_id, permission_id, created_by)
    select v_role_id, p.id, p_actor_user_id
    from public.permissions p
    where p.key in ('project.read','report.read','media.read')
    on conflict (role_id, permission_id) do nothing;
  end if;
end;
$$;

do $$
declare
  c record;
begin
  for c in select id, created_by from public.companies loop
    perform public.ensure_company_roles(c.id, c.created_by);
  end loop;
end $$;

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.permissions enable row level security;
alter table public.roles enable row level security;
alter table public.role_permissions enable row level security;
alter table public.company_members enable row level security;
alter table public.projects enable row level security;
alter table public.locations enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.reports enable row level security;
alter table public.media_files enable row level security;
alter table public.offline_sync_jobs enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
for select using (id = auth.uid());

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
for insert with check (id = auth.uid());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists companies_select_member on public.companies;
create policy companies_select_member on public.companies
for select using (public.is_company_member(id));

drop policy if exists companies_insert_authenticated on public.companies;
create policy companies_insert_authenticated on public.companies
for insert with check (auth.uid() is not null);

drop policy if exists companies_update_admin on public.companies;
create policy companies_update_admin on public.companies
for update using (
  public.has_permission(id, 'company.manage')
  or public.has_company_role(id, array['owner','admin'])
) with check (
  public.has_permission(id, 'company.manage')
  or public.has_company_role(id, array['owner','admin'])
);

drop policy if exists permissions_select_authenticated on public.permissions;
create policy permissions_select_authenticated on public.permissions
for select using (auth.uid() is not null);

drop policy if exists roles_select_member on public.roles;
create policy roles_select_member on public.roles
for select using (public.is_company_member(company_id));

drop policy if exists roles_write_admin on public.roles;
create policy roles_write_admin on public.roles
for all using (
  public.has_permission(company_id, 'role.manage')
  or public.has_company_role(company_id, array['owner','admin'])
) with check (
  public.has_permission(company_id, 'role.manage')
  or public.has_company_role(company_id, array['owner','admin'])
);

drop policy if exists role_permissions_select_member on public.role_permissions;
create policy role_permissions_select_member on public.role_permissions
for select using (
  exists (
    select 1
    from public.roles r
    where r.id = role_permissions.role_id
      and public.is_company_member(r.company_id)
  )
);

drop policy if exists role_permissions_write_admin on public.role_permissions;
create policy role_permissions_write_admin on public.role_permissions
for all using (
  exists (
    select 1
    from public.roles r
    where r.id = role_permissions.role_id
      and (
        public.has_permission(r.company_id, 'role.manage')
        or public.has_company_role(r.company_id, array['owner','admin'])
      )
  )
) with check (
  exists (
    select 1
    from public.roles r
    where r.id = role_permissions.role_id
      and (
        public.has_permission(r.company_id, 'role.manage')
        or public.has_company_role(r.company_id, array['owner','admin'])
      )
  )
);

drop policy if exists company_members_select_member on public.company_members;
create policy company_members_select_member on public.company_members
for select using (public.is_company_member(company_id));

drop policy if exists company_members_insert_admin on public.company_members;
create policy company_members_insert_admin on public.company_members
for insert with check (
  public.has_permission(company_id, 'user.invite')
  or public.has_permission(company_id, 'role.manage')
  or public.has_company_role(company_id, array['owner','admin'])
);

drop policy if exists company_members_update_admin on public.company_members;
create policy company_members_update_admin on public.company_members
for update using (
  public.has_permission(company_id, 'role.manage')
  or public.has_company_role(company_id, array['owner','admin'])
) with check (
  public.has_permission(company_id, 'role.manage')
  or public.has_company_role(company_id, array['owner','admin'])
);

drop policy if exists projects_select_member on public.projects;
create policy projects_select_member on public.projects
for select using (
  public.is_company_member(company_id)
  and public.has_permission(company_id, 'project.read')
);

drop policy if exists projects_insert_authorized on public.projects;
create policy projects_insert_authorized on public.projects
for insert with check (
  public.is_company_member(company_id)
  and public.has_permission(company_id, 'project.create')
);

drop policy if exists projects_update_authorized on public.projects;
create policy projects_update_authorized on public.projects
for update using (
  public.is_company_member(company_id)
  and public.has_permission(company_id, 'project.update')
) with check (
  public.is_company_member(company_id)
  and public.has_permission(company_id, 'project.update')
);

drop policy if exists projects_delete_authorized on public.projects;
create policy projects_delete_authorized on public.projects
for delete using (
  public.is_company_member(company_id)
  and public.has_permission(company_id, 'project.delete')
);

drop policy if exists locations_member_rw on public.locations;
create policy locations_member_rw on public.locations
for all using (
  public.is_company_member(company_id)
  and public.has_permission(company_id, 'project.read')
) with check (
  public.is_company_member(company_id)
  and public.has_permission(company_id, 'project.update')
);

drop policy if exists teams_member_rw on public.teams;
create policy teams_member_rw on public.teams
for all using (
  public.is_company_member(company_id)
  and public.has_permission(company_id, 'project.read')
) with check (
  public.is_company_member(company_id)
  and public.has_permission(company_id, 'project.update')
);

drop policy if exists team_members_member_rw on public.team_members;
create policy team_members_member_rw on public.team_members
for all using (
  public.is_company_member(company_id)
) with check (
  public.is_company_member(company_id)
);

drop policy if exists reports_select_authorized on public.reports;
create policy reports_select_authorized on public.reports
for select using (
  public.is_company_member(company_id)
  and public.has_permission(company_id, 'report.read')
);

drop policy if exists reports_insert_authorized on public.reports;
create policy reports_insert_authorized on public.reports
for insert with check (
  public.is_company_member(company_id)
  and public.has_permission(company_id, 'report.create')
);

drop policy if exists reports_update_authorized on public.reports;
create policy reports_update_authorized on public.reports
for update using (
  public.is_company_member(company_id)
  and (
    public.has_permission(company_id, 'report.update')
    or (created_by = auth.uid() and status = 'draft')
    or public.has_permission(company_id, 'report.approve')
    or public.has_permission(company_id, 'report.reject')
  )
) with check (
  public.is_company_member(company_id)
);

drop policy if exists media_select_authorized on public.media_files;
create policy media_select_authorized on public.media_files
for select using (
  public.is_company_member(company_id)
  and public.has_permission(company_id, 'media.read')
);

drop policy if exists media_insert_authorized on public.media_files;
create policy media_insert_authorized on public.media_files
for insert with check (
  public.is_company_member(company_id)
  and public.has_permission(company_id, 'media.upload')
  and (
    project_id is null
    or exists (
      select 1 from public.projects p
      where p.id = media_files.project_id
        and p.company_id = media_files.company_id
        and p.deleted_at is null
    )
  )
);

drop policy if exists media_delete_authorized on public.media_files;
create policy media_delete_authorized on public.media_files
for delete using (
  public.is_company_member(company_id)
  and public.has_permission(company_id, 'media.delete')
);

drop policy if exists sync_jobs_member_rw on public.offline_sync_jobs;
create policy sync_jobs_member_rw on public.offline_sync_jobs
for all using (
  public.is_company_member(company_id)
) with check (
  public.is_company_member(company_id)
);

drop policy if exists audit_logs_select_authorized on public.audit_logs;
create policy audit_logs_select_authorized on public.audit_logs
for select using (
  public.is_company_member(company_id)
  and public.has_permission(company_id, 'audit.read')
);

drop policy if exists audit_logs_insert_member on public.audit_logs;
create policy audit_logs_insert_member on public.audit_logs
for insert with check (
  public.is_company_member(company_id)
);
