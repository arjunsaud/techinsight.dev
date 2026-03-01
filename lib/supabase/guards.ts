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
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(nextPath);
  }

  const { data: profile, error } = await supabase
    .from("superadmins")
    .select("role")
    .eq("id", user.id)
    .single();

  if (
    error ||
    !profile ||
    (profile.role !== "admin" && profile.role !== "superadmin")
  ) {
    redirect("/admin/login");
  }

  // To maintain compatibility with existing pages that expect a session-like object
  // we can return a mock session or just the user.
  // Most callers only care about access_token if they call services.
  // We can get the session to get the access token if needed, or just return the user.
  // Wait, some pages do `session.access_token`.

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) redirect(nextPath);
  return session;
}

export async function requireSuperAdmin(nextPath: Route = "/admin/login") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(nextPath);
  }

  const { data: profile, error } = await supabase
    .from("superadmins")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || !profile || profile.role !== "superadmin") {
    redirect("/admin/login");
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) redirect(nextPath);
  return session;
}
