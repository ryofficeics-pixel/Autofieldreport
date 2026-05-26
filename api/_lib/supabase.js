import { createClient } from "@supabase/supabase-js";

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env: ${name}`);
  return value;
}

export function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error("Missing SUPABASE_URL or VITE_SUPABASE_URL");
  if (!anonKey) throw new Error("Missing VITE_SUPABASE_ANON_KEY");
  if (!serviceRoleKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  return { url, anonKey, serviceRoleKey };
}

export function createSupabaseClients(accessToken) {
  const { url, anonKey, serviceRoleKey } = getSupabaseConfig();

  const authClient = createClient(url, anonKey, {
    global: {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
    },
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const adminClient = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  return { authClient, adminClient };
}

export function getCloudinaryConfig() {
  return {
    cloudName: requireEnv("CLOUDINARY_CLOUD_NAME"),
    apiKey: requireEnv("CLOUDINARY_API_KEY"),
    apiSecret: requireEnv("CLOUDINARY_API_SECRET")
  };
}
