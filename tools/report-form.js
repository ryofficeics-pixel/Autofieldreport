import { openPrintWindow, renderReportHtml } from "./report-export.js";
import { uploadReportPhoto } from "./media-upload.js";
import { getQueueSummary, queueAction, syncPending } from "../ui/offline-queue.js";
import {
  createAuthState,
  getActiveCompanyId,
  getSessionToken,
  onAuthStateChanged,
  refreshAuthContext,
  setActiveCompany,
  signInWithPassword,
  signOut
} from "./auth-session.js";

const app = document.getElementById("app");
const reportType = app?.dataset.reportType || "daily";
const title = app?.dataset.reportTitle || "Report";

const els = {
  pageTitle: document.getElementById("pageTitle"),
  authEmail: document.getElementById("authEmail"),
  authPassword: document.getElementById("authPassword"),
  btnLogin: document.getElementById("btnLogin"),
  btnLogout: document.getElementById("btnLogout"),
  authInfo: document.getElementById("authInfo"),
  activeCompany: document.getElementById("activeCompany"),
  companyInfo: document.getElementById("companyInfo"),
  permissionInfo: document.getElementById("permissionInfo"),

  reportId: document.getElementById("reportId"),
  companyId: document.getElementById("companyId"),
  projectId: document.getElementById("projectId"),
  btnReloadProjects: document.getElementById("btnReloadProjects"),
  locationId: document.getElementById("locationId"),
  reportDate: document.getElementById("reportDate"),
  payload: document.getElementById("payload"),
  photoFile: document.getElementById("photoFile"),
  photoCaption: document.getElementById("photoCaption"),
  rejectionReason: document.getElementById("rejectionReason"),
  btnSave: document.getElementById("btnSave"),
  btnSubmit: document.getElementById("btnSubmit"),
  btnApprove: document.getElementById("btnApprove"),
  btnReject: document.getElementById("btnReject"),
  btnUploadPhoto: document.getElementById("btnUploadPhoto"),
  btnSyncQueue: document.getElementById("btnSyncQueue"),
  btnPreview: document.getElementById("btnPreview"),
  btnPrint: document.getElementById("btnPrint"),
  btnLoad: document.getElementById("btnLoad"),
  status: document.getElementById("status"),
  listBody: document.getElementById("listBody"),
  preview: document.getElementById("preview"),
  queueSummary: document.getElementById("queueSummary")
};

const actionButtons = [
  "btnSave",
  "btnSubmit",
  "btnApprove",
  "btnReject",
  "btnUploadPhoto",
  "btnSyncQueue",
  "btnLoad",
  "btnPreview",
  "btnPrint"
].map((key) => els[key]).filter(Boolean);

let authState = null;

if (els.pageTitle) els.pageTitle.textContent = title;
if (els.reportDate && !els.reportDate.value) els.reportDate.valueAsDate = new Date();

function setStatus(message, error = false) {
  if (!els.status) return;
  els.status.textContent = message;
  els.status.style.color = error ? "#b30000" : "#616161";
}

function isRetryableError(error) {
  const message = String(error?.message || "").toLowerCase();
  if (!message) return false;
  if (message.includes("forbidden") || message.includes("unauthorized") || message.includes("bad_request")) {
    return false;
  }
  return (
    message.includes("network") ||
    message.includes("failed to fetch") ||
    message.includes("timeout") ||
    message.includes("connection")
  );
}

function safeJson(value) {
  try {
    return JSON.parse(value || "{}");
  } catch {
    return null;
  }
}

function requireSessionToken() {
  const token = getSessionToken(authState);
  if (!token) throw new Error("Login required");
  return token;
}

function requireActiveCompany() {
  const activeCompanyId = getActiveCompanyId(authState);
  if (!activeCompanyId) throw new Error("Select an active company");
  return activeCompanyId;
}

function activeProjectStorageKey(companyId) {
  return `afr.activeProjectId.${companyId}`;
}

