#!/usr/bin/env node
import { spawn } from "node:child_process";
import path from "node:path";
import fs from "node:fs";

const dbUrl = process.env.SUPABASE_DB_URL || "";
if (!dbUrl) {
  console.error("Missing SUPABASE_DB_URL.");
  console.error("Next action: set SUPABASE_DB_URL to a staging/test database and rerun `npm.cmd run verify:rls-smoke`.");
  process.exit(1);
}

const sqlPath = path.join(process.cwd(), "supabase", "tests", "rls_smoke_test.sql");
if (!fs.existsSync(sqlPath)) {
  console.error(`RLS smoke SQL file not found: ${sqlPath}`);
  process.exit(1);
}

const child = spawn("psql", [dbUrl, "-v", "ON_ERROR_STOP=1", "-X", "-f", sqlPath], {
  stdio: "inherit",
  shell: process.platform === "win32"
});

child.on("error", (error) => {
  if (error.code === "ENOENT") {
    console.error("psql command not found. Install PostgreSQL client tools and ensure `psql` is in PATH.");
  } else {
    console.error("Failed to execute psql:", error.message);
  }
  process.exit(1);
});

child.on("exit", (code) => {
  if (code === 0) {
    console.log("RLS smoke verification passed.");
    process.exit(0);
  }
  if (code === 3) {
    console.error("RLS smoke SQL assertions failed.");
  } else {
    console.error(`RLS smoke command failed with exit code ${code ?? "unknown"}.`);
  }
  process.exit(code ?? 1);
});
