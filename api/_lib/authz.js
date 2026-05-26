export function getBearerToken(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !String(authHeader).startsWith("Bearer ")) return null;
  return String(authHeader).slice("Bearer ".length).trim();
}

export async function getAuthenticatedUser(authClient) {
  const { data, error } = await authClient.auth.getUser();
  if (error || !data?.user) return null;
  return data.user;
}

export async function checkPermission(adminClient, companyId, permissionKey) {
  const { data, error } = await adminClient.rpc("has_permission", {
    p_company_id: companyId,
    p_permission_key: permissionKey
  });
  if (error) throw error;
  return Boolean(data);
}

export async function checkCompanyMembership(adminClient, companyId) {
  const { data, error } = await adminClient.rpc("is_company_member", {
    p_company_id: companyId
  });
  if (error) throw error;
  return Boolean(data);
}

export async function validateProjectScope(adminClient, companyId, projectId) {
  if (!projectId) return true;
  const { data, error } = await adminClient
    .from("projects")
    .select("id, company_id, deleted_at")
    .eq("id", projectId)
    .eq("company_id", companyId)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data?.id);
}