async function refreshQueueSummary() {
  try {
    const summary = await getQueueSummary();
    if (els.queueSummary) {
      els.queueSummary.textContent =
        `queue total=${summary.total} pending=${summary.pending} syncing=${summary.syncing} ` +
        `synced=${summary.synced} failed=${summary.failed} conflict=${summary.conflict}`;
    }
  } catch (error) {
    if (els.queueSummary) els.queueSummary.textContent = `queue error: ${error.message}`;
  }
}

async function callApi(path, method, body = null) {
  const token = requireSessionToken();
  const res = await fetch(path, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`${data.code || "error"}: ${data.message || "request failed"}`);
  }
  return data;
}

async function loadProjectsForActiveCompany() {
  const companyId = getActiveCompanyId(authState);
  if (!companyId || !els.projectId) return;

  try {
    const result = await callApi(`/api/projects-list?companyId=${encodeURIComponent(companyId)}`, "GET");
    const projects = result.projects || [];
    const stored = localStorage.getItem(activeProjectStorageKey(companyId));
    const current = els.projectId.value || stored || "";

    const options = projects.map((p) => `
      <option value="${p.id}" ${p.id === current ? "selected" : ""}>
        ${p.name} (${p.code || "-"}) - ${p.project_status}
      </option>
    `).join("");
    els.projectId.innerHTML = `<option value="">Select project</option>${options}`;

    if (!els.projectId.value && current) els.projectId.value = current;
    if (els.projectId.value) {
      localStorage.setItem(activeProjectStorageKey(companyId), els.projectId.value);
    }
  } catch (error) {
    setStatus(`Project load warning: ${error.message}`, true);
  }
}

function renderAuthState() {
  const user = authState?.user || null;
  const memberships = authState?.memberships || [];
  const activeCompanyId = getActiveCompanyId(authState);

  if (els.authInfo) {
    els.authInfo.textContent = user ? `Logged in as ${user.email || user.id}` : "Not logged in.";
  }

  if (els.activeCompany) {
    const options = memberships.map((m) => `
      <option value="${m.company_id}" ${m.company_id === activeCompanyId ? "selected" : ""}>
        ${m.company_name} (${m.role_key})
      </option>
    `).join("");
    els.activeCompany.innerHTML = options || `<option value="">No active company available</option>`;
    els.activeCompany.disabled = !user || memberships.length === 0;
  }

  const activeMembership = memberships.find((m) => m.company_id === activeCompanyId) || null;
  if (els.companyInfo) {
    els.companyInfo.textContent = activeMembership
      ? `Company: ${activeMembership.company_name} (${activeMembership.company_slug})`
      : "Company: -";
  }
  if (els.permissionInfo) {
    els.permissionInfo.textContent = activeMembership
      ? `Permissions: ${(activeMembership.permissions || []).join(", ") || "-"}`
      : "Permissions: -";
  }

  if (els.companyId) els.companyId.value = activeCompanyId || "";

  const locked = !user || !activeCompanyId;
  actionButtons.forEach((btn) => { btn.disabled = locked; });
  if (els.btnReloadProjects) els.btnReloadProjects.disabled = locked;
  if (els.btnLogout) els.btnLogout.disabled = !user;
  if (els.btnLogin) els.btnLogin.disabled = Boolean(user);
}

function buildPreviewInput() {
  const data = safeJson(els.payload.value);
  if (data === null) throw new Error("Payload JSON is invalid");
  return {
    reportType,
    companyId: requireActiveCompany(),
    projectId: els.projectId.value.trim(),
    reportDate: els.reportDate.value,
    status: "draft",
    data
  };
}

async function saveDraft() {
  const data = safeJson(els.payload.value);
  if (data === null) return setStatus("Payload JSON is invalid.", true);

  const body = {
    reportId: els.reportId.value || null,
    companyId: requireActiveCompany(),
    projectId: els.projectId.value.trim(),
    locationId: els.locationId.value.trim() || null,
    reportType,
    reportDate: els.reportDate.value,
    data
  };
  if (!body.projectId) throw new Error("projectId is required");

  try {
    const result = await callApi("/api/reports-save", "POST", body);
    els.reportId.value = result.report.id;
    setStatus(`Saved draft report: ${result.report.id}`);
  } catch (error) {
    if (!isRetryableError(error)) throw error;
    await queueAction({
      company_id: body.companyId,
      project_id: body.projectId,
      module: `${reportType}-report`,
      action_type: "report.save",
      payload: body,
      attachment_refs: []
    });
    await refreshQueueSummary();
    setStatus(`API failed, queued report.save: ${error.message}`, true);
  }
}

