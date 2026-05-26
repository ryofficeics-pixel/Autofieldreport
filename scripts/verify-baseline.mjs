#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const cwd = process.cwd();

const requiredFiles = [
  "fixed rule.md",
  "docs/DOC_AUTHORITY.md",
  "supabase/migrations/20260526161000_multi_company_foundation.sql",
  "supabase/migrations/20260526162000_rls_and_permission_seed.sql",
  "api/cloudinary-signature.js",
  "api/media-register.js",
  "api/public-config.js",
  "api/auth-context.js",
  "api/reports-save.js",
  "api/reports-transition.js",
  "api/reports-list.js",
  "tools/auth-session.js",
  "tools/daily-report/index.html",
  "tools/weekly-report/index.html",
  "tools/survey-report/index.html",
  "tools/progress-report/index.html",
  "tools/report-export.js",
  "tools/media-upload.js",
  "ui/offline-queue.js"
];

const failures = [];

for (const file of requiredFiles) {
  const fullPath = path.join(cwd, file);
  if (!fs.existsSync(fullPath)) failures.push(`missing file: ${file}`);
}

if (failures.length) {
  console.error("Baseline verification failed:");
  for (const item of failures) console.error(`- ${item}`);
  process.exit(1);
}

console.log("Baseline verification passed.");
