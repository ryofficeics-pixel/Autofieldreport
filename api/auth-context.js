import { createSupabaseClients } from "./_lib/supabase.js";
import { badRequest, methodNotAllowed, serverError, unauthorized, json } from "./_lib/http.js";
import { getBearerToken, getAuthenticatedUser } from "./_lib/authz.js";

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

export default async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);

  try {
    const token = getBearerToken(req);
    if (!token) return unauthorized(res);

    const { authClient } = createSupabaseClients(token);
    const user = await getAuthenticatedUser(authClient);
    if (!user) return unauthorized(res);

    const membersRes = await authClient
      .from("company_members")
      .select("company_id, role_id, member_status")
      .eq("user_id", user.id)
      .eq("member_status", "active")
      .is("deleted_at", null);
    if (membersRes.error) throw membersRes.error;

    const members = membersRes.data || [];
    const companyIds = unique(members.map((m) => m.company_id));
    const roleIds = unique(members.map((m) => m.role_id));

    const companiesRes = companyIds.length
      ? await authClient
          .from("companies")
          .select("id, name, slug, status")
          .in("id", companyIds)
          .is("deleted_at", null)
      : { data: [], error: null };
    if (companiesRes.error) throw companiesRes.error;

    const rolesRes = roleIds.length
      ? await authClient
          .from("roles")
          .select("id, company_id, key, name")
          .in("id", roleIds)
          .is("deleted_at", null)
      : { data: [], error: null };
    if (rolesRes.error) throw rolesRes.error;

    const rolePermRes = roleIds.length
      ? await authClient
          .from("role_permissions")
          .select("role_id, permission_id")
          .in("role_id", roleIds)
      : { data: [], error: null };
    if (rolePermRes.error) throw rolePermRes.error;

    const permissionIds = unique((rolePermRes.data || []).map((rp) => rp.permission_id));
    const permissionsRes = permissionIds.length
      ? await authClient
          .from("permissions")
          .select("id, key, name, status")
          .in("id", permissionIds)
          .eq("status", "active")
      : { data: [], error: null };
    if (permissionsRes.error) throw permissionsRes.error;

    const companiesById = new Map((companiesRes.data || []).map((c) => [c.id, c]));
    const rolesById = new Map((rolesRes.data || []).map((r) => [r.id, r]));
    const permById = new Map((permissionsRes.data || []).map((p) => [p.id, p]));

    const permByRoleId = new Map();
    for (const rp of rolePermRes.data || []) {
      const list = permByRoleId.get(rp.role_id) || [];
      const perm = permById.get(rp.permission_id);
      if (perm?.key) list.push(perm.key);
      permByRoleId.set(rp.role_id, list);
    }

    const memberships = members
      .map((m) => {
        const company = companiesById.get(m.company_id);
        const role = rolesById.get(m.role_id);
        if (!company || !role) return null;
        return {
          company_id: company.id,
          company_name: company.name,
          company_slug: company.slug,
          company_status: company.status,
          role_id: role.id,
          role_key: role.key,
          role_name: role.name,
          permissions: unique(permByRoleId.get(role.id) || [])
        };
      })
      .filter(Boolean);

    return json(res, 200, {
      ok: true,
      user: {
        id: user.id,
        email: user.email || null
      },
      memberships
    });
  } catch (error) {
    if (String(error.message || "").includes("invalid input syntax for type uuid")) {
      return badRequest(res, "Invalid UUID in auth-context query path");
    }
    return serverError(res, error);
  }
}
