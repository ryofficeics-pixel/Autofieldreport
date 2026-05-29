import { createSupabaseClients } from "./_lib/supabase.js";
import { badRequest, forbidden, methodNotAllowed, serverError, unauthorized, json } from "./_lib/http.js";
import { getBearerToken, getAuthenticatedUser, checkPermission, validateProjectScope } from "./_lib/authz.js";

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") return JSON.parse(req.body);
  return req.body;
}

function requiredString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isUuid(value) {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function validModuleName(value) {
  return typeof value === "string" && /^[a-z0-9-_/]+$/i.test(value);
}

function isHttpsUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

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
      companyId,
      projectId = null,
      module,
      recordId = null,
      cloudinaryPublicId,
      secureUrl,
      resourceType = null,
      format = null,
      bytes = null,
      width = null,
      height = null,
      caption = null,
      takenAt = null
    } = body;

    if (!companyId) return badRequest(res, "companyId is required");
    if (!isUuid(companyId)) return badRequest(res, "companyId must be a valid UUID");
    if (projectId && !isUuid(projectId)) return badRequest(res, "projectId must be a valid UUID when provided");
    if (recordId && !isUuid(recordId)) return badRequest(res, "recordId must be a valid UUID when provided");
    if (!validModuleName(module)) return badRequest(res, "module is required and must be slug-safe");
    if (!requiredString(cloudinaryPublicId)) return badRequest(res, "cloudinaryPublicId is required");
    if (!requiredString(secureUrl)) return badRequest(res, "secureUrl is required");
    if (!isHttpsUrl(secureUrl)) return badRequest(res, "secureUrl must be a valid https URL");

    const hasMediaUpload = await checkPermission(authClient, companyId, "media.upload");
    if (!hasMediaUpload) return forbidden(res, "User lacks media.upload permission");

    const projectValid = await validateProjectScope(authClient, companyId, projectId);
    if (!projectValid) return forbidden(res, "projectId is invalid for this company");

    const insertRes = await adminClient
      .from("media_files")
      .insert({
        company_id: companyId,
        project_id: projectId,
        module,
        record_id: recordId,
        uploaded_by: user.id,
        cloudinary_public_id: cloudinaryPublicId,
        secure_url: secureUrl,
        resource_type: resourceType,
        format,
        bytes,
        width,
        height,
        caption,
        taken_at: takenAt
      })
      .select("id, company_id, project_id, module, record_id, secure_url, created_at")
      .single();

    if (insertRes.error) throw insertRes.error;

    await adminClient.rpc("insert_audit_log", {
      p_company_id: companyId,
      p_action: "media.create",
      p_target_type: "media_files",
      p_target_id: insertRes.data.id,
      p_before_data: null,
      p_after_data: insertRes.data,
      p_meta: { module, project_id: projectId || null }
    });

    return json(res, 200, { ok: true, media: insertRes.data });
  } catch (error) {
    return serverError(res, error);
  }
}
