#!/usr/bin/env node
import { createClient } from "@supabase/supabase-js";

function readEnv(name, fallback = "") {
  return process.env[name] || fallback;
}

function assertEnv(name, value) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
}

async function main() {
  const supabaseUrl = readEnv("SUPABASE_URL", readEnv("VITE_SUPABASE_URL"));
  const serviceRoleKey = readEnv("SUPABASE_SERVICE_ROLE_KEY");
  const adminEmail = readEnv("FIRST_ADMIN_EMAIL");
  const adminPassword = readEnv("FIRST_ADMIN_PASSWORD");
  const companyName = readEnv("FIRST_COMPANY_NAME", "Auto Field Report");
  const companySlug = readEnv("FIRST_COMPANY_SLUG", "auto-field-report");

  assertEnv("SUPABASE_URL or VITE_SUPABASE_URL", supabaseUrl);
  assertEnv("SUPABASE_SERVICE_ROLE_KEY", serviceRoleKey);
  assertEnv("FIRST_ADMIN_EMAIL", adminEmail);
  assertEnv("FIRST_ADMIN_PASSWORD", adminPassword);

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  let adminUserId = null;

  const createUserRes = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true
  });

  if (createUserRes.error && !String(createUserRes.error.message).toLowerCase().includes("already")) {
    throw createUserRes.error;
  }

  if (createUserRes.data?.user?.id) {
    adminUserId = createUserRes.data.user.id;
  } else {
    const usersRes = await supabase.auth.admin.listUsers();
    if (usersRes.error) throw usersRes.error;
    const existing = usersRes.data.users.find((u) => u.email?.toLowerCase() === adminEmail.toLowerCase());
    if (!existing?.id) {
      throw new Error("Failed to resolve admin user id after create/list.");
    }
    adminUserId = existing.id;
  }

  const companyRes = await supabase
    .from("companies")
    .upsert(
      {
        slug: companySlug,
        name: companyName,
        status: "active",
        created_by: adminUserId
      },
      { onConflict: "slug" }
    )
    .select("id")
    .single();
  if (companyRes.error) throw companyRes.error;
  const companyId = companyRes.data.id;

  const ownerRoleRes = await supabase
    .from("roles")
    .upsert(
      {
        company_id: companyId,
        key: "owner",
        name: "Owner",
        description: "System owner role",
        is_system: true,
        status: "active",
        created_by: adminUserId
      },
      { onConflict: "company_id,key" }
    )
    .select("id")
    .single();
  if (ownerRoleRes.error) throw ownerRoleRes.error;
  const ownerRoleId = ownerRoleRes.data.id;

  const profileRes = await supabase.from("profiles").upsert(
    {
      id: adminUserId,
      full_name: "First Admin"
    },
    { onConflict: "id" }
  );
  if (profileRes.error) throw profileRes.error;

  const memberRes = await supabase
    .from("company_members")
    .upsert(
      {
        company_id: companyId,
        user_id: adminUserId,
        role_id: ownerRoleId,
        member_status: "active",
        joined_at: new Date().toISOString()
      },
      { onConflict: "company_id,user_id" }
    );
  if (memberRes.error) throw memberRes.error;

  const allPermRes = await supabase.from("permissions").select("id");
  if (allPermRes.error) throw allPermRes.error;
  const rolePermRows = (allPermRes.data || []).map((p) => ({
    role_id: ownerRoleId,
    permission_id: p.id,
    created_by: adminUserId
  }));
  if (rolePermRows.length > 0) {
    const rolePermRes = await supabase
      .from("role_permissions")
      .upsert(rolePermRows, { onConflict: "role_id,permission_id" });
    if (rolePermRes.error) throw rolePermRes.error;
  }

  console.log(JSON.stringify({
    ok: true,
    adminUserId,
    companyId,
    ownerRoleId
  }, null, 2));
}

main().catch((error) => {
  console.error("[bootstrap-first-admin] failed:", error.message);
  process.exit(1);
});