async function transition(nextStatus) {
  const reportId = els.reportId.value.trim();
  if (!reportId) throw new Error("reportId is required for status transition");

  const body = {
    reportId,
    companyId: requireActiveCompany(),
    nextStatus
  };
  if (nextStatus === "rejected") body.rejectionReason = els.rejectionReason.value.trim();

  try {
    const result = await callApi("/api/reports-transition", "POST", body);
    setStatus(`Status updated: ${result.report.status}`);
  } catch (error) {
    if (!isRetryableError(error)) throw error;
    await queueAction({
      company_id: body.companyId,
      project_id: els.projectId.value.trim() || null,
      module: `${reportType}-report`,
      action_type: "report.transition",
      payload: body,
      attachment_refs: []
    });
    await refreshQueueSummary();
    setStatus(`API failed, queued report.transition: ${error.message}`, true);
  }
}

async function loadReports() {
  const companyId = requireActiveCompany();
  const projectId = els.projectId.value.trim();
  const query = new URLSearchParams({
    companyId,
    reportType,
    ...(projectId ? { projectId } : {})
  });
  const result = await callApi(`/api/reports-list?${query.toString()}`, "GET");
  const rows = (result.reports || []).map((r) => `
    <tr>
      <td>${r.id}</td>
      <td>${r.report_date}</td>
      <td>${r.status}</td>
      <td>${r.updated_at || "-"}</td>
    </tr>
  `).join("");
  els.listBody.innerHTML = rows || `<tr><td colspan="4">No rows</td></tr>`;
}

async function uploadPhoto() {
  const token = requireSessionToken();
  const companyId = requireActiveCompany();
  const reportId = els.reportId.value.trim();
  if (!reportId) throw new Error("Save draft first to get reportId");

  const file = els.photoFile.files?.[0];
  if (!file) throw new Error("Choose a photo file");

  const basePayload = {
    companyId,
    projectId: els.projectId.value.trim(),
    module: `${reportType}-report`,
    recordId: reportId,
    file,
    caption: els.photoCaption.value.trim()
  };

  try {
    const result = await uploadReportPhoto({
      token,
      ...basePayload
    });

    const payload = safeJson(els.payload.value) || {};
    const photos = Array.isArray(payload.photos) ? payload.photos : [];
    photos.push({
      media_id: result.media.id,
      url: result.media.secure_url,
      caption: result.media.caption || els.photoCaption.value.trim() || ""
    });
    payload.photos = photos;
    els.payload.value = JSON.stringify(payload, null, 2);
    setStatus(`Uploaded photo and registered media: ${result.media.id}`);
  } catch (error) {
    if (!isRetryableError(error)) throw error;
    await queueAction({
      company_id: companyId,
      project_id: basePayload.projectId || null,
      module: basePayload.module,
      action_type: "media.upload",
      payload: basePayload,
      attachment_refs: [{ kind: "file", name: file.name, size: file.size, type: file.type }]
    });
    await refreshQueueSummary();
    setStatus(`Upload failed, queued media.upload: ${error.message}`, true);
  }
}

async function syncQueuedActions() {
  await syncPending(async (item) => {
    if (item.action_type === "report.save") {
      return await callApi("/api/reports-save", "POST", item.payload);
    }
    if (item.action_type === "report.transition") {
      return await callApi("/api/reports-transition", "POST", item.payload);
    }
    if (item.action_type === "media.upload") {
      const token = requireSessionToken();
      return await uploadReportPhoto({
        token,
        companyId: item.payload.companyId,
        projectId: item.payload.projectId,
        module: item.payload.module,
        recordId: item.payload.recordId,
        file: item.payload.file,
        caption: item.payload.caption
      });
    }
    throw new Error(`Unsupported queued action: ${item.action_type}`);
  });
  await refreshQueueSummary();
}

