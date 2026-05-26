import { openPrintWindow, renderReportHtml } from "./report-export.js";

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
  rejectionReason: document.getElementById("rejectionReason"),
  btnSave: document.getElementById("btnSave"),
  btnSubmit: document.getElementById("btnSubmit"),
  btnApprove: document.getElementById("btnApprove"),
  btnReject: document.getElementById("btnReject"),
  btnPreview: document.getElementById("btnPreview"),
  btnPrint: document.getElementById("btnPrint"),
  btnLoad: document.getElementById("btnLoad"),
  status: document.getElementById("status"),
  listBody: document.getElementById("listBody"),
  preview: document.getElementById("preview")
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
  const result = await callApi("/api/reports-save", "POST", body);
  els.reportId.value = result.report.id;
  setStatus(`Saved draft report: ${result.report.id}`);
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
