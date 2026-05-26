import { json, methodNotAllowed } from "./_lib/http.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || null;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || null;
  const appUrl = process.env.VITE_APP_URL || null;
  const environment = process.env.VITE_ENVIRONMENT || process.env.NODE_ENV || "development";

  return json(res, 200, {
    ok: true,
    config: {
      supabaseUrl,
      supabaseAnonKey,
      appUrl,
      environment
    }
  });
}
