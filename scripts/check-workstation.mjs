#!/usr/bin/env node

import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

const checks = [];

function commandExists(commandLine) {
  const result = spawnSync(commandLine, {
    encoding: "utf8",
    shell: true,
    stdio: ["ignore", "pipe", "pipe"]
  });

  return {
    ok: result.status === 0,
    output: String(result.stdout || result.stderr || "").trim().split(/\r?\n/)[0]
  };
}

function addCheck(name, ok, detail) {
  checks.push({ name, ok, detail });
}

const npmCommand = process.platform === "win32" ? "npm.cmd --version" : "npm --version";

const nodeCheck = commandExists("node --version");
const npmCheck = commandExists(npmCommand);
const gitCheck = commandExists("git --version");
const psqlCheck = commandExists("psql --version");

addCheck("Node.js available", nodeCheck.ok, nodeCheck.output || "Required for verification scripts.");
addCheck("npm available", npmCheck.ok, npmCheck.output || "Required for dependency install.");
addCheck("git available", gitCheck.ok, gitCheck.output || "Required to clone/pull the project.");
addCheck("package-lock.json", existsSync("package-lock.json"), "Required for repeatable npm install.");
addCheck("node_modules", existsSync("node_modules"), "Run `npm.cmd install` if missing.");
addCheck("local .env file", existsSync(".env"), "Copy `.env.example` to `.env` and fill local values if missing.");
addCheck("psql command", psqlCheck.ok, psqlCheck.output || "Required only for `npm.cmd run verify:rls-smoke`.");

const requiredFailures = checks.filter((check) => {
  if (check.name === "node_modules") return false;
  if (check.name === "local .env file") return false;
  if (check.name === "psql command") return false;
  return !check.ok;
});

const optionalWarnings = checks.filter((check) => {
  if (check.name === "node_modules") return !check.ok;
  if (check.name === "local .env file") return !check.ok;
  if (check.name === "psql command") return !check.ok;
  return false;
});

for (const check of checks) {
  const marker = check.ok ? "PASS" : requiredFailures.includes(check) ? "FAIL" : "WARN";
  console.log(`${marker}: ${check.name}${check.detail ? ` - ${check.detail}` : ""}`);
}

if (requiredFailures.length) {
  console.error("\nWorkstation preflight failed. Install the required tools above before continuing.");
  process.exit(1);
}

if (optionalWarnings.length) {
  console.warn("\nWorkstation preflight completed with warnings. Follow the noted setup steps before live verification.");
} else {
  console.log("\nWorkstation preflight passed.");
}
