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

function checkRequired(keys) {
  return keys
    .map((key) => ({ key, ok: Boolean(process.env[key]) }))
    .filter((row) => !row.ok)
    .map((row) => row.key);
}

const missingPublic = checkRequired(requiredPublic);
const missingServer = checkRequired(requiredServer);

if (missingPublic.length || missingServer.length) {
  console.error("Environment preflight failed.");
  if (missingPublic.length) {
    console.error("Missing public env:", missingPublic.join(", "));
  }
  if (missingServer.length) {
    console.error("Missing server env:", missingServer.join(", "));
  }
  process.exit(1);
}

console.log("Environment preflight passed.");
