import { redirect } from "next/navigation";
import type { Route } from "next";

import { adminService } from "@/services/admin-service";
import { createClient } from "@/lib/supabase/server";

export async function requireSession(nextPath: Route = "/admin/login") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(nextPath);
  }

  return user;
}

export async function requireAdmin(nextPath: Route = "/admin/login") {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect(nextPath);
  }

  try {
    const me = await adminService.getMe(session.access_token);
    if (me.role !== "admin" && me.role !== "superadmin") {
      redirect("/blogs");
    }
  } catch {
    redirect("/blogs");
  }

  return session.user;
}

export async function requireSuperAdmin(nextPath: Route = "/admin/login") {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect(nextPath);
  }

  try {
    const me = await adminService.getMe(session.access_token);
    if (me.role !== "superadmin") {
      redirect("/blogs");
    }
  } catch {
    redirect("/blogs");
  }

  return session.user;
}
