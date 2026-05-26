import { createSupabaseClients } from "./_lib/supabase.js";
import { badRequest, forbidden, methodNotAllowed, serverError, unauthorized, json } from "./_lib/http.js";
import { getBearerToken, getAuthenticatedUser, checkPermission } from "./_lib/authz.js";

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") return JSON.parse(req.body);
  return req.body;
}

const ALLOWED_STATUS = new Set(["submitted", "approved", "rejected"]);

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
      reportId,
      companyId,
      nextStatus,
      rejectionReason = null
    } = body;

    if (!reportId || !companyId || !nextStatus) {
      return badRequest(res, "reportId, companyId, and nextStatus are required");
    }
    if (!ALLOWED_STATUS.has(nextStatus)) return badRequest(res, "Unsupported nextStatus");

    const reportRes = await authClient
      .from("reports")
      .select("id, company_id, created_by, status, data")
      .eq("id", reportId)
      .eq("company_id", companyId)
      .maybeSingle();
    if (reportRes.error) throw reportRes.error;
    if (!reportRes.data?.id) return forbidden(res, "Report not found for company scope");

    let allowed = false;
    if (nextStatus === "submitted") {
      const canUpdate = await checkPermission(authClient, companyId, "report.update");
      allowed = canUpdate || reportRes.data.created_by === user.id;
    } else if (nextStatus === "approved") {
      allowed = await checkPermission(authClient, companyId, "report.approve");
    } else if (nextStatus === "rejected") {
      allowed = await checkPermission(authClient, companyId, "report.reject");
      if (!rejectionReason) return badRequest(res, "rejectionReason is required for rejected status");
    }
    if (!allowed) return forbidden(res, "User lacks permission for this status transition");

    const patch = { status: nextStatus };
    if (nextStatus === "submitted") {
      patch.submitted_by = user.id;
      patch.submitted_at = new Date().toISOString();
    }
    if (nextStatus === "approved") {
      patch.approved_by = user.id;
      patch.approved_at = new Date().toISOString();
    }
    if (nextStatus === "rejected") {
      patch.data = {
        ...(reportRes.data.data || {}),
        rejection_reason: rejectionReason
      };
    }

    const updateRes = await adminClient
      .from("reports")
      .update(patch)
      .eq("id", reportId)
      .eq("company_id", companyId)
      .select("*")
      .single();
    if (updateRes.error) throw updateRes.error;

    await adminClient.rpc("insert_audit_log", {
      p_company_id: companyId,
      p_action: `report.status.${nextStatus}`,
      p_target_type: "reports",
      p_target_id: updateRes.data.id,
      p_after_data: updateRes.data
    });

    return json(res, 200, { ok: true, report: updateRes.data });
  } catch (error) {
    return serverError(res, error);
  }
}
