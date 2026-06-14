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
  const page = parseInt(c.req.query("page") || "1", 10);
  const pageSize = parseInt(c.req.query("pageSize") || "100", 10);
  const data = await listCategoriesModel(supabase, page, pageSize);
  return c.json(data);
}

export async function createCategory(c: Context) {
  const admin = await requireAdmin(c.req.raw);
  const supabase = createAuthClient(admin.accessToken);
  const payload = (await c.req.json()) as { name?: string; slug?: string; description?: string | null };

  if (!payload.name) {
    return c.json({ error: "name is required" }, 422);
  }

  const data = await createCategoryModel(supabase, payload);
  return c.json(data, 201);
}

export async function updateCategory(c: Context) {
  const admin = await requireAdmin(c.req.raw);
  const supabase = createAuthClient(admin.accessToken);
  const payload = (await c.req.json()) as { name?: string; slug?: string; description?: string | null };

  if (!payload.name && !payload.slug && payload.description === undefined) {
    return c.json({ error: "at least one field (name, slug, description) is required" }, 422);
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
