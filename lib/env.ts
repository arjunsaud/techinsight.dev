export function getPublicEnv() {
  const isBrowser = typeof window !== "undefined";

  const appUrl = (isBrowser ? window.__ENV__?.APP_URL : (process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL)) ?? "http://localhost:3000";
  const supabaseUrl = isBrowser ? window.__ENV__?.SUPABASE_URL : (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL);
  const supabaseAnonKey = isBrowser ? window.__ENV__?.SUPABASE_ANON_KEY : (process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const gaId = isBrowser ? window.__ENV__?.GA_ID : (process.env.GA_ID || process.env.NEXT_PUBLIC_GA_ID);

  if (!supabaseUrl || !supabaseAnonKey) {
    const missing = [
      !supabaseUrl ? "SUPABASE_URL" : null,
      !supabaseAnonKey ? "SUPABASE_ANON_KEY" : null
    ].filter(Boolean);
    throw new Error(
      `Missing required environment variable(s): ${missing.join(", ")}. ` +
        "Add them to your deployment environment."
    );
  }

  return {
    appUrl: appUrl.replace(/\/+$/, ""),
    supabaseUrl,
    supabaseAnonKey,
    gaId
  };
}

