import { createSupabaseClients } from "./_lib/supabase.js";
import { badRequest, forbidden, methodNotAllowed, serverError, unauthorized, json } from "./_lib/http.js";
import { getBearerToken, getAuthenticatedUser, checkPermission, validateProjectScope } from "./_lib/authz.js";

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") return JSON.parse(req.body);
  return req.body;
}

const ALLOWED_TYPES = new Set(["daily", "weekly", "survey", "progress"]);

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  try {
    const token = getBearerToken(req);
    if (!token) return unauthorized(res);

    const { authClient, adminClient } = createSupabaseClients(token);
    const user = await getAuthenticatedUser(authClient);
    if (!user) return unauthorized(res);

    const body = parseBody(req);
    const {
      reportId = null,
      companyId,
      projectId,
      locationId = null,
      reportType,
      reportDate,
      data = {}
    } = body;

    if (!companyId || !projectId || !reportType || !reportDate) {
      return badRequest(res, "companyId, projectId, reportType, and reportDate are required");
    }
    if (!ALLOWED_TYPES.has(reportType)) return badRequest(res, "Unsupported reportType");

    const projectValid = await validateProjectScope(authClient, companyId, projectId);
    if (!projectValid) return forbidden(res, "projectId is invalid for this company");

    if (!reportId) {
      const canCreate = await checkPermission(authClient, companyId, "report.create");
      if (!canCreate) return forbidden(res, "User lacks report.create permission");

      const insertRes = await adminClient
        .from("reports")
        .insert({
          company_id: companyId,
          project_id: projectId,
          location_id: locationId,
          report_type: reportType,
          report_date: reportDate,
          status: "draft",
          data,
          created_by: user.id
        })
        .select("*")
        .single();
      if (insertRes.error) throw insertRes.error;

      await adminClient.rpc("insert_audit_log", {
        p_company_id: companyId,
        p_action: "report.create",
        p_target_type: "reports",
        p_target_id: insertRes.data.id,
        p_after_data: insertRes.data
      });

      return json(res, 200, { ok: true, report: insertRes.data });
    }

    const existingRes = await authClient
      .from("reports")
      .select("id, company_id, status, created_by")
      .eq("id", reportId)
      .eq("company_id", companyId)
      .maybeSingle();
    if (existingRes.error) throw existingRes.error;
    if (!existingRes.data?.id) return forbidden(res, "Report not found for company scope");

    const canUpdate = await checkPermission(authClient, companyId, "report.update");
    const creatorDraft = existingRes.data.created_by === user.id && existingRes.data.status === "draft";
    if (!canUpdate && !creatorDraft) return forbidden(res, "User cannot update this report");

    const updateRes = await adminClient
      .from("reports")
      .update({
        project_id: projectId,
        location_id: locationId,
        report_date: reportDate,
        data
      })
      .eq("id", reportId)
      .eq("company_id", companyId)
      .select("*")
      .single();
    if (updateRes.error) throw updateRes.error;

    await adminClient.rpc("insert_audit_log", {
      p_company_id: companyId,
      p_action: "report.update",
      p_target_type: "reports",
      p_target_id: updateRes.data.id,
      p_after_data: updateRes.data
    });

    return json(res, 200, { ok: true, report: updateRes.data });
  } catch (error) {
    return serverError(res, error);
  }
}
