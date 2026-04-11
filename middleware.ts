import { NextResponse, type NextRequest } from "next/server";

import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";

import { getPublicEnv } from "@/lib/env";

export async function middleware(request: NextRequest) {
  const env = getPublicEnv();
  let supabaseResponse = NextResponse.next({ request });

  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return request.cookies.getAll();
    },
    setAll(cookiesToSet) {
      cookiesToSet.forEach(({ name, value }) => {
        request.cookies.set(name, value);
      });
      supabaseResponse = NextResponse.next({ request });
      cookiesToSet.forEach(({ name, value, options }) => {
        supabaseResponse.cookies.set(name, value, options);
      });
    },
  };

  const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: cookieMethods,
  });

  // Refresh the session — this keeps cookies alive across navigations.
  // IMPORTANT: getUser() contacts the Supabase Auth server and is tamper-proof.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect /admin/(protected) routes at the edge
  const isProtectedAdmin = request.nextUrl.pathname.startsWith("/admin") &&
    !request.nextUrl.pathname.startsWith("/admin/login") &&
    !request.nextUrl.pathname.startsWith("/admin/forgot-password") &&
    !request.nextUrl.pathname.startsWith("/admin/reset-password");

  if (isProtectedAdmin && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Public assets (svg, png, jpg, jpeg, gif, webp)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
