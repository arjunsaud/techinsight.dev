import type { Context } from "jsr:@hono/hono";

import { requireAdmin } from "../../../shared/auth.ts";
import {
  createAuthClient,
  createPublicClient,
} from "../../../shared/client.ts";
import {
  createTagModel,
  deleteTagModel,
  listTagsModel,
  updateTagModel,
} from "../models/tag.model.ts";

export async function listTags(c: Context) {
  const supabase = createPublicClient();
  const data = await listTagsModel(supabase);
  return c.json(data);
}

export async function createTag(c: Context) {
  const admin = await requireAdmin(c.req.raw);
  const supabase = createAuthClient(admin.accessToken);
  const payload = (await c.req.json()) as { name?: string; slug?: string };

  if (!payload.name) {
    return c.json({ error: "name is required" }, 422);
  }

  const data = await createTagModel(supabase, payload);
  return c.json(data, 201);
}

export async function updateTag(c: Context) {
  const admin = await requireAdmin(c.req.raw);
  const supabase = createAuthClient(admin.accessToken);
  const payload = (await c.req.json()) as { name?: string; slug?: string };

  if (!payload.name && !payload.slug) {
    return c.json({ error: "name or slug is required" }, 422);
  }

  const data = await updateTagModel(supabase, c.req.param("tagId"), payload);

  if (!data) {
    return c.json({ error: "Tag not found" }, 404);
  }

  return c.json(data);
}

export async function deleteTag(c: Context) {
  const admin = await requireAdmin(c.req.raw);
  const supabase = createAuthClient(admin.accessToken);
  await deleteTagModel(supabase, c.req.param("tagId"));
  return c.body(null, 204);
}
