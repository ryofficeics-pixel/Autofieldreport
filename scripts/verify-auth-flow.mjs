#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const cwd = process.cwd();
const reportPages = [
  "tools/daily-report/index.html",
  "tools/weekly-report/index.html",
  "tools/survey-report/index.html",
  "tools/progress-report/index.html"
];

const failures = [];

for (const relPath of reportPages) {
  const fullPath = path.join(cwd, relPath);
  const html = fs.readFileSync(fullPath, "utf8");

  const requiredTokens = [
    'id="authEmail"',
    'id="authPassword"',
    'id="btnLogin"',
    'id="btnLogout"',
    'id="activeCompany"',
    'id="projectId"'
  ];

  for (const token of requiredTokens) {
    if (!html.includes(token)) {
      failures.push(`${relPath}: missing ${token}`);
    }
  }

  const forbiddenTokens = [
    'id="accessToken"',
    "Paste bearer token"
  ];

  for (const token of forbiddenTokens) {
    if (html.includes(token)) {
      failures.push(`${relPath}: contains forbidden token ${token}`);
    }
  }
}

const reportFormPath = path.join(cwd, "tools", "report-form.js");
const reportFormCode = fs.readFileSync(reportFormPath, "utf8");
if (!reportFormCode.includes('from "./auth-session.js"')) {
  failures.push("tools/report-form.js: missing auth-session import");
}

if (failures.length) {
  console.error("Auth flow verification failed:");
  failures.forEach((f) => console.error(`- ${f}`));
  process.exit(1);
}

console.log("Auth flow verification passed.");
