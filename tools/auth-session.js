const ACTIVE_COMPANY_KEY = "afr.activeCompanyId";

async function getPublicConfig() {
  const res = await fetch("/api/public-config");
  if (!res.ok) throw new Error("Failed to load public config");
  const data = await res.json();
  if (!data?.config?.supabaseUrl || !data?.config?.supabaseAnonKey) {
    throw new Error("Missing frontend Supabase config. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }
  return data.config;
}

export async function createAuthState() {
  const { createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm");
  const config = await getPublicConfig();
  const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });

  const state = {
    config,
    supabase,
    session: null,
    user: null,
    memberships: [],
    activeCompanyId: null,
    permissions: []
  };

  const initial = await supabase.auth.getSession();
  state.session = initial.data?.session || null;
  state.user = state.session?.user || null;

  return state;
}

export function getActiveCompanyId(state) {
  return state.activeCompanyId;
}

export function getSessionToken(state) {
  return state.session?.access_token || null;
}

export async function signInWithPassword(state, email, password) {
  const { data, error } = await state.supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  state.session = data.session || null;
  state.user = data.user || data.session?.user || null;
  return data;
}

export async function signOut(state) {
  const { error } = await state.supabase.auth.signOut();
  if (error) throw error;
  state.session = null;
  state.user = null;
  state.memberships = [];
  state.activeCompanyId = null;
  state.permissions = [];
}

function resolveActiveCompany(memberships) {
  const stored = localStorage.getItem(ACTIVE_COMPANY_KEY);
  if (stored && memberships.some((m) => m.company_id === stored)) return stored;
  return memberships[0]?.company_id || null;
}

export function setActiveCompany(state, companyId) {
  if (!companyId) {
    state.activeCompanyId = null;
    state.permissions = [];
    localStorage.removeItem(ACTIVE_COMPANY_KEY);
    return;
  }
  state.activeCompanyId = companyId;
  localStorage.setItem(ACTIVE_COMPANY_KEY, companyId);
  const current = state.memberships.find((m) => m.company_id === companyId);
  state.permissions = current?.permissions || [];
}

export async function refreshAuthContext(state) {
  if (!state.session?.access_token) {
    state.user = null;
    state.memberships = [];
    setActiveCompany(state, null);
    return state;
  }

  const res = await fetch("/api/auth-context", {
    headers: {
      Authorization: `Bearer ${state.session.access_token}`
    }
  });
  if (!res.ok) {
    if (res.status === 401) {
      await signOut(state);
      return state;
    }
    const errorPayload = await res.json().catch(() => ({}));
    throw new Error(errorPayload.message || "Failed to load auth context");
  }

  const data = await res.json();
  state.user = data.user || state.user;
  state.memberships = data.memberships || [];
  const active = resolveActiveCompany(state.memberships);
  setActiveCompany(state, active);
  return state;
}

export function onAuthStateChanged(state, cb) {
  return state.supabase.auth.onAuthStateChange((_event, session) => {
    setTimeout(async () => {
      state.session = session || null;
      if (!session) {
        state.user = null;
        state.memberships = [];
        setActiveCompany(state, null);
        cb(state);
        return;
      }
      try {
        await refreshAuthContext(state);
      } catch {
        // Ignore callback fetch errors; page-level handlers will show status.
      }
      cb(state);
    }, 0);
  });
}
