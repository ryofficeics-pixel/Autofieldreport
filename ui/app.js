import { getQueueSummary, queueAction, syncPending } from "./offline-queue.js";

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
const queueSummaryEl = document.getElementById("queueSummary");
const queueDemoControlsEl = document.getElementById("queueDemoControls");
const queueDemoNoticeEl = document.getElementById("queueDemoNotice");
const btnAddDemo = document.getElementById("btnAddDemo");
const btnSyncDemo = document.getElementById("btnSyncDemo");

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    mainNav.classList.toggle("open", !expanded);
  });
}

function renderSummary(summary) {
  if (!queueSummaryEl) return;
  queueSummaryEl.textContent =
    `total=${summary.total} | pending=${summary.pending} | syncing=${summary.syncing} | ` +
    `synced=${summary.synced} | failed=${summary.failed} | conflict=${summary.conflict}`;
}

async function refreshQueueSummary() {
  try {
    const summary = await getQueueSummary();
    renderSummary(summary);
  } catch (error) {
    if (queueSummaryEl) queueSummaryEl.textContent = `Queue error: ${error.message}`;
  }
}

function isLoopbackHost() {
  return ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
}

function isDemoRequested() {
  const params = new URLSearchParams(window.location.search);
  return params.get("demo") === "1";
}

async function resolveRuntimeEnvironment() {
  try {
    const res = await fetch("/api/public-config", { method: "GET" });
    if (!res.ok) return null;
    const data = await res.json();
    const env = data?.config?.environment;
    return typeof env === "string" ? env.toLowerCase() : null;
  } catch {
    return null;
  }
}

function setDemoControlsVisibility(enabled) {
  if (queueDemoControlsEl) {
    queueDemoControlsEl.hidden = !enabled;
    queueDemoControlsEl.setAttribute("aria-hidden", String(!enabled));
  }
  if (queueDemoNoticeEl) {
    queueDemoNoticeEl.hidden = !enabled;
    queueDemoNoticeEl.setAttribute("aria-hidden", String(!enabled));
  }
  if (btnAddDemo) btnAddDemo.disabled = !enabled;
  if (btnSyncDemo) btnSyncDemo.disabled = !enabled;
}

async function initDemoQueueControls() {
  const environment = await resolveRuntimeEnvironment();
  const nonProduction = environment ? environment !== "production" : isLoopbackHost();
  const enabled = nonProduction && isDemoRequested();
  setDemoControlsVisibility(enabled);

  if (!enabled) return;
  if (btnAddDemo) {
    btnAddDemo.addEventListener("click", async () => {
      await queueAction({
        company_id: "demo-company",
        project_id: "demo-project",
        module: "daily-report",
        action_type: "report.create",
        payload: { title: "Demo pending item" },
        attachment_refs: []
      });
      await refreshQueueSummary();
    });
  }

  if (btnSyncDemo) {
    btnSyncDemo.addEventListener("click", async () => {
      await syncPending(async () => ({ ok: true, syncedAt: new Date().toISOString() }));
      await refreshQueueSummary();
    });
  }
}

setDemoControlsVisibility(false);
initDemoQueueControls();
refreshQueueSummary();
