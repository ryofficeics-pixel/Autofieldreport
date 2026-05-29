const DB_NAME = "auto-field-report-offline";
const DB_VERSION = 1;
const STORE = "sync_jobs";
let syncLoopRunning = false;

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("status", "status", { unique: false });
        store.createIndex("company_id", "company_id", { unique: false });
        store.createIndex("created_at", "created_at", { unique: false });
      }
    };
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function tx(storeMode, work) {
  return openDb().then((db) => new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, storeMode);
    const store = transaction.objectStore(STORE);
    const result = work(store);
    transaction.oncomplete = () => resolve(result);
    transaction.onerror = () => reject(transaction.error);
  }));
}

function nowIso() {
  return new Date().toISOString();
}

function id() {
  return crypto.randomUUID();
}

function toErrorMessage(error) {
  if (!error) return "sync_failed";
  if (typeof error.message === "string" && error.message.trim()) return error.message;
  return String(error);
}

export async function queueAction(input) {
  const item = {
    id: id(),
    company_id: input.company_id || null,
    project_id: input.project_id || null,
    module: input.module || "unknown",
    action_type: input.action_type || "unknown",
    payload: input.payload || {},
    attachment_refs: input.attachment_refs || [],
    status: "pending",
    tries: 0,
    last_error: null,
    created_at: nowIso(),
    updated_at: nowIso(),
    synced_at: null
  };
  await tx("readwrite", (store) => store.put(item));
  return item;
}

export async function listActions() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, "readonly");
    const store = transaction.objectStore(STORE);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result.sort((a, b) => a.created_at.localeCompare(b.created_at)));
    request.onerror = () => reject(request.error);
  });
}

export async function updateAction(item) {
  item.updated_at = nowIso();
  await tx("readwrite", (store) => store.put(item));
}

export async function getQueueSummary() {
  const items = await listActions();
  return items.reduce(
    (acc, item) => {
      acc.total += 1;
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    },
    { total: 0, pending: 0, syncing: 0, synced: 0, failed: 0, conflict: 0 }
  );
}

export async function syncPending(syncHandler) {
  if (syncLoopRunning) {
    throw new Error("Queue sync is already running");
  }
  syncLoopRunning = true;

  const items = await listActions();
  const pending = items.filter((item) => item.status === "pending" || item.status === "failed");

  try {
    for (const item of pending) {
      item.status = "syncing";
      await updateAction(item);
      try {
        const result = await syncHandler(item);
        item.status = "synced";
        item.synced_at = nowIso();
        item.last_error = null;
        item.synced_response = result || null;
      } catch (error) {
        item.status = "failed";
        item.tries += 1;
        item.last_error = toErrorMessage(error);
      }
      await updateAction(item);
    }
  } finally {
    syncLoopRunning = false;
  }
}
