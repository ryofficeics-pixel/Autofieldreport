#!/usr/bin/env node
import { spawn } from "node:child_process";
import path from "node:path";

const dbUrl = process.env.SUPABASE_DB_URL || "";
if (!dbUrl) {
  console.error("Missing SUPABASE_DB_URL. Cannot run live RLS smoke test.");
  process.exit(1);
}

const sqlPath = path.join(process.cwd(), "supabase", "tests", "rls_smoke_test.sql");
const child = spawn("psql", [dbUrl, "-f", sqlPath], {
  stdio: "inherit",
  shell: process.platform === "win32"
});

child.on("error", (error) => {
  console.error("Failed to execute psql:", error.message);
  process.exit(1);
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
