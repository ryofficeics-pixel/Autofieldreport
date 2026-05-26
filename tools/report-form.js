import { openPrintWindow, renderReportHtml } from "./report-export.js";
import { uploadReportPhoto } from "./media-upload.js";
import { getQueueSummary, queueAction, syncPending } from "../ui/offline-queue.js";

const app = document.getElementById("app");
const reportType = app?.dataset.reportType || "daily";
const title = app?.dataset.reportTitle || "Report";

const els = {
  pageTitle: document.getElementById("pageTitle"),
  reportId: document.getElementById("reportId"),
  accessToken: document.getElementById("accessToken"),
  companyId: document.getElementById("companyId"),
  projectId: document.getElementById("projectId"),
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

if (els.pageTitle) {
  els.pageTitle.textContent = title;
}

if (els.reportDate && !els.reportDate.value) {
  els.reportDate.valueAsDate = new Date();
}

function getToken() {
  return els.accessToken.value.trim();
}

function setStatus(message, error = false) {
  els.status.textContent = message;
  els.status.style.color = error ? "#b30000" : "#616161";
}

async function refreshQueueSummary() {
  try {
    const summary = await getQueueSummary();
    if (els.queueSummary) {
      els.queueSummary.textContent =
        `queue total=${summary.total} pending=${summary.pending} syncing=${summary.syncing} ` +
        `synced=${summary.synced} failed=${summary.failed}`;
    }
  } catch (error) {
    if (els.queueSummary) els.queueSummary.textContent = `queue error: ${error.message}`;
  }
}

function safeJson(value) {
  try {
    return JSON.parse(value || "{}");
  } catch {
    return null;
  }
}

function buildPreviewInput() {
  const data = safeJson(els.payload.value);
  if (data === null) throw new Error("Payload JSON is invalid");
  return {
    reportType,
    companyId: els.companyId.value.trim(),
    projectId: els.projectId.value.trim(),
    reportDate: els.reportDate.value,
    status: "draft",
    data
  };
}

async function callApi(path, method, body = null) {
  const token = getToken();
  if (!token) {
    throw new Error("Access token is required");
  }
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

async function saveDraft() {
  const data = safeJson(els.payload.value);
  if (data === null) {
    return setStatus("Payload JSON is invalid.", true);
  }
  const body = {
    reportId: els.reportId.value || null,
    companyId: els.companyId.value.trim(),
    projectId: els.projectId.value.trim(),
    locationId: els.locationId.value.trim() || null,
    reportType,
    reportDate: els.reportDate.value,
    data
  };
  try {
    const result = await callApi("/api/reports-save", "POST", body);
    els.reportId.value = result.report.id;
    setStatus(`Saved draft report: ${result.report.id}`);
  } catch (error) {
    await queueAction({
      company_id: body.companyId,
      project_id: body.projectId,
      module: `${reportType}-report`,
      action_type: "report.save",
      payload: body,
      attachment_refs: []
    });
    await refreshQueueSummary();
    setStatus(`API failed, queued offline save: ${error.message}`, true);
  }
}

async function transition(nextStatus) {
  const reportId = els.reportId.value.trim();
  if (!reportId) throw new Error("reportId is required for status transition");
  const body = {
    reportId,
    companyId: els.companyId.value.trim(),
    nextStatus
  };
  if (nextStatus === "rejected") {
    body.rejectionReason = els.rejectionReason.value.trim();
  }
  const result = await callApi("/api/reports-transition", "POST", body);
  setStatus(`Status updated: ${result.report.status}`);
}

async function loadReports() {
  const companyId = els.companyId.value.trim();
  if (!companyId) throw new Error("companyId is required");
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
  const token = getToken();
  if (!token) throw new Error("Access token is required");
  if (!els.reportId.value.trim()) throw new Error("Save draft first to get reportId");
  const file = els.photoFile.files?.[0];
  if (!file) throw new Error("Choose a photo file");

  const result = await uploadReportPhoto({
    token,
    companyId: els.companyId.value.trim(),
    projectId: els.projectId.value.trim(),
    module: `${reportType}-report`,
    recordId: els.reportId.value.trim(),
    file,
    caption: els.photoCaption.value.trim()
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
}

async function syncQueuedActions() {
  const token = getToken();
  if (!token) throw new Error("Access token is required");

  await syncPending(async (item) => {
    if (item.action_type === "report.save") {
      return await callApi("/api/reports-save", "POST", item.payload);
    }
    throw new Error(`Unsupported queued action: ${item.action_type}`);
  });
  await refreshQueueSummary();
}

els.btnSave?.addEventListener("click", async () => {
  try { await saveDraft(); } catch (e) { setStatus(e.message, true); }
});
els.btnSubmit?.addEventListener("click", async () => {
  try { await transition("submitted"); } catch (e) { setStatus(e.message, true); }
});
els.btnApprove?.addEventListener("click", async () => {
  try { await transition("approved"); } catch (e) { setStatus(e.message, true); }
});
els.btnReject?.addEventListener("click", async () => {
  try { await transition("rejected"); } catch (e) { setStatus(e.message, true); }
});
els.btnLoad?.addEventListener("click", async () => {
  try { await loadReports(); setStatus("Loaded reports."); } catch (e) { setStatus(e.message, true); }
});

els.btnPreview?.addEventListener("click", () => {
  try {
    const html = renderReportHtml(buildPreviewInput());
    els.preview.innerHTML = html;
    setStatus("Preview rendered.");
  } catch (e) {
    setStatus(e.message, true);
  }
});

els.btnPrint?.addEventListener("click", () => {
  try {
    const html = renderReportHtml(buildPreviewInput());
    openPrintWindow(html);
    setStatus("Print/PDF window opened.");
  } catch (e) {
    setStatus(e.message, true);
  }
});

els.btnUploadPhoto?.addEventListener("click", async () => {
  try { await uploadPhoto(); } catch (e) { setStatus(e.message, true); }
});

els.btnSyncQueue?.addEventListener("click", async () => {
  try { await syncQueuedActions(); setStatus("Queued sync completed."); } catch (e) { setStatus(e.message, true); }
});

refreshQueueSummary();
