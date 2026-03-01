import { cookies } from "next/headers";

import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";

import { getPublicEnv } from "@/lib/env";

export async function createClient() {
  const env = getPublicEnv();
  const cookieStore = await cookies();

  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return cookieStore.getAll();
    },
    setAll(cookiesToSet) {
      try {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      } catch (error) {
        // The `setAll` method was called from a Server Component.
        // This can be ignored if you have middleware refreshing
        // user sessions.
      }
    },
  };

  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: cookieMethods,
  });
}
