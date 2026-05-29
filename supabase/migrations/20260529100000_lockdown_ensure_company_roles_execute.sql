-- Restrict who can execute security-definer bootstrap helper.
-- This function should only run from trusted server-side contexts.
revoke all on function public.ensure_company_roles(uuid, uuid) from public;
revoke all on function public.ensure_company_roles(uuid, uuid) from anon;
revoke all on function public.ensure_company_roles(uuid, uuid) from authenticated;
grant execute on function public.ensure_company_roles(uuid, uuid) to service_role;
