import { redirect } from "next/navigation";
import type { Route } from "next";

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

  const { data: profile, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (
    error ||
    !profile ||
    (profile.role !== "admin" && profile.role !== "superadmin")
  ) {
    redirect("/admin/login");
  }

  return session;
}

export async function requireSuperAdmin(nextPath: Route = "/admin/login") {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect(nextPath);
  }

  const { data: profile, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (error || !profile || profile.role !== "superadmin") {
    redirect("/admin/login");
  }

  return session;
}
