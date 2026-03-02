import type { Context } from "jsr:@hono/hono";

import { requireAdmin } from "../../../shared/auth.ts";
import {
  createAuthClient,
  createPublicClient,
} from "../../../shared/client.ts";
import {
  createCategoryModel,
  deleteCategoryModel,
  listCategoriesModel,
  updateCategoryModel,
} from "../models/category.model.ts";

export async function listCategories(c: Context) {
  const supabase = createPublicClient();
  const data = await listCategoriesModel(supabase);
  return c.json(data);
}

export async function createCategory(c: Context) {
  const admin = await requireAdmin(c.req.raw);
  const supabase = createAuthClient(admin.accessToken);
  const payload = (await c.req.json()) as { name?: string; slug?: string };

  if (!payload.name) {
    return c.json({ error: "name is required" }, 422);
  }

  const data = await createCategoryModel(supabase, payload);
  return c.json(data, 201);
}

export async function updateCategory(c: Context) {
  const admin = await requireAdmin(c.req.raw);
  const supabase = createAuthClient(admin.accessToken);
  const payload = (await c.req.json()) as { name?: string; slug?: string };

  if (!payload.name && !payload.slug) {
    return c.json({ error: "name or slug is required" }, 422);
  }

  const data = await updateCategoryModel(
    supabase,
    c.req.param("categoryId"),
    payload,
  );

  if (!data) {
    return c.json({ error: "Category not found" }, 404);
  }

  return c.json(data);
}

export async function deleteCategory(c: Context) {
  const admin = await requireAdmin(c.req.raw);
  const supabase = createAuthClient(admin.accessToken);
  await deleteCategoryModel(supabase, c.req.param("categoryId"));
  return c.body(null, 204);
}
