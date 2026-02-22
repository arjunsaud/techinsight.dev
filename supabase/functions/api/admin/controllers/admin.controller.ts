import type { Context } from "jsr:@hono/hono";

import { requireAdmin } from "../../../shared/auth.ts";
import {
  createAuthClient,
  createPublicClient,
} from "../../../shared/client.ts";
import {
  getDashboardModel,
  getUserRoleModel,
  listCommentsModel,
  listUsersModel,
} from "../models/admin.model.ts";

export async function adminLogin(c: Context) {
  const payload = (await c.req.json()) as {
    email?: string;
    password?: string;
  };

  if (!payload.email || !payload.password) {
    return c.json({ error: "email and password are required" }, 422);
  }

  const publicClient = createPublicClient();
  const { data, error } = await publicClient.auth.signInWithPassword({
    email: payload.email,
    password: payload.password,
  });

  if (error || !data.session || !data.user) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const authedClient = createAuthClient(data.session.access_token);
  const role = await getUserRoleModel(authedClient, data.user.id);

  if (role !== "admin" && role !== "superadmin") {
    return c.json({ error: "Forbidden" }, 403);
  }

  return c.json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_in: data.session.expires_in,
    token_type: data.session.token_type,
  });
}

export async function getDashboard(c: Context) {
  const admin = await requireAdmin(c.req.raw);
  const supabase = createAuthClient(admin.accessToken);

  const data = await getDashboardModel(supabase);
  return c.json(data);
}

export async function getMe(c: Context) {
  const admin = await requireAdmin(c.req.raw);

  return c.json({
    id: admin.id,
    email: admin.email,
    role: admin.role,
  });
}

export async function listUsers(c: Context) {
  const admin = await requireAdmin(c.req.raw);
  const supabase = createAuthClient(admin.accessToken);

  const data = await listUsersModel(supabase);
  return c.json(data);
}

export async function listComments(c: Context) {
  const admin = await requireAdmin(c.req.raw);
  const supabase = createAuthClient(admin.accessToken);

  const data = await listCommentsModel(supabase);
  return c.json(data);
}
