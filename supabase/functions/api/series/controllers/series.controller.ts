import type { Context } from "jsr:@hono/hono";
import { getOptionalAuth, requireAdmin } from "../../../shared/auth.ts";
import { createAuthClient, createPublicClient } from "../../../shared/client.ts";
import {
  listSeriesModel,
  getSeriesByIdOrSlugModel,
  createSeriesModel,
  updateSeriesModel,
  deleteSeriesModel,
  getSeriesWithPostsModel,
  getPostSeriesInfoModel,
  createSeriesPostModel,
  updateSeriesPostModel,
  deleteSeriesPostModel,
  getSeriesPostByIdModel,
  getSeriesPostBySlugModel,
  reorderSeriesPostsModel,
} from "../models/series.model.ts";

export async function listSeries(c: Context) {
  const maybeUser = await getOptionalAuth(c.req.raw);
  const isAdmin =
    maybeUser?.role === "admin" || maybeUser?.role === "superadmin";

  const supabase = maybeUser
    ? createAuthClient(maybeUser.accessToken)
    : createPublicClient();

  const data = await listSeriesModel(supabase, {
    status: c.req.query("status") ?? undefined,
    isAdmin,
  });

  return c.json(data);
}

export async function getSeries(c: Context) {
  const idOrSlug = c.req.param("idOrSlug") || c.req.param("slug");
  const supabase = createPublicClient();

  // If query param 'withPosts' is true, return series with its posts
  const withPosts = c.req.query("withPosts") === "true";

  let data;
  if (withPosts) {
    data = await getSeriesWithPostsModel(supabase, idOrSlug);
  } else {
    data = await getSeriesByIdOrSlugModel(supabase, idOrSlug);
  }

  if (!data) {
    return c.json({ error: "Series not found" }, 404);
  }

  return c.json(data);
}

export async function createSeries(c: Context) {
  const admin = await requireAdmin(c.req.raw);
  const supabase = createAuthClient(admin.accessToken);
  const payload = await c.req.json();

  if (!payload.title) {
    return c.json({ error: "title is required" }, 422);
  }

  const data = await createSeriesModel(supabase, payload);
  return c.json(data, 201);
}

export async function updateSeries(c: Context) {
  const admin = await requireAdmin(c.req.raw);
  const supabase = createAuthClient(admin.accessToken);
  const payload = await c.req.json();
  const id = c.req.param("id");

  const data = await updateSeriesModel(supabase, id, payload);
  if (!data) {
    return c.json({ error: "Series not found" }, 404);
  }

  return c.json(data);
}

export async function deleteSeries(c: Context) {
  const admin = await requireAdmin(c.req.raw);
  const supabase = createAuthClient(admin.accessToken);
  const id = c.req.param("id");

  await deleteSeriesModel(supabase, id);
  return c.body(null, 204);
}

export async function getPostSeriesInfo(c: Context) {
  const postSlug = c.req.param("postSlug");
  const supabase = createPublicClient();

  const data = await getPostSeriesInfoModel(supabase, postSlug);
  if (!data) {
    return c.json({ inSeries: false });
  }

  return c.json({ inSeries: true, ...data });
}

// Standalone Series Posts Handlers
export async function getSeriesPost(c: Context) {
  const postId = c.req.param("postId");
  const supabase = createPublicClient();

  const data = await getSeriesPostByIdModel(supabase, postId);
  if (!data) {
    return c.json({ error: "Post not found" }, 404);
  }

  return c.json(data);
}

export async function getSeriesPostBySlug(c: Context) {
  const slug = c.req.param("slug");
  const supabase = createPublicClient();

  const data = await getSeriesPostBySlugModel(supabase, slug);
  if (!data) {
    return c.json({ error: "Post not found" }, 404);
  }

  return c.json(data);
}

export async function reorderSeriesPosts(c: Context) {
  const admin = await requireAdmin(c.req.raw);
  const supabase = createAuthClient(admin.accessToken);
  const seriesId = c.req.param("id");
  const { postIds } = await c.req.json();

  if (!Array.isArray(postIds)) {
    return c.json({ error: "postIds must be an array" }, 400);
  }

  try {
    await reorderSeriesPostsModel(supabase, seriesId, postIds);
    return c.json({ success: true });
  } catch (error: any) {
    console.error("Reorder controller error:", error);
    return c.json({ error: error.message }, 500);
  }
}

export async function createSeriesPost(c: Context) {
  const admin = await requireAdmin(c.req.raw);
  const supabase = createAuthClient(admin.accessToken);
  const seriesId = c.req.param("id");
  const payload = await c.req.json();

  if (!payload.title || !payload.content) {
    return c.json({ error: "title and content are required" }, 422);
  }

  const data = await createSeriesPostModel(supabase, seriesId, payload);
  return c.json(data, 201);
}

export async function updateSeriesPost(c: Context) {
  const admin = await requireAdmin(c.req.raw);
  const supabase = createAuthClient(admin.accessToken);
  const postId = c.req.param("postId");
  const payload = await c.req.json();

  const data = await updateSeriesPostModel(supabase, postId, payload);
  if (!data) {
    return c.json({ error: "Post not found" }, 404);
  }

  return c.json(data);
}

export async function deleteSeriesPost(c: Context) {
  const admin = await requireAdmin(c.req.raw);
  const supabase = createAuthClient(admin.accessToken);
  const postId = c.req.param("postId");

  await deleteSeriesPostModel(supabase, postId);
  return c.body(null, 204);
}
