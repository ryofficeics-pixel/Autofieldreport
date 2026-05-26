import { createSupabaseClients } from "./_lib/supabase.js";
import { badRequest, methodNotAllowed, serverError, unauthorized, json } from "./_lib/http.js";
import { getBearerToken, getAuthenticatedUser } from "./_lib/authz.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);

  try {
    const token = getBearerToken(req);
    if (!token) return unauthorized(res);

    const { authClient } = createSupabaseClients(token);
    const user = await getAuthenticatedUser(authClient);
    if (!user) return unauthorized(res);

    const companyId = req.query.companyId;
    const reportType = req.query.reportType || null;
    const projectId = req.query.projectId || null;
    if (!companyId) return badRequest(res, "companyId query is required");

    let query = authClient
      .from("reports")
      .select("id, company_id, project_id, report_type, report_date, status, created_at, updated_at")
      .eq("company_id", companyId)
      .order("report_date", { ascending: false })
      .limit(50);

    if (reportType) query = query.eq("report_type", reportType);
    if (projectId) query = query.eq("project_id", projectId);

    const { data, error } = await query;
    if (error) throw error;
    return json(res, 200, { ok: true, reports: data || [] });
  } catch (error) {
    return serverError(res, error);
  }
}
