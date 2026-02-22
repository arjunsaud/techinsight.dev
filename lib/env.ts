export function getPublicEnv() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    const missing = [
      !supabaseUrl ? "NEXT_PUBLIC_SUPABASE_URL" : null,
      !supabaseAnonKey ? "NEXT_PUBLIC_SUPABASE_ANON_KEY" : null
    ].filter(Boolean);
    throw new Error(
      `Missing required environment variable(s): ${missing.join(", ")}. ` +
        "Add them in .env.local and restart the Next.js dev server."
    );
  }

  return {
    appUrl,
    supabaseUrl,
    supabaseAnonKey
  };
}
