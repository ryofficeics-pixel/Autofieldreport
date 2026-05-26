#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const cwd = process.cwd();
const reportFormPath = path.join(cwd, "tools", "report-form.js");
const exportPath = path.join(cwd, "tools", "report-export.js");

const reportForm = fs.readFileSync(reportFormPath, "utf8");
const exportCode = fs.readFileSync(exportPath, "utf8");

const failures = [];

if (!reportForm.includes("renderReportHtml(buildPreviewInput())")) {
  failures.push("Preview path is not using shared renderReportHtml(buildPreviewInput()).");
}

if (!reportForm.includes("openPrintWindow(html)")) {
  failures.push("Print/PDF path is not using openPrintWindow(html).");
}

if (!reportForm.includes("const html = renderReportHtml(buildPreviewInput())")) {
  failures.push("Print path does not derive output from the same renderer call as preview.");
}

if (!exportCode.includes("grid-template-columns:220px 1fr")) {
  failures.push("Photo layout contract missing left-photo right-caption grid definition.");
}

if (failures.length) {
  console.error("Export parity verification failed:");
  failures.forEach((f) => console.error(`- ${f}`));
  process.exit(1);
}

console.log("Export parity verification passed.");