async function syncQueuedActionsSafe() {
  try {
    await syncQueuedActions();
    setStatus("Queued sync completed.");
  } catch (error) {
    setStatus(`Queued sync failed: ${error.message}`, true);
  }
}

async function initAuthFlow() {
  authState = await createAuthState();

  try {
    await refreshAuthContext(authState);
  } catch (error) {
    setStatus(`Auth context load warning: ${error.message}`, true);
  }
  renderAuthState();
  await loadProjectsForActiveCompany();

  onAuthStateChanged(authState, () => {
    renderAuthState();
    loadProjectsForActiveCompany();
  });
}

els.btnLogin?.addEventListener("click", async () => {
  try {
    const email = els.authEmail.value.trim();
    const password = els.authPassword.value;
    if (!email || !password) throw new Error("Email and password are required");
    await signInWithPassword(authState, email, password);
    await refreshAuthContext(authState);
    renderAuthState();
    await loadProjectsForActiveCompany();
    setStatus("Login successful.");
  } catch (error) {
    setStatus(error.message, true);
  }
});

els.btnLogout?.addEventListener("click", async () => {
  try {
    await signOut(authState);
    renderAuthState();
    setStatus("Logged out.");
  } catch (error) {
    setStatus(error.message, true);
  }
});

els.activeCompany?.addEventListener("change", () => {
  const companyId = els.activeCompany.value || null;
  setActiveCompany(authState, companyId);
  renderAuthState();
  loadProjectsForActiveCompany();
  setStatus(companyId ? "Active company updated." : "No active company selected.");
});

els.projectId?.addEventListener("change", () => {
  const companyId = getActiveCompanyId(authState);
  if (companyId && els.projectId.value) {
    localStorage.setItem(activeProjectStorageKey(companyId), els.projectId.value);
  }
});

els.btnReloadProjects?.addEventListener("click", async () => {
  await loadProjectsForActiveCompany();
  setStatus("Project list refreshed.");
});

els.btnSave?.addEventListener("click", async () => {
  try { await saveDraft(); } catch (error) { setStatus(error.message, true); }
});
els.btnSubmit?.addEventListener("click", async () => {
  try { await transition("submitted"); } catch (error) { setStatus(error.message, true); }
});
els.btnApprove?.addEventListener("click", async () => {
  try { await transition("approved"); } catch (error) { setStatus(error.message, true); }
});
els.btnReject?.addEventListener("click", async () => {
  try { await transition("rejected"); } catch (error) { setStatus(error.message, true); }
});
els.btnLoad?.addEventListener("click", async () => {
  try { await loadReports(); setStatus("Loaded reports."); } catch (error) { setStatus(error.message, true); }
});
els.btnPreview?.addEventListener("click", () => {
  try {
    const html = renderReportHtml(buildPreviewInput());
    els.preview.innerHTML = html;
    setStatus("Preview rendered.");
  } catch (error) {
    setStatus(error.message, true);
  }
});
els.btnPrint?.addEventListener("click", () => {
  try {
    const html = renderReportHtml(buildPreviewInput());
    openPrintWindow(html);
    setStatus("Print/PDF window opened.");
  } catch (error) {
    setStatus(error.message, true);
  }
});
els.btnUploadPhoto?.addEventListener("click", async () => {
  try { await uploadPhoto(); } catch (error) { setStatus(error.message, true); }
});
els.btnSyncQueue?.addEventListener("click", syncQueuedActionsSafe);

window.addEventListener("online", () => {
  syncQueuedActionsSafe();
});

refreshQueueSummary();
actionButtons.forEach((btn) => { btn.disabled = true; });
setStatus("Initializing auth...");
initAuthFlow()
  .then(() => setStatus("Ready. Login to continue."))
  .catch((error) => setStatus(`Auth initialization failed: ${error.message}`, true));
