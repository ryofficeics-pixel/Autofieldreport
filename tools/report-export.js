function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function renderReportHtml(input) {
  const photos = Array.isArray(input.data?.photos) ? input.data.photos : [];
  const photoRows = photos.map((p) => `
    <div style="display:grid;grid-template-columns:220px 1fr;gap:14px;margin-bottom:14px;align-items:start;">
      <img src="${esc(p.url || "")}" alt="${esc(p.caption || "photo")}" style="width:220px;height:140px;object-fit:cover;border-radius:8px;border:1px solid #ddd;" />
      <div>
        <div style="font-size:12px;color:#777;margin-bottom:4px;">Caption</div>
        <div>${esc(p.caption || "-")}</div>
      </div>
    </div>
  `).join("");

  return `
    <article style="font-family:Space Grotesk,Arial,sans-serif;color:#212121;">
      <h1 style="font-weight:400;font-size:32px;margin:0 0 12px;">${esc(input.reportType)} report</h1>
      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 14px;margin-bottom:14px;">
        <div><strong>Company:</strong> ${esc(input.companyId)}</div>
        <div><strong>Project:</strong> ${esc(input.projectId)}</div>
        <div><strong>Date:</strong> ${esc(input.reportDate)}</div>
        <div><strong>Status:</strong> ${esc(input.status || "draft")}</div>
      </div>
      <section style="margin-bottom:14px;">
        <h2 style="font-size:20px;font-weight:400;margin:0 0 8px;">Summary</h2>
        <pre style="background:#f6f7fa;border-radius:8px;padding:12px;white-space:pre-wrap;">${esc(JSON.stringify(input.data, null, 2))}</pre>
      </section>
      <section>
        <h2 style="font-size:20px;font-weight:400;margin:0 0 8px;">Photos</h2>
        ${photoRows || "<p>No photos.</p>"}
      </section>
      <p style="font-size:12px;color:#777;margin-top:18px;">Generated at ${new Date().toISOString()}</p>
    </article>
  `;
}

export function openPrintWindow(html) {
  const win = window.open("", "_blank");
  if (!win) throw new Error("Pop-up blocked");
  win.document.open();
  win.document.write(`<!doctype html><html><head><title>Report Export</title></head><body>${html}</body></html>`);
  win.document.close();
  win.focus();
  win.print();
}
