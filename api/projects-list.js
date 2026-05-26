import { createSupabaseClients } from "./_lib/supabase.js";
import { badRequest, forbidden, methodNotAllowed, serverError, unauthorized, json } from "./_lib/http.js";
import { getBearerToken, getAuthenticatedUser, checkPermission } from "./_lib/authz.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);

  try {
    const token = getBearerToken(req);
    if (!token) return unauthorized(res);

    const { authClient } = createSupabaseClients(token);
    const user = await getAuthenticatedUser(authClient);
    if (!user) return unauthorized(res);

    const companyId = String(req.query.companyId || "");
    if (!companyId) return badRequest(res, "companyId query is required");

    const canRead = await checkPermission(authClient, companyId, "project.read");
    if (!canRead) return forbidden(res, "User lacks project.read permission");

    const { data, error } = await authClient
      .from("projects")
      .select("id, name, code, project_status, updated_at")
      .eq("company_id", companyId)
      .is("deleted_at", null)
      .order("updated_at", { ascending: false })
      .limit(200);
    if (error) throw error;

    return json(res, 200, {
      ok: true,
      projects: data || []
    });
  } catch (error) {
    return serverError(res, error);
  }
}
