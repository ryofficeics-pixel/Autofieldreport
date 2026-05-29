#!/usr/bin/env node

const requiredPublic = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_ANON_KEY",
  "VITE_APP_URL",
  "VITE_ENVIRONMENT"
];

const requiredServer = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET"
];

const requiredRlsSmoke = [
  "SUPABASE_DB_URL"
];

const allowedEnvironment = new Set(["development", "staging", "production", "test"]);

function checkRequired(keys) {
  return keys
    .map((key) => ({ key, ok: Boolean(process.env[key]) }))
    .filter((row) => !row.ok)
    .map((row) => row.key);
}

const missingPublic = checkRequired(requiredPublic);
const missingServer = checkRequired(requiredServer);
const missingRlsSmoke = checkRequired(requiredRlsSmoke);
const envValue = String(process.env.VITE_ENVIRONMENT || "").toLowerCase();
const envInvalid = Boolean(envValue) && !allowedEnvironment.has(envValue);
const appUrl = String(process.env.VITE_APP_URL || "");
const appUrlInvalidForProduction = envValue === "production" && appUrl && !/^https:\/\//i.test(appUrl);

if (missingPublic.length || missingServer.length || missingRlsSmoke.length || envInvalid || appUrlInvalidForProduction) {
  console.error("Environment preflight failed.");
  if (missingPublic.length) {
    console.error("Missing public env:", missingPublic.join(", "));
  }
  if (missingServer.length) {
    console.error("Missing server env:", missingServer.join(", "));
  }
  if (missingRlsSmoke.length) {
    console.error("Missing DB env for RLS smoke:", missingRlsSmoke.join(", "));
  }
  if (envInvalid) {
    console.error("Invalid VITE_ENVIRONMENT value:", process.env.VITE_ENVIRONMENT);
    console.error("Allowed values: development, staging, production, test");
  }
  if (appUrlInvalidForProduction) {
    console.error("Invalid VITE_APP_URL for production. Expected an https URL.");
  }
  console.error("Next action: configure missing values in local env or deployment environment before live verification.");
  process.exit(1);
}

console.log("Environment preflight passed.");
