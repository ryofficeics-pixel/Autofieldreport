import crypto from "node:crypto";
import { createSupabaseClients, getCloudinaryConfig } from "./_lib/supabase.js";
import { badRequest, forbidden, methodNotAllowed, serverError, unauthorized, json } from "./_lib/http.js";
import { getBearerToken, getAuthenticatedUser, checkPermission, validateProjectScope } from "./_lib/authz.js";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MIME_PREFIX = "image/";

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") return JSON.parse(req.body);
  return req.body;
}

function validModuleName(value) {
  return typeof value === "string" && /^[a-z0-9-_/]+$/i.test(value);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);

  try {
    const token = getBearerToken(req);
    if (!token) return unauthorized(res);

    const { authClient } = createSupabaseClients(token);
    const user = await getAuthenticatedUser(authClient);
    if (!user) return unauthorized(res);

    const body = parseBody(req);
    const {
      companyId,
      projectId = null,
      module,
      recordId = null,
      fileType,
      fileSize
    } = body;

    if (!companyId) return badRequest(res, "companyId is required");
    if (!validModuleName(module)) return badRequest(res, "module is required and must be slug-safe");
    if (!fileType || !String(fileType).startsWith(MIME_PREFIX)) {
      return badRequest(res, "Only image uploads are allowed");
    }
    if (!Number.isFinite(Number(fileSize)) || Number(fileSize) <= 0 || Number(fileSize) > MAX_FILE_SIZE) {
      return badRequest(res, `fileSize must be between 1 and ${MAX_FILE_SIZE}`);
    }

    const hasMediaUpload = await checkPermission(authClient, companyId, "media.upload");
    if (!hasMediaUpload) return forbidden(res, "User lacks media.upload permission");

    const projectValid = await validateProjectScope(authClient, companyId, projectId);
    if (!projectValid) return forbidden(res, "projectId is invalid for this company");

    const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = `auto-field-report/${companyId}/${projectId || "unassigned"}/${module}`;
    const context = `company_id=${companyId}|project_id=${projectId || ""}|module=${module}|record_id=${recordId || ""}`;

    const signBase = `context=${context}&folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash("sha1").update(signBase).digest("hex");

    return json(res, 200, {
      cloudName,
      apiKey,
      timestamp,
      folder,
      context,
      signature
    });
  } catch (error) {
    return serverError(res, error);
  }
}
