import { getQueueSummary, queueAction, syncPending } from "./offline-queue.js";

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
const queueSummaryEl = document.getElementById("queueSummary");
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

refreshQueueSummary();
